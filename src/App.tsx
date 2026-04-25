import React, { useState, useEffect, useRef } from "react";
import * as L from "leaflet";
import 'leaflet/dist/leaflet.css';

type Accommodation = {
  ID: number;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
};

export default function App() {
    const [location, setLocation] = useState("");
    const [results, setResults] = useState<Accommodation[]>([]);
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState<"success" | "error">("success")

    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    
    const [username, setUsername] = useState<string | null>(null);
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    useEffect(() => {
        async function checkLogin() {
            const response = await fetch('/login');
            const data = await response.json();
            setUsername(data.username);
            
        }
        checkLogin();
    }, []);

    useEffect( (()=> {
        loadMap();
    }), []);

    useEffect( (()=> {
       loadMarkers(); 
    }), [results]);

    function loadMap() {
        if (mapRef.current === null) {
            mapRef.current = L.map("map1")
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "Copyright OSM contributors, OBDL"
        }).addTo(mapRef.current);
        mapRef.current.setView(L.latLng(50.9, -1.4), 10)
        }
    };

    function loadMarkers() {
        if (!mapRef.current) return;

        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = [];

        results.forEach(accommodation => {
            const marker = L.marker(L.latLng(accommodation.latitude, accommodation.longitude)).addTo(mapRef.current!);

            marker.bindPopup(`${accommodation.name}, "${accommodation.description}"`);
            markersRef.current.push(marker);
        });

        if (results.length > 0) {
            mapRef.current.setView(L.latLng(results[0].latitude, results[0].longitude), 12);
        };
    };

    async function login() {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginUsername, password: loginPassword })
        });
        const data = await response.json();

        if (response.ok) {
            setUsername(data.username);
            setLoginUsername("");
            setLoginPassword("");
        } else {
            alert('Incorrect username or password. Please try again.');
        }
    };

    async function logout() {
        await fetch('/logout', { method: 'POST' });
        setUsername(null);
    };




    async function searchAccommodation() {
    setMessage("");
    const response = await fetch(`/accommodation/location/${encodeURIComponent(location)}`);
    const data = await response.json();
    setResults(data);
  };

   async function bookAccommodation(accID: number) {
        setMessage("");
        const response = await fetch("/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accID: accID,
                thedate: 260601,
                userID: 1,
                npeople: 1,
            }),
        });
        const data = await response.json();

        if (response.ok) {
            setMessageType("success");
            setMessage(`Booking confirmed! Your reference number is ${data.id}.`);
        } else if (response.status === 400) {
            setMessageType("error");
            setMessage(`Your booking could not be completed because some required information was missing. Please try again.`);
        } else if (response.status === 401) {
            setMessageType("error");
            setMessage("You must be logged in to make a booking.");
        } else {
            setMessageType("error");
            setMessage("Something went wrong while processing your booking. Please try again later.");
        }
    }


    return (
        <div>
            <h1>Places To Stay</h1>

            {username === null ? (
                <div>
                    <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Username"
                    />
                    <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button onClick={login}>Login</button>
                </div>
            ) : (
                <div>
                    <p>Logged in as {username}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            )}
 
            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
            />
 
            <button onClick={searchAccommodation}>Search</button>
 
            {message && (
               <h2><p style={{ color: messageType === "success" ? "green" : "red" }}>
                    <strong>{message}</strong>
                </p></h2>
            )}
 
            <div>
                {results.map((accommodation) => (
                    <div key={accommodation.ID}>
                        {accommodation.name} - {accommodation.type} {accommodation.location} - Coordinates: {accommodation.latitude}, {accommodation.longitude}, "{accommodation.description}"
                        <button onClick={() => bookAccommodation(accommodation.ID)}>Book</button>
                    </div>
                ))}
            </div>
 
            <div id="map1" style={{ width: "800px", height: "500px", marginTop: "20px" }}></div>
        </div>
    );
}