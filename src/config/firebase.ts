// import firebase from "firebase/app";
// import "firebase/database";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBnQO1apkKZAyN7YkY_L51qfn4Lg0pPJsg",
  authDomain: "familytree-1de04.firebaseapp.com",
  databaseURL: "https://familytree-1de04-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "familytree-1de04",
  storageBucket: "familytree-1de04.appspot.com",
  messagingSenderId: "470633493597",
  appId: "1:470633493597:web:56d43ddfe914d2d62889b4"
}; 

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);