////////// SCRIPT BEGIN
// 外部レイヤの取得
function getLayerFromURL(url,makeLayer) {
  var layer = null;
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if(req.readyState == 4 && req.status == 200){
      layer = makeLayer(req.responseText);
    };
  };
  req.open("GET",url, false);
  req.send(null);
  return layer;
};

// CSVレイヤの定義（lat,lon,icon,html）
function csvMarker(feature,latlng) { return L.marker(latlng,{icon:L.icon({iconUrl:feature.properties.icon,iconSize:[32,32],}),}); };
function csvPopup(feature,layer) { layer.bindPopup(feature.properties.html); };
function csvLayer(csv) { return L.geoCsv(csv, { pointToLayer:csvMarker, onEachFeature:csvPopup, firstLineTitles:true,latitudeTitle:'lat',longitudeTitle:'lon',fieldSeparator:',', }); };

// USGSレイヤの定義
function usgsMarker(feature,latlng) { return L.circleMarker(latlng, { radius:Math.pow(feature.properties.mag,2)/2.0, }); };
function usgsPopup(feature,layer) { layer.bindPopup((new Date(feature.properties.time)).toUTCString() + "<br>" + feature.properties.title); };
function usgsLayer(json) { return L.geoJSON(JSON.parse(json), { pointToLayer:usgsMarker, onEachFeature:usgsPopup, }); };

// タイルURLの生成
function GSI_URL(KEY,EXT) { return "https://cyberjapandata.gsi.go.jp/xyz/"+KEY+"/{z}/{x}/{y}."+EXT; };
function GSI_OPT(MIN,MAX,OPA) { return {opacity:OPA, /*minNativeZoom:MIN,*/ maxNativeZoom:MAX, attribution:"<a href='https://maps.gsi.go.jp/development/ichiran.html'>国土地理院</a>" }; };
function MAP_OPT(MIN,MAX,OPA) { return {opacity:OPA, /*minNativeZoom:MIN,*/ maxNativeZoom:MAX, attribution:"AIST/OSM/OPTM/WMT" }; };
// ベース地図の定義
const BASE = 1.0;
const baseTiles = {
  "GSI 淡色地図":	L.tileLayer(GSI_URL("pale","png"),GSI_OPT(5,18,BASE)),
  "GSI 標準地図":	L.tileLayer(GSI_URL("std","png"),GSI_OPT(5,18,BASE)),
  "GSI 白地図":		L.tileLayer(GSI_URL("blank","png"),GSI_OPT(5,14,BASE)),
  "GSI 英語地図":	L.tileLayer(GSI_URL("english","png"),GSI_OPT(5,11,BASE)),
  "OSM 標準地図":	L.tileLayer('https://tile.openstreetmap.jp/{z}/{x}/{y}.png',MAP_OPT(2,18,BASE)),
//"OSM 白黒図":		L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png',MAP_OPT(2,16,BASE)),
//"OSM 地形図":		L.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.png',MAP_OPT(2,16,BASE)),
//"OSM 水彩画":		L.tileLayer('http://tile.stamen.com/watercolor/{z}/{x}/{y}.png',MAP_OPT(2,16,BASE)),
};
// レイヤ地図の定義
const OVER = 0.7;
const overTiles = {
  "GFS 天気予報":	getLayerFromURL("./layer/sdp_layer.csv",csvLayer),
//"USGS 震源地":	getLayerFromURL("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",usgsLayer),
//"USGS 震源地":	getLayerFromURL("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",usgsLayer),
  "GSI 色別標高図":	L.tileLayer(GSI_URL("relief","png"),GSI_OPT(5,15,OVER)),
  "GSI 陰影起伏図":	L.tileLayer(GSI_URL("hillshademap","png"),GSI_OPT(2,16,OVER)),
//"GSI 赤色立体図":	L.tileLayer(GSI_URL("sekishoku","png"),GSI_OPT(2,14,OVER)),
//"GSI 傾斜量図":	L.tileLayer(GSI_URL("slopemap","png"),GSI_OPT(3,15,OVER)),
  "GSI 傾斜量区分図":	L.tileLayer(GSI_URL("slopezone1map","png"),GSI_OPT(3,15,OVER)),
  "GSI 活断層図":	L.tileLayer(GSI_URL("afm","png"),GSI_OPT(11,16,OVER)),
  "GSI 土地条件図":	L.tileLayer(GSI_URL("lcm25k_2012","png"),GSI_OPT(10,16,OVER)),
//"GSI 土地条件図":	L.tileLayer(GSI_URL("lcm25k","png"),GSI_OPT(14,16,OVER)),
  "GSI 治水地形分類":	L.tileLayer(GSI_URL("lcmfc2","png"),GSI_OPT(11,16,OVER)),
  "GSI 明治の低湿地":	L.tileLayer(GSI_URL("swale","png"),GSI_OPT(10,16,OVER)),
  "GSI 航空写真":	L.tileLayer(GSI_URL("seamlessphoto","jpg"),GSI_OPT(2,18,OVER)),
  "GSI 1988-1990年":	L.tileLayer(GSI_URL("gazo4","jpg"),GSI_OPT(10,17,OVER)),
  "GSI 1984-1986年":	L.tileLayer(GSI_URL("gazo3","jpg"),GSI_OPT(10,17,OVER)),
  "GSI 1979-1983年":	L.tileLayer(GSI_URL("gazo2","jpg"),GSI_OPT(10,17,OVER)),
  "GSI 1974-1978年":	L.tileLayer(GSI_URL("gazo1","jpg"),GSI_OPT(10,17,OVER)),
  "GSI 1961-1969年":	L.tileLayer(GSI_URL("ort_old10","png"),GSI_OPT(10,17,OVER)),
  "GSI 1945-1950年":	L.tileLayer(GSI_URL("ort_USA10","png"),GSI_OPT(10,17,OVER)),
  "AIST 地質図":	L.tileLayer('https://gbank.gsj.jp/seamless/v2/api/1.2/tiles/{z}/{y}/{x}.png',MAP_OPT(10,13,OVER)),
  "OPTM 公共交通":	L.tileLayer('http://www.openptmap.org/tiles/{z}/{x}/{y}.png',MAP_OPT(4,17,BASE)),
//"ORM 鉄道路線":	L.tileLayer('https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',MAP_OPT(2,19,BASE)),
//"OSM 航路標識":	L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',MAP_OPT(4,18,BASE)),
//"WMT ハイキング":	L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',MAP_OPT(5,16,BASE)),
//"WMT サイクリング":	L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png',MAP_OPT(5,16,BASE)),
};
// 地図作成
var thisMap = null;
function _onLoad() {
  // 地図初期化
  thisMap = L.map('mapContainer',{zoomControl:false, center:[37.0,137.0], zoom:5, layers:[baseTiles["GSI 淡色地図"],overTiles["GFS 天気予報"]],});
  thisMap.on('locationfound', onLocationFound);
  thisMap.on('locationerror', onLocationError);
  thisMap.on('contextmenu',onContextMenu);
  // レイヤ登録
  //L.control.zoom().addTo(thisMap);
  L.control.scale().addTo(thisMap);
  L.control.layers(baseTiles,overTiles).addTo(thisMap);
  // 地名検索窓
  const osmGeocoder = new L.Control.OSMGeocoder({position:'topleft'});
  thisMap.addControl(osmGeocoder);
};
// 現在時刻
function nowString() {
  const DoW = ["日","月","火","水","木","金","土"];
  const now = new Date();
  return (DoW[now.getDay()]+"曜") + ("0"+now.getHours()).slice(-2) +"時"+ ("0"+now.getMinutes()).slice(-2) +"分";
};
// 距離計算
function toRadian(degree) { return degree*Math.PI/180.; };
function getDistance(src,dst) {
  const 
    lon1 = toRadian(src.lng), lat1 = toRadian(src.lat),
    lon2 = toRadian(dst.lng), lat2 = toRadian(dst.lat);
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  const a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
  const c = 2. * Math.asin(Math.sqrt(a));
  return c * 6371.;
};
// 現在位置
var hereMarker = null;
var hereHeader = "";
function onLocationFound(e) {
  if (hereMarker) { thisMap.removeLayer(hereMarker); };
  hereMarker = L.marker(e.latlng);
  hereHeader = "現在位置<br>" + nowString();
  hereMarker.addTo(thisMap).bindPopup(hereHeader).openPopup();
  updateArrow();
};
function onLocationError(e) {
  alert(e.message);
};
function _hereButton() {
  thisMap.locate({setView:true, maxZoom:15});
};
// 目的位置
var destMarker = null;
function onContextMenu(e) {
  if (destMarker) { thisMap.removeLayer(destMarker); };
  destMarker = L.marker(e.latlng);
  var destPopup = "目的位置<br>" + nowString();
  destMarker.addTo(thisMap).bindPopup(destPopup);
  updateArrow();
};
// 目的方位
var destArrow = null;
function updateArrow() {
  if (destArrow) { thisMap.removeLayer(destArrow); };
  if (hereMarker && destMarker) {
    // 目的位置向け矢印の更新
    const src = hereMarker.getLatLng();
    const dst = destMarker.getLatLng();
    destArrow = L.polyline([[src.lat,src.lng],[dst.lat,dst.lng]],{opacity:0.5});
    destArrow.addTo(thisMap);
    // 現在位置テキストの更新
    const dist = getDistance(src,dst);
    const angl = L.GeometryUtil.bearing(src,dst);
    const destText = "<br>方位"+ angl.toFixed(1) +"度<br>距離" + dist.toFixed(1) +"km";
    hereMarker.bindPopup(hereHeader + destText)
  };
};
////////// SCRIPT END

