import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Enable long polling to bypass potential websocket issues in proxy environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Test connection quietly
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("permission-denied")) {
      // Permission denied is actually a good sign - it means we reached the server!
      console.log("Firestore connection verified.");
      return;
    }
    console.warn("Firestore connectivity warning:", error instanceof Error ? error.message : "Offline mode");
  }
}
testConnection();
