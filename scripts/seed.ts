import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const templates = [
  { id: "t1", name: "SARS Tax Refund", brand: "SARS", difficulty: "easy", subject: "URGENT: Your SARS tax refund of R3,420 is ready", category: "Tax" },
  { id: "t2", name: "FNB Fraud Alert", brand: "FNB", difficulty: "medium", subject: "FNB: Suspicious login detected on your account", category: "Banking" },
  { id: "t3", name: "Microsoft Login Expired", brand: "Microsoft", difficulty: "easy", subject: "Action required: Your Microsoft 365 password has expired", category: "Tech" },
  { id: "t4", name: "DHL Delivery Failed", brand: "DHL", difficulty: "medium", subject: "DHL: Your package delivery failed — reschedule now", category: "Delivery" },
  { id: "t5", name: "Vodacom Account Suspended", brand: "Vodacom", difficulty: "hard", subject: "Vodacom: Your account has been temporarily suspended", category: "Telecom" },
  { id: "t6", name: "Standard Bank OTP Verification", brand: "Standard Bank", difficulty: "hard", subject: "Standard Bank: Verify your identity to unblock your account", category: "Banking" },
];

const employees = [
  { id: "e1", name: "Thandi Dlamini", email: "thandi@demo-client.co.za", department: "Finance", riskScore: "high", clickCount: 4, campaignsReceived: 3, trainingCompleted: 1 },
  { id: "e2", name: "Sipho Nkosi", email: "sipho@demo-client.co.za", department: "Operations", riskScore: "medium", clickCount: 2, campaignsReceived: 3, trainingCompleted: 2 },
  { id: "e3", name: "Nadia van der Merwe", email: "nadia@demo-client.co.za", department: "HR", riskScore: "low", clickCount: 0, campaignsReceived: 3, trainingCompleted: 3 },
  { id: "e4", name: "Kagiso Sithole", email: "kagiso@demo-client.co.za", department: "Sales", riskScore: "high", clickCount: 5, campaignsReceived: 3, trainingCompleted: 1 },
  { id: "e5", name: "Priya Moodley", email: "priya@demo-client.co.za", department: "Finance", riskScore: "medium", clickCount: 2, campaignsReceived: 3, trainingCompleted: 2 },
  { id: "e6", name: "Andile Zulu", email: "andile@demo-client.co.za", department: "IT", riskScore: "low", clickCount: 0, campaignsReceived: 3, trainingCompleted: 3 },
  { id: "e7", name: "Chanté Botha", email: "chante@demo-client.co.za", department: "Marketing", riskScore: "high", clickCount: 3, campaignsReceived: 3, trainingCompleted: 1 },
  { id: "e8", name: "Relebogile Mokoena", email: "relebogile@demo-client.co.za", department: "Operations", riskScore: "medium", clickCount: 1, campaignsReceived: 3, trainingCompleted: 2 },
];

const campaigns = [
  { id: "c1", name: "SARS Tax Refund — Jan 2026", templateId: "t1", status: "completed", stats: { sent: 8, opened: 7, clicked: 4, reported: 1, trainingCompleted: 3 } },
  { id: "c2", name: "FNB Fraud Alert — Feb 2026", templateId: "t2", status: "completed", stats: { sent: 8, opened: 6, clicked: 3, reported: 2, trainingCompleted: 3 } },
  { id: "c3", name: "Microsoft Login — Mar 2026", templateId: "t3", status: "completed", stats: { sent: 8, opened: 5, clicked: 2, reported: 3, trainingCompleted: 2 } },
];

const SEED_ORG_ID = "demo-org";

async function seed() {
  console.log("🌱 Seeding PhishGuard Pro...\n");

  // Seed org
  await setDoc(doc(db, "organizations", SEED_ORG_ID), {
    id: SEED_ORG_ID,
    name: "Demo Client (Linfy Tech)",
    plan: "pro",
    seats: 25,
    ownerId: "seed",
    createdAt: Timestamp.now(),
  });
  console.log("✅ Organization seeded");

  // Seed templates
  for (const t of templates) {
    await setDoc(doc(db, "templates", t.id), { ...t, previewHtml: `<p>${t.subject}</p>` });
  }
  console.log("✅ 6 phishing templates seeded");

  // Seed employees
  for (const e of employees) {
    await setDoc(doc(db, "employees", e.id), {
      ...e,
      orgId: SEED_ORG_ID,
      lastClickDate: null,
      createdAt: Timestamp.now(),
    });
  }
  console.log("✅ 8 employees seeded");

  // Seed campaigns
  for (const c of campaigns) {
    await setDoc(doc(db, "campaigns", c.id), {
      ...c,
      orgId: SEED_ORG_ID,
      targetEmployeeIds: employees.map(e => e.id),
      scheduledAt: Timestamp.now(),
      sentAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  }
  console.log("✅ 3 historical campaigns seeded");

  console.log("\n🎉 Seed complete! Open your Firebase console to verify.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
