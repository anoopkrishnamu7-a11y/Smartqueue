import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, saveDatabase, getInitialData } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// SSE Clients Registry for real-time synchronization
let sseClients = [];

export function broadcastEvent(event, data = {}) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client connection closed
    }
  });
}

// SSE stream endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = Date.now() + Math.random();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`event: connected\ndata: ${JSON.stringify({ message: "SSE connected", clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Heartbeat to keep connections alive
setInterval(() => {
  sseClients.forEach(c => {
    try {
      c.res.write(': keep-alive\n\n');
    } catch (e) {}
  });
}, 25000);

/**
 * Section 14: IMPORTANT TWO-MINUTE LOGIC
 * Calculates estimated wait time: peopleAhead * averageServiceDuration.
 * When estimated wait time reaches <= NOTIFICATION_THRESHOLD_MINUTES (default: 2),
 * triggers approaching notification.
 * Prevents sending duplicate notifications.
 */
function recalculateQueue(categoryKey) {
  const db = getDb();
  const thresholdMins = db.settings?.notificationThresholdMinutes || 2;

  const waitingTokens = db.tokens.filter(t => 
    (!categoryKey || t.categoryKey === categoryKey) && t.status === 'waiting'
  );

  // Group by service
  const byService = {};
  waitingTokens.forEach(t => {
    if (!byService[t.serviceId]) byService[t.serviceId] = [];
    byService[t.serviceId].push(t);
  });

  for (const sId in byService) {
    const service = db.services.find(s => s.id === sId);
    const avgDuration = service ? (service.avgDurationMins || 2) : 2;

    // Sort: priority / special assistance first, then arrival time
    const sorted = byService[sId].sort((a, b) => {
      const aPrio = a.priority === 'special_assistance' ? 2 : 1;
      const bPrio = b.priority === 'special_assistance' ? 2 : 1;
      if (bPrio !== aPrio) return bPrio - aPrio;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

    sorted.forEach((tok, idx) => {
      tok.peopleAhead = idx;
      // Formula: peopleAhead * averageServiceDuration (idx 0 is directly next in line)
      tok.estimatedWaitMins = idx === 0 ? Math.min(2, avgDuration) : idx * avgDuration;

      // Check if 2-minute threshold reached and notification not yet sent
      if (tok.estimatedWaitMins <= thresholdMins && !tok.twoMinAlertSent) {
        tok.twoMinAlertSent = true;

        // Record notification
        const notif = {
          id: `notif-${Date.now()}-${tok.id}`,
          timestamp: new Date().toISOString(),
          tokenNumber: tok.tokenNumber,
          title: "Your turn is approaching!",
          message: `Your token: ${tok.tokenNumber}. Only a few customers are ahead of you. Estimated time: About ${tok.estimatedWaitMins} minutes. Please get ready to approach the service counter.`,
          type: "two_minute_alert"
        };
        if (!db.notifications) db.notifications = [];
        db.notifications.unshift(notif);

        broadcastEvent('two-minute-alert', {
          token: tok,
          message: notif.message,
          notification: notif
        });
      }
    });
  }

  saveDatabase(db);
}

// -------------------------------------------------------------
// Core Bootstrap & Lookups
// -------------------------------------------------------------

app.get('/api/bootstrap', (req, res) => {
  const db = getDb();
  recalculateQueue();
  res.json({
    organization: db.organization,
    settings: db.settings,
    categories: db.categories,
    places: db.places,
    services: db.services,
    counters: db.counters,
    tokens: db.tokens,
    specialAssistanceRequests: db.specialAssistanceRequests,
    appointments: db.appointments || [],
    notifications: db.notifications || [],
    auditLogs: db.auditLogs || []
  });
});

app.get('/api/categories', (req, res) => {
  res.json(getDb().categories);
});

app.get('/api/places', (req, res) => {
  res.json(getDb().places);
});

app.get('/api/services', (req, res) => {
  const { placeId, categoryKey } = req.query;
  let services = getDb().services;
  if (placeId) services = services.filter(s => s.placeId === placeId);
  if (categoryKey) services = services.filter(s => s.categoryKey === categoryKey);
  res.json(services);
});

app.get('/api/counters', (req, res) => {
  const { placeId } = req.query;
  let counters = getDb().counters;
  if (placeId) counters = counters.filter(c => c.placeId === placeId);
  res.json(counters);
});

// -------------------------------------------------------------
// Authentication (Staff & Admin)
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;
  const db = getDb();

  const user = db.users.find(u => 
    u.username.toLowerCase() === (username || '').toLowerCase() &&
    u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password. Use demo credentials.' });
  }

  if (role && user.role !== role && user.role !== 'admin') {
    return res.status(403).json({ error: `User is not authorized for ${role} access.` });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      title: user.title,
      placeId: user.placeId
    },
    token: `sq-jwt-demo-${user.id}-${Date.now()}`
  });
});

// -------------------------------------------------------------
// Tokens & Queue Join
// -------------------------------------------------------------

app.get('/api/tokens', (req, res) => {
  const db = getDb();
  const { categoryKey, placeId, serviceId } = req.query;
  let tokens = db.tokens;
  if (categoryKey) tokens = tokens.filter(t => t.categoryKey === categoryKey);
  if (placeId) tokens = tokens.filter(t => t.placeId === placeId);
  if (serviceId) tokens = tokens.filter(t => t.serviceId === serviceId);
  res.json(tokens);
});

// Lookup token by tokenNumber or phone
app.get('/api/tokens/lookup', (req, res) => {
  const { phone, tokenNumber } = req.query;
  const db = getDb();
  let found = null;
  if (tokenNumber) {
    found = db.tokens.find(t => t.tokenNumber.toUpperCase() === tokenNumber.toUpperCase());
  } else if (phone) {
    found = db.tokens.filter(t => t.customerPhone.includes(phone) && t.status !== 'completed').slice(-1)[0];
  }
  if (!found) return res.status(404).json({ error: 'Token not found' });
  res.json(found);
});

// Create Token handler (used by both /api/tokens and /api/queue/join)
function handleJoinQueue(req, res) {
  try {
    const { placeId, serviceId, customerName, customerPhone, priority, assistanceCategory, supportDetails } = req.body;
    const db = getDb();

    const service = db.services.find(s => s.id === serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found. Please choose an active counter.' });

    const place = db.places.find(p => p.id === (placeId || service.placeId));

    // Duplicate check: Prevent duplicate active token for same mobile number & service
    if (customerPhone && customerPhone.trim() !== '') {
      const existing = db.tokens.find(t => 
        t.customerPhone === customerPhone.trim() && 
        t.serviceId === serviceId && 
        (t.status === 'waiting' || t.status === 'in_service')
      );
      if (existing) {
        return res.json({ ...existing, alreadyActive: true });
      }
    }

    // Sequence token number based on service prefix (e.g. H126, V106, B206)
    const prefix = service.prefix || 'T';
    let maxNum = prefix === 'H' ? 124 : prefix === 'V' ? 104 : 101;

    db.tokens.forEach(t => {
      if (t.tokenNumber && t.tokenNumber.startsWith(prefix)) {
        const num = parseInt(t.tokenNumber.slice(prefix.length), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    const nextTokenNumber = `${prefix}${maxNum + 1}`;
    
    // Calculate people ahead and initial wait estimate
    const currentWaiting = db.tokens.filter(t => t.serviceId === service.id && t.status === 'waiting').length;
    const duration = service.avgDurationMins || 2;
    const waitMins = Math.max(2, (currentWaiting + 1) * duration);

    const newToken = {
      id: `tok-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tokenNumber: nextTokenNumber,
      categoryKey: service.categoryKey,
      placeId: place ? place.id : service.placeId,
      placeName: place ? place.name : 'Service Center',
      serviceId: service.id,
      serviceName: service.name,
      customerName: (customerName || '').trim() || 'Valued Visitor',
      customerPhone: (customerPhone || '').trim(),
      status: 'waiting',
      priority: priority || 'normal',
      assistanceCategory: assistanceCategory || null,
      counterName: null,
      staffName: null,
      peopleAhead: currentWaiting,
      estimatedWaitMins: waitMins,
      twoMinAlertSent: false,
      finalTurnAlertSent: false,
      joinedAt: new Date().toISOString()
    };

    db.tokens.push(newToken);

    // If special assistance requested, create a special assistance request entry
    if (priority === 'special_assistance' || assistanceCategory) {
      const newSar = {
        id: `sar-${Date.now()}`,
        tokenId: newToken.id,
        tokenNumber: newToken.tokenNumber,
        customerName: newToken.customerName,
        customerPhone: newToken.customerPhone,
        placeId: newToken.placeId,
        placeName: newToken.placeName,
        serviceName: newToken.serviceName,
        category: assistanceCategory || 'other',
        categoryLabel: assistanceCategory ? assistanceCategory.replace('_', ' ').toUpperCase() : 'Special Support',
        supportDetails: supportDetails || 'Requested priority mobility & desk assistance.',
        requestDirectConsultant: service.categoryKey === 'hospital',
        status: 'pending',
        assignedRoom: null,
        submittedAt: new Date().toISOString()
      };
      db.specialAssistanceRequests.push(newSar);
      broadcastEvent('special-assistance-created', { request: newSar });
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'TOKEN_CREATED',
      actor: newToken.customerName,
      details: `Generated Token ${newToken.tokenNumber} for ${service.name} at ${newToken.placeName}`
    });

    recalculateQueue(service.categoryKey);
    saveDatabase(db);
    broadcastEvent('token-created', { token: newToken });

    res.status(201).json(newToken);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

app.post('/api/tokens', handleJoinQueue);
app.post('/api/queue/join', handleJoinQueue); // Section 27 alias

// GET /api/ticket/:id (Section 27)
app.get('/api/ticket/:id', (req, res) => {
  const db = getDb();
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Ticket not found' });
  res.json(token);
});

// GET /api/queue/:id (Section 27)
app.get('/api/queue/:id', (req, res) => {
  const db = getDb();
  const tokens = db.tokens.filter(t => t.serviceId === req.params.id || t.placeId === req.params.id);
  res.json({
    id: req.params.id,
    waiting: tokens.filter(t => t.status === 'waiting'),
    inService: tokens.filter(t => t.status === 'in_service'),
    completedCount: tokens.filter(t => t.status === 'completed').length
  });
});

// Cancel token
function handleCancelToken(req, res) {
  const db = getDb();
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });

  token.status = 'cancelled';
  token.cancelledAt = new Date().toISOString();

  // If assigned to a counter, free it
  const counter = db.counters.find(c => c.currentTokenNumber === token.tokenNumber);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenNumber = null;
  }

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TOKEN_CANCELLED',
    actor: token.customerName,
    details: `Cancelled Token ${token.tokenNumber}`
  });

  recalculateQueue(token.categoryKey);
  saveDatabase(db);
  broadcastEvent('token-cancelled', { token });
  res.json({ success: true, message: 'Your queue token has been cancelled.', token });
}

app.post('/api/tokens/:id/cancel', handleCancelToken);
app.post('/api/ticket/:id/cancel', handleCancelToken); // Section 27 alias

// -------------------------------------------------------------
// Staff Counter Actions (Call Next, Complete, Skip, Hold, Recall, Transfer)
// -------------------------------------------------------------

app.post('/api/counters/:id/call-next', (req, res) => {
  const db = getDb();
  const counter = db.counters.find(c => c.id === req.params.id);
  if (!counter) return res.status(404).json({ error: 'Counter not found' });

  // Auto-complete previous token at this counter if still in_service
  if (counter.currentTokenNumber) {
    const prev = db.tokens.find(t => t.tokenNumber === counter.currentTokenNumber && t.status === 'in_service');
    if (prev) {
      prev.status = 'completed';
      prev.completedAt = new Date().toISOString();
    }
  }

  // Find eligible waiting tokens for this counter
  let eligibleTokens = db.tokens.filter(t => 
    t.placeId === counter.placeId && t.status === 'waiting'
  );

  if (counter.serviceIds && counter.serviceIds.length > 0) {
    const specific = eligibleTokens.filter(t => counter.serviceIds.includes(t.serviceId));
    if (specific.length > 0) eligibleTokens = specific;
  }

  if (eligibleTokens.length === 0) {
    return res.status(400).json({ error: 'No waiting customers in this queue.' });
  }

  // Sort: special assistance first, then arrival time
  eligibleTokens.sort((a, b) => {
    const aPrio = a.priority === 'special_assistance' ? 2 : 1;
    const bPrio = b.priority === 'special_assistance' ? 2 : 1;
    if (bPrio !== aPrio) return bPrio - aPrio;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  const nextToken = eligibleTokens[0];
  nextToken.status = 'in_service';
  nextToken.counterName = counter.name;
  nextToken.staffName = counter.assignedStaffName;
  nextToken.calledAt = new Date().toISOString();
  nextToken.peopleAhead = 0;
  nextToken.estimatedWaitMins = 0;
  nextToken.finalTurnAlertSent = true;

  counter.currentTokenNumber = nextToken.tokenNumber;
  counter.status = 'busy';

  // Section 13: Final Turn notification message
  const turnMessage = `It's Your Turn! Token: ${nextToken.tokenNumber}. Please proceed to: ${counter.name}.`;
  
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: `notif-${Date.now()}-${nextToken.id}`,
    timestamp: new Date().toISOString(),
    tokenNumber: nextToken.tokenNumber,
    title: "It's Your Turn!",
    message: turnMessage,
    type: "final_turn_alert"
  });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TOKEN_CALLED',
    actor: counter.assignedStaffName,
    details: `Called Token ${nextToken.tokenNumber} to ${counter.name}`
  });

  recalculateQueue(nextToken.categoryKey);
  saveDatabase(db);

  broadcastEvent('final-turn-alert', {
    token: nextToken,
    message: turnMessage
  });
  broadcastEvent('token-called', { token: nextToken, counter });

  res.json({ token: nextToken, counter });
});

app.post('/api/staff/next', (req, res) => {
  const { counterId } = req.body;
  req.params.id = counterId;
  return app._router.handle({ ...req, method: 'POST', url: `/api/counters/${counterId}/call-next` }, res);
});

// Staff calls specific token directly
app.post('/api/tokens/:id/call', (req, res) => {
  const db = getDb();
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });

  const { counterName, staffName } = req.body;
  token.status = 'in_service';
  token.counterName = counterName || 'Consultation Room 1';
  token.staffName = staffName || 'Staff Member';
  token.calledAt = new Date().toISOString();
  token.peopleAhead = 0;
  token.estimatedWaitMins = 0;
  token.finalTurnAlertSent = true;

  const turnMessage = `It's Your Turn! Token: ${token.tokenNumber}. Please proceed to: ${token.counterName}.`;
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: `notif-${Date.now()}-${token.id}`,
    timestamp: new Date().toISOString(),
    tokenNumber: token.tokenNumber,
    title: "It's Your Turn!",
    message: turnMessage,
    type: "final_turn_alert"
  });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TOKEN_CALLED',
    actor: token.staffName,
    details: `Called Token ${token.tokenNumber} to ${token.counterName}`
  });

  recalculateQueue(token.categoryKey);
  saveDatabase(db);

  broadcastEvent('final-turn-alert', { token, message: turnMessage });
  broadcastEvent('token-called', { token });
  res.json({ success: true, token });
});

app.post('/api/staff/ticket/:id/call', (req, res) => {
  return app._router.handle({ ...req, method: 'POST', url: `/api/tokens/${req.params.id}/call` }, res);
});

// Staff completes service
app.post('/api/tokens/:id/complete', (req, res) => {
  const db = getDb();
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });

  token.status = 'completed';
  token.completedAt = new Date().toISOString();

  // Free counter
  const counter = db.counters.find(c => c.currentTokenNumber === token.tokenNumber);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenNumber = null;
  }

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TOKEN_COMPLETED',
    actor: token.staffName || 'Staff',
    details: `Completed consultation for Token ${token.tokenNumber}`
  });

  recalculateQueue(token.categoryKey);
  saveDatabase(db);
  broadcastEvent('token-completed', { token });
  res.json({ token, counter });
});

app.post('/api/staff/ticket/:id/complete', (req, res) => {
  return app._router.handle({ ...req, method: 'POST', url: `/api/tokens/${req.params.id}/complete` }, res);
});

// Staff skips customer
app.post('/api/staff/ticket/:id/skip', (req, res) => {
  const db = getDb();
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });

  token.status = 'skipped';
  token.skippedAt = new Date().toISOString();

  const counter = db.counters.find(c => c.currentTokenNumber === token.tokenNumber);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenNumber = null;
  }

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TOKEN_SKIPPED',
    actor: token.staffName || 'Staff Officer',
    details: `Skipped Token ${token.tokenNumber} (No show)`
  });

  recalculateQueue(token.categoryKey);
  saveDatabase(db);
  broadcastEvent('queue-updated', { token });
  res.json({ token, counter });
});

// Staff puts customer on hold
app.post('/api/staff/ticket/:id/hold', (req, res) => {
  const db = getDb();
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });

  token.status = 'on_hold';
  token.heldAt = new Date().toISOString();

  const counter = db.counters.find(c => c.currentTokenNumber === token.tokenNumber);
  if (counter) {
    counter.status = 'available';
    counter.currentTokenNumber = null;
  }

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TOKEN_HELD',
    actor: token.staffName || 'Staff Officer',
    details: `Placed Token ${token.tokenNumber} on hold for document verification`
  });

  recalculateQueue(token.categoryKey);
  saveDatabase(db);
  broadcastEvent('queue-updated', { token });
  res.json({ token, counter });
});

// Staff recalls customer
app.post('/api/staff/ticket/:id/recall', (req, res) => {
  const db = getDb();
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });

  token.recallCount = (token.recallCount || 0) + 1;
  token.calledAt = new Date().toISOString();

  broadcastEvent('token-called', { token, recall: true });
  broadcastEvent('final-turn-alert', {
    token,
    message: `Recalled! Token: ${token.tokenNumber}. Please proceed immediately to ${token.counterName || 'Counter'}.`
  });

  res.json({ success: true, token });
});

// Staff transfers customer to another service / counter
app.post('/api/staff/ticket/:id/transfer', (req, res) => {
  const db = getDb();
  const { targetServiceId, targetCounterName, reason } = req.body;
  const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber.toUpperCase() === req.params.id.toUpperCase());
  if (!token) return res.status(404).json({ error: 'Token not found' });

  const targetService = db.services.find(s => s.id === targetServiceId);
  if (targetService) {
    token.serviceId = targetService.id;
    token.serviceName = targetService.name;
  }
  token.status = 'waiting';
  token.priority = 'special_assistance'; // high priority on transfer so they don't wait at back
  token.counterName = targetCounterName || null;
  token.transferNotes = reason || 'Transferred by attendant';

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TOKEN_TRANSFERRED',
    actor: 'Staff Officer',
    details: `Transferred Token ${token.tokenNumber} to ${token.serviceName}`
  });

  recalculateQueue(token.categoryKey);
  saveDatabase(db);
  broadcastEvent('queue-updated', { token });
  res.json({ success: true, token });
});

// -------------------------------------------------------------
// Special Assistance Requests & Approvals
// -------------------------------------------------------------

function handleCreateAssistance(req, res) {
  const db = getDb();
  const {
    customerName,
    customerPhone,
    placeId,
    serviceId,
    category,
    categoryLabel,
    supportDetails,
    requestDirectConsultant,
    preferredTime
  } = req.body;

  const place = db.places.find(p => p.id === placeId) || db.places[0];
  const service = db.services.find(s => s.id === serviceId) || db.services[0];

  const newSar = {
    id: `sar-${Date.now()}`,
    tokenId: null,
    tokenNumber: `SA-${Math.floor(100 + Math.random() * 900)}`,
    customerName: (customerName || 'Special Care Guest').trim(),
    customerPhone: (customerPhone || '+1 (555) 777-6655').trim(),
    placeId: place.id,
    placeName: place.name,
    serviceName: service.name,
    category: category || 'senior_citizen',
    categoryLabel: categoryLabel || 'Senior Citizen (60+)',
    supportDetails: supportDetails || 'Assistance requested at entrance desk.',
    requestDirectConsultant: !!requestDirectConsultant,
    preferredTime: preferredTime || 'Immediate',
    status: 'pending',
    assignedRoom: null,
    submittedAt: new Date().toISOString()
  };

  db.specialAssistanceRequests.unshift(newSar);
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'SPECIAL_ASSISTANCE_REQUESTED',
    actor: newSar.customerName,
    details: `Submitted assistance request for ${newSar.serviceName} (${newSar.categoryLabel})`
  });

  saveDatabase(db);
  broadcastEvent('special-assistance-created', { request: newSar });
  res.status(201).json(newSar);
}

app.post('/api/special-assistance', handleCreateAssistance);
app.post('/api/assistance', handleCreateAssistance); // Section 27 alias

app.get('/api/special-assistance', (req, res) => {
  res.json(getDb().specialAssistanceRequests);
});
app.get('/api/assistance', (req, res) => {
  res.json(getDb().specialAssistanceRequests);
});

// Staff reviews & approves/rejects assistance request
app.post('/api/special-assistance/:id/review', (req, res) => {
  const { id } = req.params;
  const { status, assignedRoom, staffNote, staffName } = req.body;
  const db = getDb();

  const reqItem = db.specialAssistanceRequests.find(r => r.id === id);
  if (!reqItem) return res.status(404).json({ error: 'Request not found' });

  reqItem.status = status || 'approved';
  reqItem.assignedRoom = assignedRoom || 'Consultation Room 2';
  reqItem.staffNote = staffNote || 'Approved for priority direct access.';
  reqItem.reviewedAt = new Date().toISOString();
  reqItem.reviewedBy = staffName || 'Dr. Marcus Vance';

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `SPECIAL_ASSISTANCE_${(status || 'approved').toUpperCase()}`,
    actor: staffName || 'Staff Officer',
    details: `${(status || 'approved').toUpperCase()} special assistance for ${reqItem.customerName} -> ${reqItem.assignedRoom}`
  });

  saveDatabase(db);
  broadcastEvent('special-assistance-updated', { request: reqItem });
  res.json(reqItem);
});

app.post('/api/assistance/:id/approve', (req, res) => {
  req.body.status = 'approved';
  return app._router.handle({ ...req, method: 'POST', url: `/api/special-assistance/${req.params.id}/review` }, res);
});

app.post('/api/assistance/:id/reject', (req, res) => {
  req.body.status = 'rejected';
  return app._router.handle({ ...req, method: 'POST', url: `/api/special-assistance/${req.params.id}/review` }, res);
});

// -------------------------------------------------------------
// Appointments (Section 25)
// -------------------------------------------------------------

app.get('/api/appointments', (req, res) => {
  res.json(getDb().appointments || []);
});

app.post('/api/appointments', (req, res) => {
  const db = getDb();
  const { customerName, customerPhone, placeId, serviceId, date, time } = req.body;

  const place = db.places.find(p => p.id === placeId) || db.places[0];
  const service = db.services.find(s => s.id === serviceId) || db.services[0];

  const appointment = {
    id: `apt-${Date.now()}`,
    customerName: customerName || 'Valued Visitor',
    customerPhone: customerPhone || '+1 (555) 000-0000',
    placeId: place.id,
    placeName: place.name,
    serviceId: service.id,
    serviceName: service.name,
    date: date || new Date().toISOString().split('T')[0],
    time: time || '10:00 AM',
    status: 'confirmed',
    recommendedArrival: '15 minutes prior to appointment',
    createdAt: new Date().toISOString()
  };

  if (!db.appointments) db.appointments = [];
  db.appointments.unshift(appointment);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'APPOINTMENT_CONFIRMED',
    actor: appointment.customerName,
    details: `Confirmed appointment for ${appointment.serviceName} at ${appointment.time} on ${appointment.date}`
  });

  saveDatabase(db);
  res.status(201).json(appointment);
});

// Notifications history
app.get('/api/notifications', (req, res) => {
  res.json(getDb().notifications || []);
});

// Admin Analytics & Settings
app.get('/api/admin/analytics', (req, res) => {
  const db = getDb();
  const tokens = db.tokens;
  const completed = tokens.filter(t => t.status === 'completed').length;
  const waiting = tokens.filter(t => t.status === 'waiting').length;
  const inService = tokens.filter(t => t.status === 'in_service').length;
  const specialRequests = db.specialAssistanceRequests.length;

  res.json({
    totalCustomersToday: tokens.length,
    activeQueues: waiting,
    currentlyServing: inService,
    completedToday: completed,
    averageWaitTimeMins: 8,
    specialAssistanceRequests: specialRequests,
    feedbacksCount: (db.feedbacks || []).length,
    satisfactionScore: 4.9
  });
});

app.get('/api/admin/settings', (req, res) => {
  res.json(getDb().settings);
});

app.post('/api/admin/settings', (req, res) => {
  const db = getDb();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json(db.settings);
});

// -------------------------------------------------------------
// Presentation Demo Simulator
// -------------------------------------------------------------

app.post('/api/simulation/step-next', (req, res) => {
  const db = getDb();
  const { categoryKey = 'hospital' } = req.body;
  const thresholdMins = db.settings?.notificationThresholdMinutes || 2;
  
  // Find current in-service token for this category
  const currentInService = db.tokens.find(t => t.categoryKey === categoryKey && t.status === 'in_service');
  
  // Mark current as completed
  if (currentInService) {
    currentInService.status = 'completed';
    currentInService.completedAt = new Date().toISOString();
  }

  // Find next waiting token for this category
  const categoryWaiting = db.tokens.filter(t => t.categoryKey === categoryKey && t.status === 'waiting');

  if (categoryWaiting.length > 0) {
    // Call next
    const nextToCall = categoryWaiting[0];
    nextToCall.status = 'in_service';

    const defaultRoom = categoryKey === 'hospital' 
      ? 'Consultation Room 2' 
      : categoryKey === 'village_office' 
      ? 'Counter 1 - Certificates' 
      : 'Pickup Counter 1';

    const defaultStaff = categoryKey === 'hospital'
      ? 'Dr. Marcus Vance'
      : categoryKey === 'village_office'
      ? 'Officer Ramesh Kumar'
      : 'Sam Taylor';

    nextToCall.counterName = defaultRoom;
    nextToCall.staffName = defaultStaff;
    nextToCall.calledAt = new Date().toISOString();
    nextToCall.peopleAhead = 0;
    nextToCall.estimatedWaitMins = 0;

    // Target tokens in demonstration: H125 (Hospital), V105 (Village Office), B205 (Beverage Shop)
    const targetTokenNum = categoryKey === 'hospital' ? 'H125' : categoryKey === 'village_office' ? 'V105' : 'B205';
    const targetToken = db.tokens.find(t => t.tokenNumber === targetTokenNum);

    if (targetToken && targetToken.status === 'waiting') {
      const remainingAhead = categoryWaiting.filter(t => t.id !== nextToCall.id);
      const aheadCount = remainingAhead.findIndex(t => t.id === targetToken.id);
      targetToken.peopleAhead = aheadCount >= 0 ? aheadCount : 0;
      targetToken.estimatedWaitMins = targetToken.peopleAhead === 0 ? 2 : targetToken.peopleAhead * 2;

      // Trigger 2-min alert when estimated wait is <= threshold
      if (targetToken.estimatedWaitMins <= thresholdMins && !targetToken.twoMinAlertSent) {
        targetToken.twoMinAlertSent = true;
        const msg = `Your turn is approaching! Token: ${targetToken.tokenNumber}. Only a few customers are ahead of you. Estimated time: About 2 minutes. Please get ready to approach the service counter.`;
        
        if (!db.notifications) db.notifications = [];
        db.notifications.unshift({
          id: `notif-${Date.now()}-${targetToken.id}`,
          timestamp: new Date().toISOString(),
          tokenNumber: targetToken.tokenNumber,
          title: "Your turn is approaching!",
          message: msg,
          type: "two_minute_alert"
        });

        broadcastEvent('two-minute-alert', {
          token: targetToken,
          message: msg
        });
      }
    } else if (targetToken && targetToken.status === 'in_service' && !targetToken.finalTurnAlertSent) {
      targetToken.finalTurnAlertSent = true;
      const turnMsg = `It's Your Turn! Token: ${targetToken.tokenNumber}. Please proceed to: ${defaultRoom}.`;
      
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `notif-${Date.now()}-${targetToken.id}`,
        timestamp: new Date().toISOString(),
        tokenNumber: targetToken.tokenNumber,
        title: "It's Your Turn!",
        message: turnMsg,
        type: "final_turn_alert"
      });

      broadcastEvent('final-turn-alert', {
        token: targetToken,
        message: turnMsg
      });
    }

    broadcastEvent('queue-updated', { calledToken: nextToCall });
  }

  recalculateQueue(categoryKey);
  saveDatabase(db);
  res.json({ success: true, tokens: db.tokens });
});

// Reset demo simulation to pristine presentation state
app.post('/api/simulation/reset', (req, res) => {
  const initial = getInitialData();
  saveDatabase(initial);
  broadcastEvent('queue-reset', {});
  res.json({ success: true, message: 'Simulation reset to presentation demo state' });
});

// Serve frontend build assets & handle HTML5 client-side routing
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.send('SmartQueue Server Running. Run Vite for frontend.');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SmartQueue Server running on http://localhost:${PORT}`);
});
