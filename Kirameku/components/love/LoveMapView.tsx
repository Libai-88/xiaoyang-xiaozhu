"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HOME_CITY, MAP_PLACES_INIT } from "@/data/love";

const KEY = "love-map-places-v1";

export interface MapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  note: string;
  emoji: string;
}

function usePlaces() {
  const [places, setPlaces] = useState<MapPlace[]>(MAP_PLACES_INIT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPlaces(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const addPlace = (lat: number, lng: number) => {
    const name = window.prompt("给这个打卡点起个名字吧（比如：第一次约会的地方）", "我们的足迹");
    if (name === null) return;
    const note = window.prompt("留一句话（可跳过）", "");
    const place: MapPlace = {
      id: `${Date.now()}`,
      name: name.trim() || "我们的足迹",
      note: note || "",
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      emoji: "💗",
    };
    const next = [...places, place];
    setPlaces(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const removePlace = (id: string) => {
    const next = places.filter((p) => p.id !== id);
    setPlaces(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return { places, ready, addPlace, removePlace };
}

function ClickCatcher({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function HeartIcon() {
  return L.divIcon({
    className: "love-map-icon",
    html: '<span style="font-size:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))">💗</span>',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

export default function LoveMapView() {
  const { places, ready, addPlace, removePlace } = usePlaces();

  if (!ready) return null;

  return (
    <MapContainer
      center={[HOME_CITY.lat, HOME_CITY.lng]}
      zoom={5}
      scrollWheelZoom
      className="w-full h-full min-h-[300px] rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCatcher onAdd={addPlace} />
      {places.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={HeartIcon()}>
          <Popup>
            <div className="text-sm min-w-[140px]">
              <p className="font-semibold text-rose-500">
                {p.emoji} {p.name}
              </p>
              {p.note && <p className="text-slate-500 text-xs mt-1">{p.note}</p>}
              <button
                type="button"
                onClick={() => removePlace(p.id)}
                className="mt-2 text-[11px] text-slate-400 hover:text-rose-400"
              >
                删除这个打卡点
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
