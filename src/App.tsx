import React, { useState } from "react";

type Accommodation = {
  ID: number;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
};

export default function App() {
    const [location, setLocation] = useState("");
    const [results, setResults] = useState<Accommodation[]>([]);
    const [message, setMessage] = useState("")


    async function searchAccommodation() {
    setMessage("");
    const response = await fetch(`/accommodation/location/${encodeURIComponent(location)}`);
    const data = await response.json();
    setResults(data);
  }

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
        if (data.id) {
            setMessage(`Booking confirmed! Booking ID: ${data.id}`);
        } else {
            setMessage("Booking failed. Please try again.");
        }
    }


    return (
        <div>
            <h1>Places To Stay</h1>
 
            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
            />
 
            <button onClick={searchAccommodation}>Search</button>
 
            {message && <p><strong>{message}</strong></p>}
 
            <div>
                {results.map((accommodation) => (
                    <div key={accommodation.ID}>
                        {accommodation.name} - {accommodation.type} {accommodation.location} - Coordinates: {accommodation.latitude}, {accommodation.longitude}
                        <button onClick={() => bookAccommodation(accommodation.ID)}>Book</button>
                    </div>
                ))}
            </div>
        </div>
    );
}