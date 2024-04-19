import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore, doc, setDoc } from "firebase/firestore";

import {app,db} from "./firebase"

function Ride() {
  const { rideId } = useParams();
  const [rideDetails, setRideDetails] = useState(null);
  const [location, setLocation] = useState(null);
  const [feedback, setFeedback] = useState(''); // Add this line

  useEffect(() => {
    const rideRef = ref(db, 'rides/' + rideId);
  
    // Fetch ride details from Firebase
    onValue(rideRef, (snapshot) => {
      const rideData = snapshot.val();
      if (rideData && rideData.destination) {
        setRideDetails(rideData);
      }
    });
  
    // Fetch live location from Firebase
    const locationRef = ref(db, 'locations/' + rideId);
    onValue(locationRef, (snapshot) => {
      const locationData = snapshot.val();
      if (locationData) {
        setLocation(locationData);
  
        // Check if the ride has reached its destination
        if (rideDetails && rideDetails.destination) {
          const distance = getDistanceFromLatLonInKm(
            locationData.latitude,
            locationData.longitude,
            rideDetails.destination.latitude,
            rideDetails.destination.longitude
          );
          if (distance < 0.1) { // less than 100 meters
            alert('The ride has reached its destination');
          }
        }
      }
    });
  }, [rideId, rideDetails]);
  
  const handleFeedbackSubmit = async () => {
    const db = getFirestore();
    const rideWithFeedback = { ...rideDetails, feedback }; // Combine ride details and feedback
    await setDoc(doc(db, "rides", rideId), rideWithFeedback);
    alert('Feedback submitted successfully!');
  };
  

  if (!rideDetails || !location) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Ride Details</h1>
      <p>Trip ID: {rideDetails.tripId}</p>
      <p>Driver Name: {rideDetails.driverName}</p>
      <p>Driver Phone Number: {rideDetails.driverPhoneNumber}</p>
      <p>Cab Number: {rideDetails.cabNumber}</p>
      <h2>Live Location</h2>
      <p>Latitude: {location.latitude}</p>
      <p>Longitude: {location.longitude}</p>
      <MapContainer center={[location.latitude, location.longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[location.latitude, location.longitude]} />
        {rideDetails.destination && <Marker position={[rideDetails.destination.latitude, rideDetails.destination.longitude]} />}
      </MapContainer>
      <h2>Submit Feedback</h2>
      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} />
      <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
    </div>
  );
}

// Function to calculate distance between two points in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if(lat1 == null || lat2 == null || lon1 == null || lon2 == null){
    return 1;
  }
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

export default Ride;
