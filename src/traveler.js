import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import ridesData from './rides.json'; // path to your JSON file
import { v4 as uuidv4 } from 'uuid';
import {  ref, set } from "firebase/database";
import {db} from "./firebase"
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Polyline } from 'react-leaflet';
import { remove } from "firebase/database";

async function generateLink(rideDetails) {
    try {
      const rideId = uuidv4();
      const newRideRef = ref(db, 'rides/' + rideId);
      await set(newRideRef, rideDetails);
      const rideUrl = `https://localhost:3000/ride/${rideId}`;
      return rideUrl;
    } catch (error) {
      console.error("Error generating link: ", error);
    }
  }
function BookRide() {
    const [rides, setRides] = useState([]);
    const [link, setLink] = useState();
    const [showLink, setShowLink] = useState(false);
    const [linkId, setLinkId] = useState();
    console.log(ridesData);
    useEffect(() => {
        setRides(ridesData);
    }, []);

    const [selectedRide, setSelectedRide] = useState(null);

    const handleStartRide = async (ride) => {
      try {
        setSelectedRide(ride);
        const rideLink = await generateLink(ride);
        let parts = rideLink.split('/');
        const rideId = parts[parts.length - 1];
        setLink(rideLink);
        setLinkId(rideId);
        setShowLink(true);
  
        // Start watching the user's position
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            const locationRef = ref(db, 'locations/' + rideId);
            set(locationRef, { latitude, longitude });
          });
        } else {
          console.log("Geolocation is not supported by this browser.");
        }
      } catch (error) {
        console.error("Error in handleStartRide: ", error);
      }
    }
    const [location, setLocation] = useState(null);
    

    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        });
      }
    }, []);

   

    // Add this function to delete the ride from the database
    async function deleteRide(rideId) {
      try {
        const rideRef = ref(db, 'rides/' + rideId);
        await remove(rideRef);
      } catch (error) {
        console.error("Error deleting ride: ", error);
      }
    }

    // Call deleteRide function when the journey is complete
    const handleCompleteRide = async () => {
      try {
        await deleteRide(linkId);
        setShowLink(false);
        setSelectedRide(null);
      } catch (error) {
        console.error("Error in handleCompleteRide: ", error);
      }
    };

// Add a button to complete the ride



    return (
        <div>
          {!showLink && 
            rides.map((ride) => (
              <div key={ride.id}>
                  <p>{ride.name} - {ride.location}</p>
                  <button onClick={() => handleStartRide(ride)}>Start Ride</button>
              </div>
          ))
          }
          {showLink && <Link to={`/ride/${linkId}`}>Start Ride</Link>}
          {showLink && location && selectedRide && (
            <MapContainer center={[location.latitude, location.longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[location.latitude, location.longitude]} />
              {selectedRide.destination && <Marker position={[selectedRide.destination.latitude, selectedRide.destination.longitude]} />}
            </MapContainer>
          )}          
          {showLink && <button onClick={handleCompleteRide}>Complete Ride</button>}
        </div>
    );
}

function Traveler(user) {
    const logout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
        }).catch((error) => {
        });
    };

    const [bookRide, setBookRide] = useState(false);
    const handleBookRide = () =>{
        setBookRide(true);
    }
    const handleReviewRide = () =>{

    }
    return (
        <div> 
            <button onClick={handleBookRide}>Book a ride</button>
            {bookRide && <BookRide/>}
            <button onClick={handleReviewRide}> Review ride</button>
            <button onClick= {logout}> LogOut</button>
        </div>
    );
}


export default Traveler;