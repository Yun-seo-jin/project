import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function Trip({ trip }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [127.12, 37.41],
      zoom: 12
    });

    map.current.on("load", () => {
      map.current.addSource("paths", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      map.current.addLayer({
        id: "taxi-path",
        type: "line",
        source: "paths",
        paint: {
          "line-width": 4,
          "line-color": ["match", ["get", "phase"],
            "to_origin", "#ffcc00",          // 승객 태우러 가는 중 (노란색)
            "to_destination", "#ffffff",      // 승객 태운 후 이동 (흰색)
            "#ffffff"
          ]
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!map.current || trip.length === 0) return;

    // 택시별 polyline 생성
    const grouped = {};

    trip.forEach(frame => {
      const vid = frame.vehicle_id;
      if (!grouped[vid]) grouped[vid] = [];
      grouped[vid].push(frame);
    });

    // GeoJSON Feature로 변환
    const features = [];

    Object.entries(grouped).forEach(([vid, frames]) => {
      const coords = frames.map(f => [f.lon, f.lat]);

      features.push({
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: {
          vehicle_id: parseInt(vid),
          phase: frames[0].phase   // 모든 프레임에 phase가 있음
        }
      });
    });

    map.current.getSource("paths").setData({
      type: "FeatureCollection",
      features
    });

  }, [trip]);

  return (
    <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />
  );
}

export default Trip;
