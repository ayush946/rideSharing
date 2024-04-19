import React from "react";
import { useForm } from "react-hook-form";
import './registration.css'

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore"; 
import { getAuth, createUserWithEmailAndPassword} from "firebase/auth";

import {app,auth ,db}from "./firebase"
// const firebaseConfig = {
//     apiKey: "AIzaSyASWv_M5tw0bOVzWlh69xvogF2xtnO7P7E",
//     authDomain: "ridesharing-2c67f.firebaseapp.com",
//     projectId: "ridesharing-2c67f",
//     storageBucket: "ridesharing-2c67f.appspot.com",
//     messagingSenderId: "114749265679",
//     appId: "1:114749265679:web:3c67196a5c9cd7d0bad07a",
//     measurementId: "G-5XFBZXZ5RC"
//   };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);


// // Initialize Cloud Firestore and get a reference to the service
// const db = getFirestore(app);
//

async function onSubmit(data) {
  console.log(data);
  try {
    // Create a new user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    // Now that the user is authenticated, save data to Firestore using the user ID
    await setDoc(doc(db, 'users', user.uid), data);
    console.log('User created and data saved successfully!');
  } catch (error) {
    console.error('Error creating user:', error);
    // Handle errors appropriately, e.g., display an error message to the user
  }
}


function Registration(){
    const {register , handleSubmit} = useForm();
   
    return (
        <div className="App">
      <h1>Registration Form</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Name"
          {...register('name', { required: true })}
        />
        <input
          type="email"
          placeholder="Email address"
          {...register('email', { required: true })}
        />
        <input
          type="password"
          placeholder="Password"
          {...register('password', { required: true })}
        />
        <button type="submit">Register</button>
      </form>
    </div>
    )
}
export default Registration;