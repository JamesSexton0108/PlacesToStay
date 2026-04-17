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
    const [messageType, setMessageType] = useState<"success" | "error">("success")


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
                thedate: null,
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
        } else {
            setMessageType("error");
            setMessage("Something went wrong while processing your booking. Please try again later.");
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