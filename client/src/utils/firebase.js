// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: "lendower4",
  storageBucket: "lendower4.appspot.com",
  messagingSenderId: "555084468070",
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//логін через гуг
const provider = new GoogleAuthProvider()
const auth = getAuth()
// використовуємо функціонал фаєрбейс щоб отримати дані з гугл акаунта
export const authWithGoogle = async (req, res) => {
    let user = null
    await signInWithPopup(auth, provider).then((result)=>{
        user = result.user
    }).catch(e=>console.log(e))

    return user
}