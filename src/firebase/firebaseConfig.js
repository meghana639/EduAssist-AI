import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwayfN07haPAzC7RiS-9P5qGs6DUI2fS4",
  authDomain: "eduassist-d010d.firebaseapp.com",
  projectId: "eduassist-d010d",
  storageBucket: "eduassist-d010d.firebasestorage.app",
  messagingSenderId: "864980691342",
  appId: "1:864980691342:web:b41be6c818948177ee9cdf",
  measurementId: "G-NNHKPS1SQT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);