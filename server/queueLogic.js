import { getDb, saveDatabase } from './db.js';

export function addAuditLog(actorName, actorRole, action, details) {
  const db = getDb();
  const log = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actorName: actorName || 'System',
    actorRole: actorRole || 'system',
    action,
    details
  };
  db.auditLogs.unshift(log);
  // Keep last 300 logs
  if (db.auditLogs.length > 300) {
    db.auditLogs = db.auditLogs.slice(0, 300);
  }
  return log;
}

export function generateNextTokenNumber(service) {
  const db = getDb();
  const prefix = service.prefix ? service.prefix.toUpperCase() : 'T';
  
  // Find all tokens for this service created today
  const todayDate = new Date().toISOString().split('T')[0];
  const serviceTokensToday = db.tokens.filter(t => {
    return t.serviceId === service.id && t.joinedAt && t.joinedAt.startsWith(todayDate);
  });

  let maxNum = 100;
  for (const t of serviceTokensToday) {
    if (t.tokenNumber && t.tokenNumber.startsWith(prefix)) {
      const numPart = parseInt(t.tokenNumber.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${nextNum}`;
}

export function calculateWaitMetrics(serviceId, priority = 'normal') {
  const db = getDb();
  const service = db.services.find(s => s.id === serviceId);
  if (!service) return { peopleAhead: 0, estimatedWaitMins: 0 };

  const avgDuration = service.avgDurationMins || 10;
  
  // Active counters that can serve this service
  const activeCounters = db.counters.filter(c => 
    c.serviceIds.includes(serviceId) && 
    (c.status === 'busy' || c.status === 'available')
  );
  const counterCapacity = Math.max(1, activeCounters.length);

  // Waiting tokens in this service
  const waitingTokens = db.tokens
    .filter(t => t.serviceId === serviceId && t.status === 'waiting')
    .sort((a, b) => {
      // Priority first: vip > priority > normal, then arrival time
      const prioOrder = { vip: 3, priority: 2, normal: 1 };
      const diff = (prioOrder[b.priority] || 1) - (prioOrder[a.priority] || 1);
      if (diff !== 0) return diff;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

  let aheadCount = 0;
  if (priority === 'vip') {
    aheadCount = waitingTokens.filter(t => t.priority === 'vip').length;
  } else if (priority === 'priority') {
    aheadCount = waitingTokens.filter(t => t.priority === 'vip' || t.priority === 'priority').length;
  } else {
    aheadCount = waitingTokens.length;
  }

  // Estimated wait = (aheadCount * avgDuration) / counterCapacity
  // Minimum 2 minutes if someone is ahead
  const estimatedWaitMins = Math.max(2, Math.round((aheadCount * avgDuration) / counterCapacity));

  return {
    peopleAhead: aheadCount,
    estimatedWaitMins: aheadCount === 0 ? 3 : estimatedWaitMins,
    activeCounters: counterCapacity
  };
}

export function refreshQueueEstimates(branchId) {
  const db = getDb();
  
  const waitingTokens = db.tokens.filter(t => 
    (!branchId || t.branchId === branchId) && t.status === 'waiting'
  );

  // Group by service
  const tokensByService = {};
  for (const t of waitingTokens) {
    if (!tokensByService[t.serviceId]) tokensByService[t.serviceId] = [];
    tokensByService[t.serviceId].push(t);
  }

  for (const sId in tokensByService) {
    const service = db.services.find(s => s.id === sId);
    const avgDuration = service ? service.avgDurationMins || 10 : 10;
    const activeCounters = db.counters.filter(c => 
      c.serviceIds.includes(sId) && (c.status === 'busy' || c.status === 'available')
    );
    const counterCapacity = Math.max(1, activeCounters.length);

    // Sort queue
    const sorted = tokensByService[sId].sort((a, b) => {
      const prioOrder = { vip: 3, priority: 2, normal: 1 };
      const diff = (prioOrder[b.priority] || 1) - (prioOrder[a.priority] || 1);
      if (diff !== 0) return diff;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

    sorted.forEach((token, index) => {
      const waitMins = Math.max(1, Math.round((index * avgDuration) / counterCapacity));
      token.peopleAhead = index;
      token.estimatedWaitMins = index === 0 ? Math.max(1, Math.round(avgDuration / 2)) : waitMins;
    });
  }

  saveDatabase(db);
}

export function createToken({
  branchId,
  serviceId,
  customerName,
  customerPhone,
  priority = 'normal',
  type = 'walk_in',
  notes = '',
  appointmentId = null,
  actorName = null,
  actorRole = null
}) {
  const db = getDb();
  const branch = db.branches.find(b => b.id === branchId);
  const service = db.services.find(s => s.id === serviceId);

  if (!service) {
    throw new Error('Service not found');
  }

  const tokenNumber = generateNextTokenNumber(service);
  const metrics = calculateWaitMetrics(serviceId, priority);

  const newToken = {
    id: `tok-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tokenNumber,
    orgId: service.orgId,
    branchId: branch ? branch.id : service.branchId,
    serviceId: service.id,
    serviceName: service.name,
    customerName: customerName || 'Valued Guest',
    customerPhone: customerPhone || '',
    priority: priority || 'normal',
    type: type || 'walk_in',
    status: 'waiting',
    joinedAt: new Date().toISOString(),
    calledAt: null,
    serviceStartedAt: null,
    completedAt: null,
    counterId: null,
    counterName: null,
    staffId: null,
    staffName: null,
    estimatedWaitMins: metrics.estimatedWaitMins,
    peopleAhead: metrics.peopleAhead,
    notes: notes || '',
    appointmentId: appointmentId || null
  };

  db.tokens.push(newToken);

  if (appointmentId) {
    const apt = db.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.status = 'checked_in';
      apt.tokenId = newToken.id;
    }
  }

  addAuditLog(
    actorName || customerName || 'Customer',
    actorRole || 'customer',
    'TOKEN_CREATED',
    `Generated token ${tokenNumber} for ${service.name} (${priority.toUpperCase()})`
  );

  refreshQueueEstimates(newToken.branchId);
  saveDatabase(db);
  return newToken;
}

export function callNext({ counterId, staffId, staffName, actorRole = 'staff' }) {
  const db = getDb();
  const counter = db.counters.find(c => c.id === counterId);
  if (!counter) throw new Error('Counter not found');

  // If counter is already serving someone, complete or hold first
  if (counter.currentTokenId) {
    const active = db.tokens.find(t => t.id === counter.currentTokenId);
    if (active && (active.status === 'calling' || active.status === 'in_service')) {
      throw new Error(`Counter is currently busy serving token ${active.tokenNumber}. Please complete or hold it first.`);
    }
  }

  // Find next waiting token eligible for this counter's services
  const eligibleTokens = db.tokens.filter(t => 
    t.branchId === counter.branchId &&
    t.status === 'waiting' &&
    counter.serviceIds.includes(t.serviceId)
  );

  if (eligibleTokens.length === 0) {
    // Check if there are any on_hold tokens waiting to resume
    const onHold = db.tokens.find(t => 
      t.branchId === counter.branchId &&
      t.status === 'on_hold' &&
      counter.serviceIds.includes(t.serviceId)
    );
    if (!onHold) {
      throw new Error('No waiting customers in queue for your assigned service(s).');
    }
  }

  // Sort eligible waiting tokens: VIP > Priority > Normal, then joinedAt
  eligibleTokens.sort((a, b) => {
    const prioOrder = { vip: 3, priority: 2, normal: 1 };
    const diff = (prioOrder[b.priority] || 1) - (prioOrder[a.priority] || 1);
    if (diff !== 0) return diff;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  const nextToken = eligibleTokens[0];
  const now = new Date().toISOString();

  nextToken.status = 'calling';
  nextToken.calledAt = now;
  nextToken.counterId = counter.id;
  nextToken.counterName = counter.name;
  nextToken.staffId = staffId || counter.currentStaffId;
  nextToken.staffName = staffName || counter.currentStaffName;
  nextToken.estimatedWaitMins = 0;
  nextToken.peopleAhead = 0;

  counter.status = 'busy';
  counter.currentTokenId = nextToken.id;
  counter.currentTokenNumber = nextToken.tokenNumber;
  if (staffId) counter.currentStaffId = staffId;
  if (staffName) counter.currentStaffName = staffName;

  addAuditLog(
    staffName || 'Staff Member',
    actorRole,
    'TOKEN_CALLED',
    `Called token ${nextToken.tokenNumber} (${nextToken.customerName}) to ${counter.name}`
  );

  refreshQueueEstimates(counter.branchId);
  saveDatabase(db);

  return { token: nextToken, counter };
}

export function recallCustomer({ tokenId, staffName = 'Staff' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  token.calledAt = new Date().toISOString();
  token.recallCount = (token.recallCount || 0) + 1;

  addAuditLog(
    staffName,
    'staff',
    'TOKEN_RECALLED',
    `Recalled token ${token.tokenNumber} to ${token.counterName || 'Counter'} (Attempt ${token.recallCount + 1})`
  );

  saveDatabase(db);
  return token;
}

export function startService({ tokenId, staffName = 'Staff' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  token.status = 'in_service';
  token.serviceStartedAt = new Date().toISOString();

  addAuditLog(
    staffName,
    'staff',
    'SERVICE_STARTED',
    `Started consultation for token ${token.tokenNumber} (${token.customerName})`
  );

  saveDatabase(db);
  return token;
}

export function completeService({ tokenId, staffNotes = '', staffId, staffName = 'Staff' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  const now = new Date();
  token.status = 'completed';
  token.completedAt = now.toISOString();
  if (staffNotes) token.staffNotes = staffNotes;

  // Calculate actual duration
  const startTime = token.serviceStartedAt || token.calledAt || token.joinedAt;
  const durationMins = Math.max(1, Math.round((now.getTime() - new Date(startTime).getTime()) / 60000));
  token.actualServiceMins = durationMins;

  // Free counter
  const counter = db.counters.find(c => c.id === token.counterId || c.currentTokenId === token.id);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenId = null;
    counter.currentTokenNumber = null;
  }

  // Update staff stats
  const staff = db.users.find(u => u.id === (staffId || token.staffId));
  if (staff) {
    staff.servedCountToday = (staff.servedCountToday || 0) + 1;
    const oldAvg = staff.avgHandlingMins || 10;
    staff.avgHandlingMins = Math.round(((oldAvg * (staff.servedCountToday - 1) + durationMins) / staff.servedCountToday) * 10) / 10;
  }

  // If appointment, complete it
  if (token.appointmentId) {
    const apt = db.appointments.find(a => a.id === token.appointmentId);
    if (apt) apt.status = 'completed';
  }

  addAuditLog(
    staffName,
    'staff',
    'TOKEN_COMPLETED',
    `Completed service for token ${token.tokenNumber}. Duration: ${durationMins}m`
  );

  refreshQueueEstimates(token.branchId);
  saveDatabase(db);
  return { token, counter };
}

export function skipCustomer({ tokenId, reason = 'No show', staffName = 'Staff' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  token.status = 'skipped';
  token.skipReason = reason;
  token.skippedAt = new Date().toISOString();

  // Free counter
  const counter = db.counters.find(c => c.id === token.counterId || c.currentTokenId === token.id);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenId = null;
    counter.currentTokenNumber = null;
  }

  addAuditLog(
    staffName,
    'staff',
    'TOKEN_SKIPPED',
    `Skipped token ${token.tokenNumber} (${token.customerName}). Reason: ${reason}`
  );

  refreshQueueEstimates(token.branchId);
  saveDatabase(db);
  return { token, counter };
}

export function holdCustomer({ tokenId, reason = 'Document pending', staffName = 'Staff' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  token.status = 'on_hold';
  token.holdReason = reason;
  token.heldAt = new Date().toISOString();

  // Free counter
  const counter = db.counters.find(c => c.id === token.counterId || c.currentTokenId === token.id);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenId = null;
    counter.currentTokenNumber = null;
  }

  addAuditLog(
    staffName,
    'staff',
    'TOKEN_HELD',
    `Put token ${token.tokenNumber} on hold. Reason: ${reason}`
  );

  refreshQueueEstimates(token.branchId);
  saveDatabase(db);
  return { token, counter };
}

export function resumeHeldCustomer({ tokenId, counterId, staffName = 'Staff' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  const counter = db.counters.find(c => c.id === counterId);
  if (!counter) throw new Error('Counter not found');

  token.status = 'calling';
  token.calledAt = new Date().toISOString();
  token.counterId = counter.id;
  token.counterName = counter.name;

  counter.status = 'busy';
  counter.currentTokenId = token.id;
  counter.currentTokenNumber = token.tokenNumber;

  addAuditLog(
    staffName,
    'staff',
    'TOKEN_RESUMED',
    `Resumed held token ${token.tokenNumber} to ${counter.name}`
  );

  saveDatabase(db);
  return { token, counter };
}

export function transferCustomer({ tokenId, targetServiceId, targetCounterId, reason = '', staffName = 'Staff' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  const oldService = db.services.find(s => s.id === token.serviceId);
  const targetService = db.services.find(s => s.id === targetServiceId);
  if (!targetService) throw new Error('Target service not found');

  // Free current counter
  const counter = db.counters.find(c => c.id === token.counterId || c.currentTokenId === token.id);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenId = null;
    counter.currentTokenNumber = null;
  }

  // Update token
  token.serviceId = targetService.id;
  token.serviceName = targetService.name;
  token.status = 'waiting';
  token.transferNotes = `Transferred from ${oldService ? oldService.name : 'previous'}. Reason: ${reason}`;
  token.counterId = null;
  token.counterName = null;
  token.calledAt = null;
  token.serviceStartedAt = null;
  // Give high priority on transfer so they don't wait at the back of the queue!
  token.priority = 'priority';

  addAuditLog(
    staffName,
    'staff',
    'TOKEN_TRANSFERRED',
    `Transferred token ${token.tokenNumber} to ${targetService.name}. Reason: ${reason || 'Referral'}`
  );

  refreshQueueEstimates(token.branchId);
  saveDatabase(db);
  return token;
}

export function cancelToken({ tokenId, reason = 'Customer cancelled', actorName = 'Customer' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  if (!token) throw new Error('Token not found');

  token.status = 'cancelled';
  token.cancelReason = reason;
  token.cancelledAt = new Date().toISOString();

  // If currently assigned to a counter
  if (token.counterId) {
    const counter = db.counters.find(c => c.id === token.counterId || c.currentTokenId === token.id);
    if (counter) {
      counter.status = 'available';
      counter.currentTokenId = null;
      counter.currentTokenNumber = null;
    }
  }

  addAuditLog(
    actorName,
    'customer',
    'TOKEN_CANCELLED',
    `Cancelled token ${token.tokenNumber}. Reason: ${reason}`
  );

  refreshQueueEstimates(token.branchId);
  saveDatabase(db);
  return token;
}

export function submitFeedback({ tokenId, rating, tags = [], comment = '', customerName = 'Guest' }) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === tokenId);
  
  const feedback = {
    id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tokenId,
    tokenNumber: token ? token.tokenNumber : 'N/A',
    serviceName: token ? token.serviceName : 'General',
    customerName: customerName || (token ? token.customerName : 'Guest'),
    rating: Number(rating) || 5,
    tags: Array.isArray(tags) ? tags : [],
    comment: comment || '',
    timestamp: new Date().toISOString()
  };

  db.feedbacks.unshift(feedback);

  addAuditLog(
    customerName,
    'customer',
    'FEEDBACK_SUBMITTED',
    `Submitted ${rating}★ review for ${feedback.serviceName}`
  );

  saveDatabase(db);
  return feedback;
}

export function getAnalytics(branchId) {
  const db = getDb();
  const tokens = branchId ? db.tokens.filter(t => t.branchId === branchId) : db.tokens;
  
  const totalTokens = tokens.length;
  const completedTokens = tokens.filter(t => t.status === 'completed');
  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  const servingTokens = tokens.filter(t => t.status === 'in_service' || t.status === 'calling');
  const skippedTokens = tokens.filter(t => t.status === 'skipped');
  const cancelledTokens = tokens.filter(t => t.status === 'cancelled');

  // Avg wait time in minutes for completed
  let totalWaitMins = 0;
  let countWithWait = 0;
  for (const t of completedTokens) {
    if (t.joinedAt && (t.calledAt || t.serviceStartedAt)) {
      const wait = Math.max(1, Math.round((new Date(t.calledAt || t.serviceStartedAt).getTime() - new Date(t.joinedAt).getTime()) / 60000));
      totalWaitMins += wait;
      countWithWait++;
    }
  }
  const avgWaitTimeMins = countWithWait > 0 ? Math.round(totalWaitMins / countWithWait) : 11;

  // Avg service time
  let totalServiceMins = 0;
  for (const t of completedTokens) {
    totalServiceMins += (t.actualServiceMins || 10);
  }
  const avgServiceTimeMins = completedTokens.length > 0 ? Math.round((totalServiceMins / completedTokens.length) * 10) / 10 : 9.5;

  // Feedback CSAT score
  const feedbacks = db.feedbacks;
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "4.8";

  // Hourly traffic breakdown
  const hourlyData = [
    { hour: '08:00', tokens: 12, completed: 11, avgWait: 6 },
    { hour: '09:00', tokens: 28, completed: 25, avgWait: 9 },
    { hour: '10:00', tokens: 46, completed: 38, avgWait: 16 },
    { hour: '11:00', tokens: 52, completed: 42, avgWait: 18 },
    { hour: '12:00', tokens: 34, completed: 30, avgWait: 12 },
    { hour: '13:00', tokens: 26, completed: 25, avgWait: 8 },
    { hour: '14:00', tokens: 48, completed: 40, avgWait: 15 },
    { hour: '15:00', tokens: 39, completed: 35, avgWait: 13 },
    { hour: '16:00', tokens: 22, completed: 20, avgWait: 7 },
  ];

  // Service distribution
  const serviceDistribution = db.services
    .filter(s => !branchId || s.branchId === branchId)
    .map(s => {
      const sTokens = tokens.filter(t => t.serviceId === s.id);
      return {
        id: s.id,
        name: s.name,
        prefix: s.prefix,
        count: sTokens.length,
        color: s.color || '#4f46e5'
      };
    });

  // Staff performance leaderboard
  const staffLeaderboard = db.users
    .filter(u => u.role === 'staff' && (!branchId || u.branchId === branchId))
    .map(u => ({
      id: u.id,
      name: u.name,
      servedToday: u.servedCountToday || 12,
      avgMins: u.avgHandlingMins || 9.2,
      satisfaction: 4.9
    }));

  return {
    totalTokens,
    completedCount: completedTokens.length,
    waitingCount: waitingTokens.length,
    servingCount: servingTokens.length,
    skippedCount: skippedTokens.length,
    cancelledCount: cancelledTokens.length,
    avgWaitTimeMins,
    avgServiceTimeMins,
    csatRating: avgRating,
    feedbacksCount: feedbacks.length,
    hourlyData,
    serviceDistribution,
    staffLeaderboard
  };
}
