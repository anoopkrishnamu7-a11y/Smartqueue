// Automated End-to-End Verification Test Suite for SmartQueue
import http from 'http';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('       SmartQueue E2E System Verification Tests     ');
  console.log('====================================================');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details}`);
      failed++;
    }
  }

  try {
    // 1. Static HTML serving
    const htmlRes = await request('GET', '/');
    assert(htmlRes.status === 200 && typeof htmlRes.raw === 'string' && htmlRes.raw.includes('SmartQueue'), 'Frontend Static Delivery (index.html)');

    // 2. Client-side routing fallback (/services, /special-assistance, /my-token, /staff, /admin, /display)
    const spaRes = await request('GET', '/services');
    assert(spaRes.status === 200 && typeof spaRes.raw === 'string' && spaRes.raw.includes('SmartQueue'), 'SPA Routing Fallback for /services');

    // 3. Bootstrap data
    const bootRes = await request('GET', '/api/bootstrap');
    assert(bootRes.status === 200 && bootRes.data.organization?.name, 'GET /api/bootstrap returns organization and data');
    assert(bootRes.data.categories?.length === 3, 'All 3 Categories present (Village Office, Hospital, Beverage Shop)');
    assert(bootRes.data.places?.length === 3, 'All 3 Hubs registered (Perumbavoor, SmartCare, FreshSip)');
    assert(bootRes.data.counters?.length >= 7, 'Multi-hub counters registered');
    assert(bootRes.data.tokens?.length >= 5, 'Seed tokens initialized');

    // 4. Auth login test
    const staffLogin = await request('POST', '/api/auth/login', { username: 'doctor', password: 'password123' });
    assert(staffLogin.status === 200 && staffLogin.data.success && staffLogin.data.user.role === 'staff', 'Staff Login (doctor / password123)');

    const adminLogin = await request('POST', '/api/auth/login', { username: 'admin', password: 'password123' });
    assert(adminLogin.status === 200 && adminLogin.data.success && adminLogin.data.user.role === 'admin', 'Admin Login (admin / password123)');

    const badLogin = await request('POST', '/api/auth/login', { username: 'baduser', password: 'wrong' });
    assert(badLogin.status === 401 && !badLogin.data.success, 'Invalid credentials rejected with 401');

    // 5. Join Queue (Token Generation) for Hospital
    const joinHospital = await request('POST', '/api/tokens', {
      customerName: 'Rohan Sharma',
      customerPhone: '+1 (555) 987-6543',
      placeId: 'place-hospital-1',
      serviceId: 'srv-h2', // Doctor Consultation
      priority: 'normal'
    });
    assert(joinHospital.status === 201 && joinHospital.data.tokenNumber, `POST /api/tokens (Hospital Token ${joinHospital.data?.tokenNumber} created)`);
    const hospitalToken = joinHospital.data;
    assert(hospitalToken && hospitalToken.tokenNumber.startsWith('H'), `Token ${hospitalToken?.tokenNumber} uses prefix 'H'`);
    assert(hospitalToken?.peopleAhead >= 0, `People ahead calculated: ${hospitalToken?.peopleAhead}`);

    // 6. Join Queue for Village Office
    const joinVillage = await request('POST', '/api/tokens', {
      customerName: 'Ananya Nair',
      customerPhone: '+1 (555) 444-1234',
      placeId: 'place-village-1',
      serviceId: 'srv-v1', // Certificate Application
      priority: 'special_assistance',
      assistanceCategory: 'senior_citizen',
      supportDetails: 'Need wheelchair accessibility and desk assistance'
    });
    assert(joinVillage.status === 201 && joinVillage.data.tokenNumber.startsWith('V'), `Generated Village Office token: ${joinVillage.data?.tokenNumber}`);

    // 7. Join Queue for Beverage Shop
    const joinBeverage = await request('POST', '/api/tokens', {
      customerName: 'Dev Patel',
      customerPhone: '+1 (555) 333-8899',
      placeId: 'place-beverage-1',
      serviceId: 'srv-b1', // Order Counter
      priority: 'normal'
    });
    assert(joinBeverage.status === 201 && joinBeverage.data.tokenNumber.startsWith('B'), `Generated Beverage Shop token: ${joinBeverage.data?.tokenNumber}`);

    // 8. Prevent duplicate active token for same service and phone
    const duplicateJoin = await request('POST', '/api/tokens', {
      customerName: 'Rohan Sharma',
      customerPhone: '+1 (555) 987-6543',
      placeId: 'place-hospital-1',
      serviceId: 'srv-h2'
    });
    assert(duplicateJoin.status === 200 && duplicateJoin.data.alreadyActive === true, 'Duplicate active token prevention flags alreadyActive');

    // 9. Lookup token by tokenNumber
    const lookupRes = await request('GET', `/api/tokens/lookup?tokenNumber=${hospitalToken.tokenNumber}`);
    assert(lookupRes.status === 200 && lookupRes.data.tokenNumber === hospitalToken.tokenNumber, `GET /api/tokens/lookup by tokenNumber ${hospitalToken.tokenNumber}`);

    // 10. Lookup token by mobile phone
    const lookupPhoneRes = await request('GET', `/api/tokens/lookup?phone=987-6543`);
    assert(lookupPhoneRes.status === 200 && lookupPhoneRes.data.customerPhone.includes('987-6543'), `GET /api/tokens/lookup by customerPhone`);

    // 11. Simulation Step Next (Progressing queue)
    const stepRes = await request('POST', '/api/simulation/step-next', { categoryKey: 'hospital' });
    assert(stepRes.status === 200 && stepRes.data.success, 'POST /api/simulation/step-next advances hospital queue');

    // 12. Staff Call Next Token
    const waitingTok = (await request('GET', '/api/tokens?categoryKey=hospital')).data.find(t => t.status === 'waiting');
    if (waitingTok) {
      const callRes = await request('POST', `/api/tokens/${waitingTok.id}/call`, {
        counterName: 'Consultation Room 1',
        staffName: 'Dr. Sarah Chen, MD'
      });
      assert(callRes.status === 200 && callRes.data.token?.status === 'in_service', `Staff calls token into service (${callRes.data.token?.tokenNumber})`);

      // 13. Staff Complete Token
      const completeRes = await request('POST', `/api/tokens/${waitingTok.id}/complete`);
      assert(completeRes.status === 200 && completeRes.data.token?.status === 'completed', `Staff marks token completed`);
    }

    // 14. Submit Special Assistance Request
    const assistReq = await request('POST', '/api/special-assistance', {
      customerName: 'Lakshmi Amma',
      customerPhone: '+1 (555) 989-5012',
      placeId: 'place-hospital-1',
      serviceId: 'srv-h1',
      category: 'senior_citizen',
      categoryLabel: 'Senior Citizen (60+)',
      supportDetails: 'Age 76, diabetic, requested seating assistance and priority consultation',
      requestDirectConsultant: true
    });
    assert(assistReq.status === 201 && assistReq.data.id, 'POST /api/special-assistance (Assistance request created)');
    const assistId = assistReq.data.id;

    // 15. Review Special Assistance Request (Hospital Staff Approves)
    const reviewRes = await request('POST', `/api/special-assistance/${assistId}/review`, {
      status: 'approved',
      assignedRoom: 'Consultation Room 2',
      staffNote: 'Approved. Wheelchair dispatched and priority room booked.',
      staffName: 'Dr. Marcus Vance'
    });
    assert(reviewRes.status === 200 && reviewRes.data.status === 'approved', 'POST /api/special-assistance/:id/review (Approved with Room & Staff note)');

    // 16. Admin Settings update
    const updateSettings = await request('POST', '/api/admin/settings', {
      notificationThresholdMinutes: 3,
      averageServiceDurationMins: 4
    });
    assert(updateSettings.status === 200 && updateSettings.data.notificationThresholdMinutes === 3, 'POST /api/admin/settings (Updated threshold to 3m)');

    // 17. Admin Analytics
    const analyticsRes = await request('GET', '/api/admin/analytics');
    assert(analyticsRes.status === 200 && analyticsRes.data.totalCustomersToday > 0, 'GET /api/admin/analytics returns metrics');
    assert(analyticsRes.data.satisfactionScore === 4.9, 'Customer satisfaction score computed');

    // 18. Reset simulation to presentation state
    const resetRes = await request('POST', '/api/simulation/reset');
    assert(resetRes.status === 200 && resetRes.data.success, 'POST /api/simulation/reset resets demo to pristine presentation state');

    console.log(`\n====================================================`);
    console.log(`   Verification Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
