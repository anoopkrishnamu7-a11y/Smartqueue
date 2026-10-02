import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'database.json');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function getInitialData() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return {
    organization: {
      id: "org-smartqueue",
      name: "SmartQueue Demo",
      tagline: "Your Time Matters. Join the Queue, Not the Crowd.",
      secondaryTagline: "Book your token. Track your turn. Arrive at the right time."
    },
    settings: {
      notificationThresholdMinutes: 2,
      averageServiceDurationMins: 2,
      organizationName: "SmartQueue Demo",
      soundEnabledDefault: true,
      autoCallSpeedSeconds: 5
    },
    users: [
      {
        id: "user-admin",
        username: "admin",
        password: "password123",
        name: "System Administrator",
        role: "admin",
        placeId: null,
        title: "Admin Officer"
      },
      {
        id: "user-doctor",
        username: "doctor",
        password: "password123",
        name: "Dr. Sarah Chen, MD",
        role: "staff",
        placeId: "place-hospital-1",
        title: "Senior Medical Consultant"
      },
      {
        id: "user-staff",
        username: "staff",
        password: "password123",
        name: "Dr. Marcus Vance",
        role: "staff",
        placeId: "place-hospital-1",
        title: "OPD Duty Physician"
      },
      {
        id: "user-officer",
        username: "officer",
        password: "password123",
        name: "Officer Ramesh Kumar",
        role: "staff",
        placeId: "place-village-1",
        title: "Senior Revenue Officer"
      },
      {
        id: "user-barista",
        username: "barista",
        password: "password123",
        name: "Alex Rivera",
        role: "staff",
        placeId: "place-beverage-1",
        title: "Lead Barista & Counter Lead"
      }
    ],
    categories: [
      {
        id: "cat-village",
        key: "village_office",
        title: "Village Office",
        icon: "landmark",
        emoji: "🏛️",
        accentColor: "#2563EB",
        badgeBg: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        description: "Access village office services without spending unnecessary time in a physical queue.",
        avgWaitMins: 9,
        prefix: "V"
      },
      {
        id: "cat-hospital",
        key: "hospital",
        title: "Hospital",
        icon: "stethoscope",
        emoji: "🏥",
        accentColor: "#16A34A",
        badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        description: "Track your consultation queue and receive an alert when your turn is near.",
        avgWaitMins: 8,
        prefix: "H"
      },
      {
        id: "cat-beverage",
        key: "beverage_shop",
        title: "Beverage Shop",
        icon: "coffee",
        emoji: "🥤",
        accentColor: "#F59E0B",
        badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        description: "Place your order and receive a pickup token without standing in line.",
        avgWaitMins: 4,
        prefix: "B"
      }
    ],
    places: [
      {
        id: "place-village-1",
        categoryKey: "village_office",
        name: "Perumbavoor Village Office",
        location: "Civic Revenue Complex, Perumbavoor Main Road",
        openHours: "09:00 AM - 04:30 PM",
        activeCounters: "Counter 1 (Certificates), Counter 2 (Revenue & Patta)",
        emergencyNotice: "Special assistance desk located at Entrance Window A for senior citizens and persons with disabilities."
      },
      {
        id: "place-hospital-1",
        categoryKey: "hospital",
        name: "SmartCare Hospital",
        location: "Medical Avenue, Central Health District",
        openHours: "24/7 Outpatient & Emergency",
        activeCounters: "Consultation Room 1, Room 2 & Express Lab",
        emergencyNotice: "If this is an emergency, contact the hospital emergency service immediately rather than waiting in the normal queue."
      },
      {
        id: "place-beverage-1",
        categoryKey: "beverage_shop",
        name: "FreshSip Beverage Shop",
        location: "Highland Galleria Mall, Ground Floor",
        openHours: "08:00 AM - 10:00 PM",
        activeCounters: "Order Desk & Express Pickup Counter 1",
        emergencyNotice: "Low-height pickup counter available for accessible service."
      }
    ],
    services: [
      // 🏛️ Village Office Services (Prefix V)
      {
        id: "srv-v1",
        categoryKey: "village_office",
        placeId: "place-village-1",
        name: "Certificate Application",
        prefix: "V",
        description: "Apply for income, residence, nativity, or caste certificates with verified documents",
        avgDurationMins: 3,
        accentColor: "#2563EB",
        icon: "file-text"
      },
      {
        id: "srv-v2",
        categoryKey: "village_office",
        placeId: "place-village-1",
        name: "Certificate Collection",
        prefix: "V",
        description: "Pick up approved, stamped, and digitally signed revenue certificates",
        avgDurationMins: 3,
        accentColor: "#2563EB",
        icon: "check-circle"
      },
      {
        id: "srv-v3",
        categoryKey: "village_office",
        placeId: "place-village-1",
        name: "Document Verification",
        prefix: "V",
        description: "In-person scrutiny and verification of official revenue documents",
        avgDurationMins: 4,
        accentColor: "#2563EB",
        icon: "shield-check"
      },
      {
        id: "srv-v4",
        categoryKey: "village_office",
        placeId: "place-village-1",
        name: "Other Services",
        prefix: "V",
        description: "Land tax payment, patta mutation status, welfare schemes, and public grievances",
        avgDurationMins: 3,
        accentColor: "#2563EB",
        icon: "landmark"
      },

      // 🏥 Hospital Services (Prefix H)
      {
        id: "srv-h1",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        name: "Doctor Consultation",
        prefix: "H",
        description: "Consultation with General Physician, Specialist, or Pediatrician",
        avgDurationMins: 2,
        accentColor: "#16A34A",
        icon: "stethoscope"
      },
      {
        id: "srv-h2",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        name: "Registration",
        prefix: "H",
        description: "New outpatient file creation, UHID check-in, and renewal",
        avgDurationMins: 2,
        accentColor: "#16A34A",
        icon: "user-plus"
      },
      {
        id: "srv-h3",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        name: "Laboratory",
        prefix: "H",
        description: "Diagnostic blood tests, urine analysis, and sample collection",
        avgDurationMins: 2,
        accentColor: "#16A34A",
        icon: "flask-conical"
      },
      {
        id: "srv-h4",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        name: "Pharmacy",
        prefix: "H",
        description: "Dispensing prescribed medicines, dosages, and medical supplies",
        avgDurationMins: 2,
        accentColor: "#16A34A",
        icon: "pill"
      },
      {
        id: "srv-h5",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        name: "Billing",
        prefix: "H",
        description: "Insurance clearance, consultation payment, and discharge receipts",
        avgDurationMins: 2,
        accentColor: "#16A34A",
        icon: "credit-card"
      },

      // 🥤 Beverage Shop Services (Prefix B)
      {
        id: "srv-b1",
        categoryKey: "beverage_shop",
        placeId: "place-beverage-1",
        name: "Order Counter",
        prefix: "B",
        description: "Place your order for artisanal coffee, fresh juices, and smoothies",
        avgDurationMins: 2,
        accentColor: "#F59E0B",
        icon: "coffee"
      },
      {
        id: "srv-b2",
        categoryKey: "beverage_shop",
        placeId: "place-beverage-1",
        name: "Beverage Pickup",
        prefix: "B",
        description: "Freshly brewed drink preparation and pickup counter handoff",
        avgDurationMins: 2,
        accentColor: "#F59E0B",
        icon: "cup-soda"
      },
      {
        id: "srv-b3",
        categoryKey: "beverage_shop",
        placeId: "place-beverage-1",
        name: "Takeaway Collection",
        prefix: "B",
        description: "Pre-packaged bakery, bottled drinks, and takeaway handoff",
        avgDurationMins: 2,
        accentColor: "#F59E0B",
        icon: "shopping-bag"
      }
    ],
    counters: [
      {
        id: "ctr-h1",
        placeId: "place-hospital-1",
        name: "Consultation Room 1",
        assignedStaffName: "Dr. Sarah Chen, MD",
        status: "busy",
        serviceIds: ["srv-h1", "srv-h2"],
        currentTokenNumber: "H120"
      },
      {
        id: "ctr-h2",
        placeId: "place-hospital-1",
        name: "Consultation Room 2",
        assignedStaffName: "Dr. Marcus Vance",
        status: "available",
        serviceIds: ["srv-h1"],
        currentTokenNumber: null
      },
      {
        id: "ctr-h3",
        placeId: "place-hospital-1",
        name: "Counter 3 - Lab & Pharmacy",
        assignedStaffName: "Officer Lisa Wang",
        status: "available",
        serviceIds: ["srv-h3", "srv-h4", "srv-h5"],
        currentTokenNumber: null
      },
      {
        id: "ctr-v1",
        placeId: "place-village-1",
        name: "Counter 1 - Certificates",
        assignedStaffName: "Officer Ramesh Kumar",
        status: "busy",
        serviceIds: ["srv-v1", "srv-v2"],
        currentTokenNumber: "V101"
      },
      {
        id: "ctr-v2",
        placeId: "place-village-1",
        name: "Counter 2 - Revenue & Verification",
        assignedStaffName: "Officer Sneha Joshi",
        status: "available",
        serviceIds: ["srv-v3", "srv-v4"],
        currentTokenNumber: null
      },
      {
        id: "ctr-b1",
        placeId: "place-beverage-1",
        name: "Order Counter 1",
        assignedStaffName: "Alex Rivera",
        status: "busy",
        serviceIds: ["srv-b1"],
        currentTokenNumber: "B101"
      },
      {
        id: "ctr-b2",
        placeId: "place-beverage-1",
        name: "Pickup Counter 1",
        assignedStaffName: "Sam Taylor",
        status: "available",
        serviceIds: ["srv-b2", "srv-b3"],
        currentTokenNumber: null
      }
    ],
    tokens: [
      // 🏥 Hospital Tokens (H120 serving, H121..H124, H125 User Token)
      {
        id: "tok-h120",
        tokenNumber: "H120",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceId: "srv-h1",
        serviceName: "Doctor Consultation",
        customerName: "Robert Hayes",
        customerPhone: "+1 (555) 301-2910",
        status: "in_service",
        priority: "normal",
        counterName: "Consultation Room 1",
        staffName: "Dr. Sarah Chen, MD",
        peopleAhead: 0,
        estimatedWaitMins: 0,
        joinedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        calledAt: new Date(Date.now() - 4 * 60000).toISOString()
      },
      {
        id: "tok-h121",
        tokenNumber: "H121",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceId: "srv-h1",
        serviceName: "Doctor Consultation",
        customerName: "Emily Watson",
        customerPhone: "+1 (555) 444-8899",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 1,
        estimatedWaitMins: 2,
        twoMinAlertSent: true,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 12 * 60000).toISOString()
      },
      {
        id: "tok-h122",
        tokenNumber: "H122",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceId: "srv-h1",
        serviceName: "Doctor Consultation",
        customerName: "David Miller",
        customerPhone: "+1 (555) 333-2211",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 2,
        estimatedWaitMins: 4,
        twoMinAlertSent: false,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: "tok-h123",
        tokenNumber: "H123",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceId: "srv-h1",
        serviceName: "Doctor Consultation",
        customerName: "Grandma Evelyn (Senior Citizen)",
        customerPhone: "+1 (555) 777-6655",
        status: "waiting",
        priority: "special_assistance",
        assistanceCategory: "senior_citizen",
        counterName: null,
        staffName: null,
        peopleAhead: 0,
        estimatedWaitMins: 2,
        twoMinAlertSent: true,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 8 * 60000).toISOString()
      },
      {
        id: "tok-h124",
        tokenNumber: "H124",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceId: "srv-h1",
        serviceName: "Doctor Consultation",
        customerName: "Carlos Santana",
        customerPhone: "+1 (555) 222-3344",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 3,
        estimatedWaitMins: 6,
        twoMinAlertSent: false,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 6 * 60000).toISOString()
      },
      {
        id: "tok-target-h125",
        tokenNumber: "H125",
        categoryKey: "hospital",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceId: "srv-h1",
        serviceName: "Doctor Consultation",
        customerName: "Demo User (You)",
        customerPhone: "+1 (555) 987-6543",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 4,
        estimatedWaitMins: 8,
        twoMinAlertSent: false,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 3 * 60000).toISOString()
      },

      // 🏛️ Village Office Tokens (V101 serving, V102, V103, V105 Demo Token)
      {
        id: "tok-v101",
        tokenNumber: "V101",
        categoryKey: "village_office",
        placeId: "place-village-1",
        placeName: "Perumbavoor Village Office",
        serviceId: "srv-v2",
        serviceName: "Certificate Collection",
        customerName: "Ananya Sharma",
        customerPhone: "+1 (555) 812-3456",
        status: "in_service",
        priority: "normal",
        counterName: "Counter 1 - Certificates",
        staffName: "Officer Ramesh Kumar",
        peopleAhead: 0,
        estimatedWaitMins: 0,
        joinedAt: new Date(Date.now() - 14 * 60000).toISOString(),
        calledAt: new Date(Date.now() - 3 * 60000).toISOString()
      },
      {
        id: "tok-v102",
        tokenNumber: "V102",
        categoryKey: "village_office",
        placeId: "place-village-1",
        placeName: "Perumbavoor Village Office",
        serviceId: "srv-v2",
        serviceName: "Certificate Collection",
        customerName: "Priya Nair (PWD)",
        customerPhone: "+1 (555) 666-4433",
        status: "waiting",
        priority: "special_assistance",
        assistanceCategory: "disability",
        counterName: null,
        staffName: null,
        peopleAhead: 1,
        estimatedWaitMins: 3,
        twoMinAlertSent: false,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 9 * 60000).toISOString()
      },
      {
        id: "tok-v103",
        tokenNumber: "V103",
        categoryKey: "village_office",
        placeId: "place-village-1",
        placeName: "Perumbavoor Village Office",
        serviceId: "srv-v2",
        serviceName: "Certificate Collection",
        customerName: "Vikram Patel",
        customerPhone: "+1 (555) 912-8877",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 2,
        estimatedWaitMins: 6,
        twoMinAlertSent: false,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 7 * 60000).toISOString()
      },
      {
        id: "tok-v105",
        tokenNumber: "V105",
        categoryKey: "village_office",
        placeId: "place-village-1",
        placeName: "Perumbavoor Village Office",
        serviceId: "srv-v2",
        serviceName: "Certificate Collection",
        customerName: "Kavya Menon (Demo)",
        customerPhone: "+1 (555) 949-1100",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 3,
        estimatedWaitMins: 9,
        twoMinAlertSent: false,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 4 * 60000).toISOString()
      },

      // 🥤 Beverage Shop Tokens (B101 serving, B102, B205 Demo Token)
      {
        id: "tok-b101",
        tokenNumber: "B101",
        categoryKey: "beverage_shop",
        placeId: "place-beverage-1",
        placeName: "FreshSip Beverage Shop",
        serviceId: "srv-b2",
        serviceName: "Beverage Pickup",
        customerName: "Liam Johnson",
        customerPhone: "+1 (555) 234-5678",
        status: "in_service",
        priority: "normal",
        counterName: "Pickup Counter 1",
        staffName: "Sam Taylor",
        peopleAhead: 0,
        estimatedWaitMins: 0,
        joinedAt: new Date(Date.now() - 8 * 60000).toISOString(),
        calledAt: new Date(Date.now() - 2 * 60000).toISOString()
      },
      {
        id: "tok-b102",
        tokenNumber: "B102",
        categoryKey: "beverage_shop",
        placeId: "place-beverage-1",
        placeName: "FreshSip Beverage Shop",
        serviceId: "srv-b2",
        serviceName: "Beverage Pickup",
        customerName: "Chloe Bennett",
        customerPhone: "+1 (555) 876-5432",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 1,
        estimatedWaitMins: 2,
        twoMinAlertSent: true,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: "tok-b205",
        tokenNumber: "B205",
        categoryKey: "beverage_shop",
        placeId: "place-beverage-1",
        placeName: "FreshSip Beverage Shop",
        serviceId: "srv-b2",
        serviceName: "Beverage Pickup",
        customerName: "Rohan Das (Demo)",
        customerPhone: "+1 (555) 432-8765",
        status: "waiting",
        priority: "normal",
        counterName: null,
        staffName: null,
        peopleAhead: 2,
        estimatedWaitMins: 4,
        twoMinAlertSent: false,
        finalTurnAlertSent: false,
        joinedAt: new Date(Date.now() - 3 * 60000).toISOString()
      }
    ],
    specialAssistanceRequests: [
      {
        id: "sar-1",
        tokenId: "tok-h123",
        tokenNumber: "H123",
        customerName: "Grandma Evelyn",
        customerPhone: "+1 (555) 777-6655",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceName: "Doctor Consultation",
        category: "senior_citizen",
        categoryLabel: "Senior Citizen (60+)",
        supportDetails: "Requires wheelchair mobility support from lobby entrance to room.",
        requestDirectConsultant: true,
        preferredTime: "Morning",
        status: "approved",
        assignedRoom: "Consultation Room 2",
        submittedAt: new Date(Date.now() - 14 * 60000).toISOString(),
        reviewedAt: new Date(Date.now() - 8 * 60000).toISOString(),
        staffNote: "Wheelchair assigned. Consultation approved in Room 2."
      },
      {
        id: "sar-2",
        tokenId: "tok-v102",
        tokenNumber: "V102",
        customerName: "Priya Nair",
        customerPhone: "+1 (555) 666-4433",
        placeId: "place-village-1",
        placeName: "Perumbavoor Village Office",
        serviceName: "Certificate Collection",
        category: "disability",
        categoryLabel: "Person with Disability",
        supportDetails: "Assistance with document form filling and physical submission counter access.",
        requestDirectConsultant: false,
        status: "pending",
        assignedRoom: null,
        submittedAt: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: "sar-3",
        tokenId: null,
        tokenNumber: "SA-301",
        customerName: "Frank Reynolds (Senior)",
        customerPhone: "+1 (555) 888-9911",
        placeId: "place-beverage-1",
        placeName: "FreshSip Beverage Shop",
        serviceName: "Order Counter",
        category: "senior_citizen",
        categoryLabel: "Senior Citizen (60+)",
        supportDetails: "Lower service bar pickup & seating guidance.",
        requestDirectConsultant: false,
        status: "pending",
        assignedRoom: null,
        submittedAt: new Date(Date.now() - 2 * 60000).toISOString()
      }
    ],
    appointments: [
      {
        id: "apt-1",
        customerName: "Sarah Jenkins",
        customerPhone: "+1 (555) 432-1098",
        placeId: "place-hospital-1",
        placeName: "SmartCare Hospital",
        serviceId: "srv-h1",
        serviceName: "Doctor Consultation",
        date: todayStr,
        time: "11:30 AM",
        status: "confirmed",
        recommendedArrival: "11:15 AM",
        assignedToken: null,
        createdAt: new Date(Date.now() - 120 * 60000).toISOString()
      },
      {
        id: "apt-2",
        customerName: "George Mathew",
        customerPhone: "+1 (555) 555-0192",
        placeId: "place-village-1",
        placeName: "Perumbavoor Village Office",
        serviceId: "srv-v1",
        serviceName: "Certificate Application",
        date: todayStr,
        time: "02:00 PM",
        status: "confirmed",
        recommendedArrival: "01:45 PM",
        assignedToken: null,
        createdAt: new Date(Date.now() - 90 * 60000).toISOString()
      }
    ],
    feedbacks: [
      {
        id: "fb-1",
        tokenNumber: "H119",
        serviceName: "Doctor Consultation",
        customerName: "Alicia Keys",
        rating: 5,
        comment: "Excellent service! Received 2-minute alert on time and avoided the waiting room.",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString()
      }
    ],
    auditLogs: [
      {
        id: "aud-01",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        action: "TOKEN_CREATED",
        actor: "Robert Hayes",
        details: "Booked token H120 for Doctor Consultation at SmartCare Hospital"
      },
      {
        id: "aud-02",
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        action: "SPECIAL_ASSISTANCE_APPROVED",
        actor: "Dr. Marcus Vance",
        details: "Approved special assistance for Grandma Evelyn (Token H123) -> Assigned Consultation Room 2"
      },
      {
        id: "aud-03",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        action: "TOKEN_CREATED",
        actor: "Priya Nair",
        details: "Booked token V102 for Certificate Collection (Special Assistance PWD)"
      }
    ],
    notifications: [
      {
        id: "notif-1",
        timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        tokenNumber: "H121",
        title: "Your turn is approaching!",
        message: "Only 1 customer ahead. Estimated wait ~2 minutes. Please approach Consultation Room 1.",
        type: "two_minute_alert"
      },
      {
        id: "notif-2",
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        tokenNumber: "H123",
        title: "Special Assistance Approved",
        message: "Priority consultation confirmed with Dr. Marcus Vance in Consultation Room 2.",
        type: "special_assistance"
      }
    ]
  };
}

let dbCache = null;

export function loadDatabase() {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DATA_FILE)) {
    const initial = getInitialData();
    saveDatabase(initial);
    dbCache = initial;
    return dbCache;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    dbCache = JSON.parse(raw);
    return dbCache;
  } catch (err) {
    console.error("Error reading database.json, resetting to initial:", err);
    const initial = getInitialData();
    saveDatabase(initial);
    dbCache = initial;
    return dbCache;
  }
}

export function saveDatabase(data) {
  dbCache = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving database.json:", err);
  }
}

export function getDb() {
  return loadDatabase();
}
