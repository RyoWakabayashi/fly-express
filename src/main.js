import "./style.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw";

import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

var map = L.map("map", { drawControl: true });

// デフォルトのアイコンを変更
var DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 初期位置を設定
map.setView([33.18, 131.62], 16);

// ポップアップフォーム
var popupForm = `
  <form
    id="popup-form"
    class="flex flex-col"
    data-lat="@@lat@@"
    data-lng="@@lng@@"
  >
    <h2 class="font-bold mb-3 text-lg">場所の追加</h2>
    <div class="w-full flex justify-between mb-2">
      <label for="point-name">名前</label>
      <input type="text" id="point-name" class="border p-1" >
    </div>
    <div class="w-full flex justify-between mb-2">
      <label for="description">説明</label>
      <input type="text" id="description" class="border p-1" >
    </div>
    <div class="w-full flex justify-end">
      <button
        type="submit"
        id="btn-submit"
        class="border rounded p-1 bg-neutral-50"
      >
        保存
      </button>
    </div>
  </form>
`;

// 現在地を取得
navigator.geolocation.getCurrentPosition((position) => {
  map.panTo([position.coords.latitude, position.coords.longitude]);

  fetch("/api/locations")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      data.forEach((location) => {
        var marker = L.marker([location.latitude, location.longitude]).addTo(
          map,
        );
        marker.bindPopup(location.point_name);
      });
    });
});

// 描画した図形を格納するレイヤー
let drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

map.on("draw:created", (e) => {
  drawnItems.addLayer(e.layer);
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let trackingPath = L.polyline([], { color: 'blue' }).addTo(map);

function updatePosition() {
  navigator.geolocation.getCurrentPosition((position) => {
    const latlng = [position.coords.latitude, position.coords.longitude];
    trackingPath.addLatLng(latlng);
    map.panTo(latlng);
  });
}

setInterval(updatePosition, 5000);

// フォーム送信時の処理
function onFormSubmit(e) {
  e.preventDefault();
  console.log(e);
  fetch("/api/locations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude: e.target.dataset.lat,
      longitude: e.target.dataset.lng,
      point_name: e.target.querySelector("#point-name").value,
      description: e.target.querySelector("#description").value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      var marker = L.marker([data.latitude, data.longitude]).addTo(map);
      marker.bindPopup(data.point_name).openPopup();
    });
}

// マップダブルクリック時の処理
function onMapDbClick(e) {
  L.popup({ closeButton: true, minWidth: 240 })
    .setLatLng(e.latlng)
    .setContent(
      popupForm
        .replace("@@lat@@", e.latlng.lat)
        .replace("@@lng@@", e.latlng.lng),
    )
    .openOn(map);

  document
    .getElementById("popup-form")
    .addEventListener("submit", onFormSubmit);
}

map.on("dblclick", onMapDbClick);
