import fs from "fs";
import path from "path";
import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const LOCAL_DB_PATH = "e:/skilizee/users-db.json";

const DEFAULT_USERS = [
  {
    email: "pa2@skillizee.io",
    password: "Admin@123",
    roles: ["linkedin", "social_media", "podcast", "admin"],
    isAdmin: true,
    name: "System Admin"
  },
  {
    email: "linkedin@skillizee.io",
    password: "User@123",
    roles: ["linkedin"],
    isAdmin: false,
    name: "LinkedIn Manager"
  },
  {
    email: "social@skillizee.io",
    password: "User@123",
    roles: ["social_media"],
    isAdmin: false,
    name: "Social Media Manager"
  },
  {
    email: "both@skillizee.io",
    password: "User@123",
    roles: ["linkedin", "social_media"],
    isAdmin: false,
    name: "Campaign Manager"
  }
];

// Initialize Firestore
let firestoreDb = null;
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId && clientEmail && privateKey) {
  try {
    const appsList = getApps();
    let app;
    if (appsList.length === 0) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      app = getApp();
    }
    firestoreDb = getFirestore(app);
    console.log("Firebase Admin SDK successfully initialized for db.js");
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed in db.js, falling back to local file:", error);
  }
}

// Memory fallback if both firestore and fs fail
let memoryStore = [...DEFAULT_USERS];

// Helper to write to JSON file
function writeLocalDb(users) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to local db file:", err);
  }
}

// Helper to read from JSON file
function readLocalDb() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      writeLocalDb(DEFAULT_USERS);
      return [...DEFAULT_USERS];
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    const users = JSON.parse(data);
    if (!Array.isArray(users) || users.length === 0) {
      writeLocalDb(DEFAULT_USERS);
      return [...DEFAULT_USERS];
    }
    return users;
  } catch (err) {
    console.error("Failed to read local db file, using memory:", err);
    return memoryStore;
  }
}

// Seed firestore if empty
async function seedFirestoreIfEmpty() {
  if (!firestoreDb) return;
  try {
    const snapshot = await firestoreDb.collection("skilizee_users").limit(1).get();
    if (snapshot.empty) {
      console.log("Seeding default users to Firestore...");
      for (const user of DEFAULT_USERS) {
        await firestoreDb.collection("skilizee_users").doc(user.email).set({
          ...user,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  } catch (err) {
    console.error("Error seeding Firestore:", err);
  }
}

// Run seeding asynchronously
if (firestoreDb) {
  seedFirestoreIfEmpty();
}

export async function getUsers() {
  if (firestoreDb) {
    try {
      const snapshot = await firestoreDb.collection("skilizee_users").get();
      const users = [];
      snapshot.forEach(doc => {
        users.push(doc.data());
      });
      return users;
    } catch (err) {
      console.error("Firestore getUsers failed, falling back to local file:", err);
    }
  }
  return readLocalDb();
}

export async function saveUser(user) {
  if (!user.email) throw new Error("Email is required");
  const normalizedEmail = user.email.toLowerCase().trim();
  const updatedUser = {
    ...user,
    email: normalizedEmail,
    updatedAt: new Date().toISOString()
  };

  if (firestoreDb) {
    try {
      await firestoreDb.collection("skilizee_users").doc(normalizedEmail).set(updatedUser, { merge: true });
      return updatedUser;
    } catch (err) {
      console.error("Firestore saveUser failed, falling back to local file:", err);
    }
  }

  // Fallback local file update
  const users = readLocalDb();
  const index = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
  if (index >= 0) {
    users[index] = { ...users[index], ...updatedUser };
  } else {
    updatedUser.createdAt = new Date().toISOString();
    users.push(updatedUser);
  }
  writeLocalDb(users);
  memoryStore = users;
  return updatedUser;
}

export async function deleteUser(email) {
  if (!email) throw new Error("Email is required");
  const normalizedEmail = email.toLowerCase().trim();

  // Prevent deleting the main admin
  if (normalizedEmail === "pa2@skillizee.io") {
    throw new Error("Cannot delete system administrator");
  }

  if (firestoreDb) {
    try {
      await firestoreDb.collection("skilizee_users").doc(normalizedEmail).delete();
      return true;
    } catch (err) {
      console.error("Firestore deleteUser failed, falling back to local file:", err);
    }
  }

  // Fallback local file update
  const users = readLocalDb();
  const filtered = users.filter(u => u.email.toLowerCase() !== normalizedEmail);
  writeLocalDb(filtered);
  memoryStore = filtered;
  return true;
}

export async function authenticate(email, password) {
  if (!email || !password) return null;
  const normalizedEmail = email.toLowerCase().trim();

  const users = await getUsers();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
  if (!user) return null;

  // Return user without password for safety
  const { password: _, ...safeUser } = user;
  return safeUser;
}
