import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "fleetly-admin",
  "appId": "1:933451921786:web:e329c2b8cd5ca6381f3ec3",
  "storageBucket": "fleetly-admin.firebasestorage.app",
  "apiKey": "AIzaSyD0GNBn1ZJiUJXHvqUjYTYlrxl-fp0-pgc",
  "authDomain": "fleetly-admin.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "933451921786"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
