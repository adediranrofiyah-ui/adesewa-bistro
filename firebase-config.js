// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVRy13LjxYCyk041P3V0CHiC3mWtVlUHc",
  authDomain: "adesewabistro.firebaseapp.com",
  projectId: "adesewabistro",
  storageBucket: "adesewabistro.firebasestorage.app",
  messagingSenderId: "844386344904",
  appId: "1:844386344904:web:34440549946a617da52afd",
  measurementId: "G-Z8280H9V6E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
