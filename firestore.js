import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAC4fmP2rLFauRF_U9Cq49vk1qpuEOhGI8",
  authDomain: "tracker-a53fb.firebaseapp.com",
  projectId: "tracker-a53fb",
  storageBucket: "tracker-a53fb.appspot.com",
  messagingSenderId: "469878581302",
  appId: "1:469878581302:web:01f046be9a84668a50d097"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export const getData = (docId) => {
  return db.collection('data')
    .doc(docId)
    .get()
    .then((doc) => doc.data())
    .catch(console.warn)
};

export const saveData = (newData, docId) => (
  db.collection('data').doc(docId).set(newData)
);