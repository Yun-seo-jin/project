import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const [frames, setFrames] = useState([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    fetch("/trips.json")
      .then((res) => res.json())
      .then((data) => setFrames(data));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const taxis = {};

  frames.forEach((f) => {
    if (f.time <= time) {
      taxis[f.taxi_id] = f;
    }
  });

  return (
    <MapContainer
      center={[37.44, 127.13]}
      zoom={13}
      style={{ width: "100vw", height: "100vh" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {Object.values(taxis).map((tx) => (
        <CircleMarker
          key={tx.taxi_id}
          center={[tx.lat, tx.lon]}
          radius={6}
          color="red"
        />
      ))}
    </MapContainer>
  );
}

export default App;
