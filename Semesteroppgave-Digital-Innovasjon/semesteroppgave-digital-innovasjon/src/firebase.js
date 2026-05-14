import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAd_GC68RVt7hPBM2Q2iYUudYgQIruiqPU",
  authDomain: "digital-innovasjon.firebaseapp.com",
  projectId: "digital-innovasjon",
  storageBucket: "digital-innovasjon.firebasestorage.app",
  messagingSenderId: "183101885847",
  appId: "1:183101885847:web:8d53ca5699a4b3d5c948d2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
