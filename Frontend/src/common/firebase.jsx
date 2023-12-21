import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB6BzhNzbAjPwe_XuZgPFlQW09ubeeGZY8",
  authDomain: "fullstack-blogging-site-007.firebaseapp.com",
  projectId: "fullstack-blogging-site-007",
  storageBucket: "fullstack-blogging-site-007.appspot.com",
  messagingSenderId: "410695806694",
  appId: "1:410695806694:web:0158d79fd231b93595d527"
};

const app = initializeApp(firebaseConfig);

//google authorization

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async() => {
    
    let user = null;

    await signInWithPopup(auth, provider)
    .then((result) => {
        user = result.user
    })
    .catch((err) => {
        console.log(err);
    })
    
    return user;
}