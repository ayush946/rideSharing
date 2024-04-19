import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import RideDataCard from "./rideDataCard";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, addDoc, collection , getDocs, deleteDoc, updateDoc} from "firebase/firestore"; 

import {app,db, database} from "./firebase"
function Admin(user) {
    const [showRides, setShowRides] = useState(false);

    const logout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
    };
    const handleShowRides = () =>{
        setShowRides(true);
    };
    
    return (
        <div>
            <button onClick={handleShowRides}>Show Rides</button>
            {showRides && <Rides/>}
            <button onClick={logout}>Logout</button>
        </div>
    );
}

const Rides = () => {
    const [rideData, setRideData] = useState([]);
    
    useEffect( () => {
      const fetchData = async () => {
        const querySnapshot = await getDocs(collection(database, "rides")); 
        setRideData(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchData();
    }, [])
  
    return (
      <div> 
        {rideData.map((data, index) => (
          <RideDataCard key={index} data= {data}/>
        ))}
      </div>
    )
  }
  
export default Admin;