import "./style.css";
import "leaflet/dist/leaflet.css";

import L from "leaflet";

// マップの初期化
const map = L.map("map").setView([33.18, 131.62], 16);

// タイルレイヤーを追加（OSM）
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Overpass APIを利用して道路データを取得
const fetchRoadData = () => {
  // Overpass APIクエリ: 特定のエリア内の道路データを取得
  const bbox = map.getBounds(); // 現在のマップの表示範囲
  const query = `
    [out:json];
    way["highway"]( ${bbox.getSouth()}, ${bbox.getWest()}, ${bbox.getNorth()}, ${bbox.getEast()} );
    out geom;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
    query
  )}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // GeoJSON形式で道路を描画
      data.elements.forEach((element) => {
        if (element.type === "way" && element.geometry) {
          const coordinates = element.geometry.map((point) => [
            point.lat,
            point.lon,
          ]);
          L.polyline(coordinates, {
            color: "blue",
            weight: 3,
          }).addTo(map);
        }
      });
    })
    .catch((error) => console.error("エラーが発生しました:", error));
};

// マップの移動終了時に道路データを取得
map.on("moveend", fetchRoadData);

// 初回ロード時に道路データを取得
fetchRoadData();