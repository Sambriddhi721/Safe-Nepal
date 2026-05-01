/**
 * ResponderDashboard.jsx
 * Safe Nepal – Flood & Landslide Disaster Response App
 * Map: Full Nepal view (center 28.3949, 84.1240, zoom 7)
 * Uses Leaflet via <iframe srcdoc> — same approach as RealTimeMapScreen.js
 */

import { useState, useEffect, useRef } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#0b1120",
  surface: "#111827",
  card:    "#161f2e",
  border:  "#1e2d45",
  t1:      "#e8eef8",
  t2:      "#64748b",
  t3:      "#94a3b8",
  blue:    "#3b82f6",
  blueDk:  "#1d4ed8",
  green:   "#22c55e",
  amber:   "#f59e0b",
  red:     "#ef4444",
  purple:  "#a78bfa",
  teal:    "#14b8a6",
};

const SEV_COLOR  = { High: T.red,    Medium: T.amber, Low: T.green };
const STAT_COLOR = { pending: T.red, responding: T.amber, resolved: T.green };
const STAT_BG    = {
  pending:    "rgba(239,68,68,0.12)",
  responding: "rgba(245,158,11,0.12)",
  resolved:   "rgba(34,197,94,0.12)",
};

// ─── Nepal geographic center & default zoom ───────────────────────────────────
// Center of Nepal: 28.3949 N, 84.1240 E — zoom 7 shows the whole country
const NEPAL_LAT  = 28.3949;
const NEPAL_LNG  = 84.1240;
const NEPAL_ZOOM = 7;

// ─── Leaflet HTML builder ─────────────────────────────────────────────────────
const buildLeafletHTML = (centerLat, centerLng, sosMarkers = [], responder = null, zoom = NEPAL_ZOOM) => {
  const sevColor = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

  const markersJS = sosMarkers.map((item) => {
    const mlat = parseFloat(item.latitude);
    const mlng = parseFloat(item.longitude);
    if (isNaN(mlat) || isNaN(mlng)) return "";
    const color    = sevColor[item.severity] || "#ef4444";
    const emoji    = item.type === "flood" ? "💧" : "⛰";
    const title    = (item.type || "").toUpperCase() + " · " + (item.severity || "");
    const loc      = (item.location || "Unknown").replace(/\\/g, "").replace(/'/g, " ");
    const reporter = (item.reportedBy || "Anonymous").replace(/'/g, " ");
    const phone    = (item.citizenPhone || "").replace(/'/g, "");
    const liveStr  = item.liveTracking
      ? "<span style=\\'color:#22c55e;font-size:11px;font-weight:700;\\'>● LIVE GPS ACTIVE</span>"
      : "<span style=\\'color:#64748b;font-size:11px;\\'>Static location</span>";
    const pulseDiv = item.liveTracking
      ? `<div style=\\'position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:pulse 1.5s ease-in-out infinite;\\'></div>`
      : "";
    return `
(function(){
  var icon=L.divIcon({className:'',html:'<div style="position:relative;width:32px;height:32px;">${pulseDiv}<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px ${color}80;color:white;font-size:15px;position:relative;">${emoji}</div></div>',iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-20]});
  L.marker([${mlat},${mlng}],{icon:icon}).addTo(map).bindPopup('<b style="color:${color}">🚨 ${title}</b><br><span style="color:#94a3b8">📍 ${loc}</span><br><span style="color:#94a3b8">👤 ${reporter}${phone ? " · " + phone : ""}</span><br>${liveStr}');
})();`;
  }).join("\n");

  const responderJS = responder ? `
var rIcon=L.divIcon({className:'',html:'<div style="position:relative;width:34px;height:34px;"><div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.2;animation:pulse 1.5s infinite;"></div><div style="width:34px;height:34px;border-radius:50%;background:#3b82f6;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px rgba(59,130,246,0.3);color:white;font-size:15px;position:relative;">👮</div></div>',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-20]});
var respMarker=L.marker([${responder.latitude},${responder.longitude}],{icon:rIcon}).addTo(map).bindPopup('<b style="color:#3b82f6">📍 YOUR LOCATION</b>');
` : "var respMarker=null;";

  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body,#map{width:100%;height:100%;background:#0b1120;}
.leaflet-tile{filter:brightness(0.55) invert(1) contrast(3) hue-rotate(200deg) saturate(0.25) brightness(0.65);}
.leaflet-container{background:#0b1120 !important;}
.leaflet-popup-content-wrapper{background:#161f2e;border:1px solid #1e2d45;color:#e8eef8;border-radius:10px;box-shadow:none;}
.leaflet-popup-tip{background:#161f2e;}
.leaflet-popup-content{margin:10px 14px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.6;}
.leaflet-control-zoom a{background:#161f2e !important;color:#e8eef8 !important;border-color:#1e2d45 !important;}
.leaflet-bar{border:1px solid #1e2d45 !important;}
@keyframes pulse{0%,100%{transform:scale(1);opacity:0.25}50%{transform:scale(2.2);opacity:0}}
</style>
</head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:true}).setView([${centerLat},${centerLng}],${zoom});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://openstreetmap.org">OSM</a>'}).addTo(map);
${markersJS}
${responderJS}
window.addEventListener('message',function(e){
  try{
    var d=JSON.parse(e.data);
    if(d.type==='UPDATE_RESPONDER'&&respMarker)respMarker.setLatLng([d.lat,d.lng]);
    if(d.type==='RECENTER')map.setView([d.lat,d.lng],15,{animate:true});
    if(d.type==='FLY_TO')map.flyTo([d.lat,d.lng],d.zoom||15,{animate:true,duration:1.2});
    if(d.type==='NEPAL_VIEW')map.setView([${NEPAL_LAT},${NEPAL_LNG}],${NEPAL_ZOOM},{animate:true});
  }catch(err){}
});
<\/script></body></html>`;
};

// ─── Incident-detail map (single marker, street zoom 16) ─────────────────────
const buildIncidentMapHTML = (lat, lng, item) => {
  const color = SEV_COLOR[item.severity] || T.red;
  const emoji = item.type === "flood" ? "💧" : "⛰";
  const pulseDiv = item.liveTracking
    ? `<div style=\\'position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:pulse 1.5s infinite;\\'></div>`
    : "";
  const loc = (item.location || "").replace(/'/g, " ");
  const liveStr = item.liveTracking
    ? "<span style=\\'color:#22c55e;font-weight:700;\\'>● LIVE GPS</span>"
    : "";
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body,#map{width:100%;height:100%;background:#0b1120;}
.leaflet-tile{filter:brightness(0.55) invert(1) contrast(3) hue-rotate(200deg) saturate(0.25) brightness(0.65);}
.leaflet-container{background:#0b1120 !important;}
.leaflet-popup-content-wrapper{background:#161f2e;border:1px solid #1e2d45;color:#e8eef8;border-radius:10px;box-shadow:none;}
.leaflet-popup-tip{background:#161f2e;}
.leaflet-popup-content{margin:10px 14px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.6;}
.leaflet-control-zoom a{background:#161f2e !important;color:#e8eef8 !important;border-color:#1e2d45 !important;}
.leaflet-bar{border:1px solid #1e2d45 !important;}
@keyframes pulse{0%,100%{transform:scale(1);opacity:0.25}50%{transform:scale(2.5);opacity:0}}
</style>
</head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:true}).setView([${lat},${lng}],16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OSM'}).addTo(map);
var icon=L.divIcon({className:'',html:'<div style="position:relative;width:36px;height:36px;">${pulseDiv}<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px ${color}80;color:white;font-size:18px;position:relative;">${emoji}</div></div>',iconSize:[36,36],iconAnchor:[18,18],popupAnchor:[0,-22]});
L.marker([${lat},${lng}],{icon:icon}).addTo(map).bindPopup('<b style="color:${color}">🚨 ${(item.type||"").toUpperCase()} · ${item.severity}</b><br><span style="color:#94a3b8">📍 ${loc}</span><br>${liveStr}').openPopup();
window.addEventListener('message',function(e){try{var d=JSON.parse(e.data);if(d.type==='RECENTER')map.setView([d.lat,d.lng],d.zoom||16,{animate:true});}catch(err){}});
<\/script></body></html>`;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_REPORTS = [
  {
    id:"r001abc123",type:"flood",severity:"High",status:"pending",
    location:"Baneshwor, Kathmandu",latitude:27.6939,longitude:85.3480,
    accuracy:12,liveTracking:true,
    description:"Major flooding near Bagmati river crossing. Water level rising rapidly. Several families stranded on rooftops.",
    waterLevel:"1.8m above normal",affectedPeople:45,
    reportedBy:"Ram Shrestha",citizenPhone:"+977-9841234567",
    createdAt:new Date(Date.now()-12*60000),updatedAt:new Date(Date.now()-5*60000),
    imageUrl:null,lastLocationUpdate:new Date(Date.now()-2*60000),responderName:null,
  },
  {
    id:"r002def456",type:"landslide",severity:"High",status:"responding",
    location:"Sindhupalchok District",latitude:27.9564,longitude:85.6880,
    accuracy:25,liveTracking:false,
    description:"Large landslide blocking B.P. Highway km 72. Multiple vehicles trapped. Estimated 3 meters of debris.",
    roadBlocked:true,affectedPeople:20,
    reportedBy:"Sita Tamang",citizenPhone:"+977-9851234567",
    createdAt:new Date(Date.now()-45*60000),updatedAt:new Date(Date.now()-20*60000),
    imageUrl:null,responderName:"Unit KTM-01",
  },
  {
    id:"r003ghi789",type:"flood",severity:"Medium",status:"responding",
    location:"Teku, Kathmandu",latitude:27.6848,longitude:85.3002,
    accuracy:8,liveTracking:true,
    description:"Flooding in Teku area. River water entering residential zones. Roads submerged by 30cm.",
    waterLevel:"0.9m above normal",affectedPeople:30,
    reportedBy:"Bikash Karki",citizenPhone:"+977-9861234567",
    createdAt:new Date(Date.now()-90*60000),updatedAt:new Date(Date.now()-30*60000),
    imageUrl:null,lastLocationUpdate:new Date(Date.now()-8*60000),responderName:"Unit KTM-02",
  },
  {
    id:"r004jkl012",type:"landslide",severity:"Low",status:"resolved",
    location:"Patan, Lalitpur",latitude:27.6588,longitude:85.3247,
    accuracy:15,liveTracking:false,
    description:"Minor landslide on local road. Debris cleared by morning crew. Road now passable.",
    roadBlocked:false,affectedPeople:0,
    reportedBy:"Maya Maharjan",citizenPhone:"+977-9871234567",
    createdAt:new Date(Date.now()-3*3600000),updatedAt:new Date(Date.now()-2*3600000),
    imageUrl:null,responderName:"Unit KTM-03",
  },
  {
    id:"r005mno345",type:"flood",severity:"High",status:"pending",
    location:"Pokhara, Gandaki",latitude:28.2096,longitude:83.9856,
    accuracy:18,liveTracking:true,
    description:"Severe flooding in Pokhara lakeside area. Fewa Lake water level critically high.",
    waterLevel:"2.1m above normal",affectedPeople:80,
    reportedBy:"Hari Gurung",citizenPhone:"+977-9862345678",
    createdAt:new Date(Date.now()-20*60000),updatedAt:new Date(Date.now()-8*60000),
    imageUrl:null,lastLocationUpdate:new Date(Date.now()-3*60000),responderName:null,
  },
  {
    id:"r006pqr678",type:"landslide",severity:"High",status:"pending",
    location:"Dharan, Sunsari",latitude:26.8110,longitude:87.2840,
    accuracy:20,liveTracking:false,
    description:"Landslide on Dharan–Dhankuta highway. Road completely blocked.",
    roadBlocked:true,affectedPeople:15,
    reportedBy:"Sunita Rai",citizenPhone:"+977-9812345678",
    createdAt:new Date(Date.now()-35*60000),updatedAt:new Date(Date.now()-15*60000),
    imageUrl:null,responderName:null,
  },
  {
    id:"r007stu901",type:"flood",severity:"Medium",status:"responding",
    location:"Nepalgunj, Banke",latitude:28.0500,longitude:81.6167,
    accuracy:22,liveTracking:true,
    description:"Rapti river overflowing banks near Nepalgunj. Low-lying areas submerged.",
    waterLevel:"1.2m above normal",affectedPeople:60,
    reportedBy:"Ram Bahadur Tharu",citizenPhone:"+977-9854321098",
    createdAt:new Date(Date.now()-55*60000),updatedAt:new Date(Date.now()-25*60000),
    imageUrl:null,lastLocationUpdate:new Date(Date.now()-5*60000),responderName:"Unit NPJ-01",
  },
  {
    id:"r008vwx234",type:"landslide",severity:"Medium",status:"resolved",
    location:"Taplejung, Koshi",latitude:27.3530,longitude:87.6670,
    accuracy:30,liveTracking:false,
    description:"Debris flow cleared from mountain road. Area declared safe.",
    roadBlocked:false,affectedPeople:0,
    reportedBy:"Pemba Sherpa",citizenPhone:"+977-9823456789",
    createdAt:new Date(Date.now()-5*3600000),updatedAt:new Date(Date.now()-3*3600000),
    imageUrl:null,responderName:"Unit KOS-02",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const greeting = () => { const h=new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };
const timeAgo = (d) => { if(!d)return"—"; const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return`${s}s ago`; if(s<3600)return`${Math.floor(s/60)}m ago`; if(s<86400)return`${Math.floor(s/3600)}h ago`; return new Date(d).toLocaleDateString(); };
const fmt = (d) => d?new Date(d).toLocaleString("en-NP",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"Unknown";

const generateReportText = (item) => {
  const line="─".repeat(50);
  return `SAFE NEPAL – DISASTER INCIDENT REPORT\n${line}\nReference ID   : #${(item.id||"").slice(0,8).toUpperCase()}\nGenerated At   : ${new Date().toLocaleString()}\n${line}\n\nINCIDENT DETAILS\nType           : ${item.type==="flood"?"Flood":"Landslide"}\nSeverity       : ${item.severity||"Unknown"}\nStatus         : ${(item.status||"pending").toUpperCase()}\nReported At    : ${fmt(item.createdAt)}\nDescription    : ${item.description||"No description"}\n${item.waterLevel?`Water Level    : ${item.waterLevel}\n`:""}${item.roadBlocked!=null?`Road Blocked   : ${item.roadBlocked?"Yes":"No"}\n`:""}Affected People: ${item.affectedPeople>0?`~${item.affectedPeople}`:"Unknown"}\n\nLOCATION\nAddress        : ${item.location||"Unknown"}\nLatitude       : ${item.latitude?Number(item.latitude).toFixed(6):"N/A"}\nLongitude      : ${item.longitude?Number(item.longitude).toFixed(6):"N/A"}\nGPS Accuracy   : ${item.accuracy?`±${Math.round(item.accuracy)}m`:"N/A"}\nLive Tracking  : ${item.liveTracking?"Active":"Inactive"}\nGoogle Maps    : https://maps.google.com/?q=${item.latitude},${item.longitude}\n\nCITIZEN REPORTER\nName           : ${item.reportedBy||"Anonymous"}\nPhone          : ${item.citizenPhone||"Not provided"}\n\nRESPONSE\nResponder      : ${item.responderName||"Not assigned"}\nLast Updated   : ${fmt(item.updatedAt)}\n\n${line}\nSafe Nepal Emergency Response System\nNational Disaster Management Authority, Nepal\nEmergency: 112 | Police: 100 | Fire: 101 | Ambulance: 102`.trim();
};
const downloadReport = (item) => { const b=new Blob([generateReportText(item)],{type:"text/plain"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`SafeNepal_${(item.id||"").slice(0,8).toUpperCase()}.txt`; a.click(); URL.revokeObjectURL(u); };
const downloadAll = (reports) => { const t=reports.map((r,i)=>`\n${"═".repeat(50)}\nREPORT ${i+1}\n${"═".repeat(50)}\n${generateReportText(r)}`).join("\n\n"); const b=new Blob([`SAFE NEPAL – ALL REPORTS\nGenerated: ${new Date().toLocaleString()}\n\n${t}`],{type:"text/plain"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`SafeNepal_AllReports_${Date.now()}.txt`; a.click(); URL.revokeObjectURL(u); };

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = {
  shield:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"/></svg>,
  warning:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>,
  location: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  mega:     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.66 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/></svg>,
  people:   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  doc:      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>,
  dl:       <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  map:      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>,
  cog:      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  call:     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  nav:      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>,
  share:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>,
  close:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  chev:     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>,
  water:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>,
  mount:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z"/></svg>,
  fire:     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>,
  med:      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h2V7c0-.55.45-1 1-1z"/></svg>,
  bell:     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  logout:   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  radio:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 10h-1V9c0-3.87-3.13-7-7-7S5 5.13 5 9v1H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-9 7c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2zm4 0c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2zm2-7H7V9c0-2.76 2.24-5 5-5s5 2.24 5 5v1z"/></svg>,
  car:      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
  add:      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  globe:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
  check:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  person:   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  disp:     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
};

// ─── Components ───────────────────────────────────────────────────────────────
function PulseDot({ color = T.green, size = 8 }) {
  return (
    <span style={{ position:"relative",display:"inline-flex",width:size,height:size,flexShrink:0 }}>
      <span style={{ position:"absolute",inset:0,borderRadius:"50%",background:color,opacity:0.4,animation:"ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
      <span style={{ position:"relative",width:size,height:size,borderRadius:"50%",background:color }} />
    </span>
  );
}
function LiveBadge() {
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4 }}><PulseDot color={T.green} size={7}/><span style={{ color:T.green,fontSize:9,fontWeight:900,letterSpacing:1 }}>LIVE GPS</span></span>;
}

// ─── LeafletFrame — renders Leaflet map in an iframe ─────────────────────────
function LeafletFrame({ html, height=280, mapRef }) {
  const iframeRef = useRef(null);
  useEffect(() => {
    if (mapRef) mapRef.current = { send:(msg)=>iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg),"*") };
  }, [mapRef]);
  return (
    <iframe ref={iframeRef} srcDoc={html}
      style={{ width:"100%",height,border:"none",display:"block" }}
      title="Safe Nepal Live Map"
      sandbox="allow-scripts allow-same-origin" />
  );
}

function BottomSheet({ visible, onClose, title, subtitle, icon, iconColor, children }) {
  useEffect(() => { document.body.style.overflow=visible?"hidden":""; return()=>{document.body.style.overflow="";}; }, [visible]);
  if (!visible) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end" }}>
      <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)" }} onClick={onClose} />
      <div style={{ position:"relative",background:T.surface,borderRadius:"22px 22px 0 0",maxHeight:"92vh",display:"flex",flexDirection:"column",border:`1px solid ${T.border}`,borderBottom:"none",animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ display:"flex",justifyContent:"center",padding:"12px 0 6px" }}>
          <div style={{ width:36,height:4,borderRadius:2,background:T.border }} />
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"8px 16px 14px",borderBottom:`1px solid ${T.border}` }}>
          <div style={{ width:44,height:44,borderRadius:13,background:(iconColor||T.blue)+"22",display:"flex",alignItems:"center",justifyContent:"center",color:iconColor||T.blue,flexShrink:0 }}>{icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:T.t1,fontSize:16,fontWeight:800 }}>{title}</div>
            {subtitle&&<div style={{ color:T.t2,fontSize:11,marginTop:2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.card,color:T.t1,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>{I.close}</button>
        </div>
        <div style={{ overflowY:"auto",padding:"16px",flex:1,WebkitOverflowScrolling:"touch" }}>
          {children}<div style={{ height:40 }} />
        </div>
      </div>
    </div>
  );
}

function ReportRow({ item, onPress }) {
  const isFlood=item.type==="flood"; const sCol=STAT_COLOR[item.status]||T.red; const tCol=isFlood?T.blue:T.amber;
  return (
    <div onClick={()=>onPress(item)} style={{ display:"flex",alignItems:"center",gap:10,background:T.card,borderRadius:13,border:`1px solid ${T.border}`,padding:"11px 12px",marginBottom:8,cursor:"pointer" }}>
      <div style={{ width:8,height:8,borderRadius:"50%",background:sCol,flexShrink:0 }} />
      <div style={{ width:34,height:34,borderRadius:9,background:tCol+"20",display:"flex",alignItems:"center",justifyContent:"center",color:tCol,flexShrink:0 }}>{isFlood?I.water:I.mount}</div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap" }}>
          <span style={{ color:T.t1,fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{isFlood?"Flood":"Landslide"} · {item.location}</span>
          {item.liveTracking&&<LiveBadge/>}
        </div>
        <div style={{ color:T.t2,fontSize:10 }}>{item.affectedPeople>0?`${item.affectedPeople} affected · `:""}{item.status.toUpperCase()} · {item.severity}</div>
      </div>
      <span style={{ color:T.t2,fontSize:10,flexShrink:0 }}>{timeAgo(item.createdAt)}</span>
    </div>
  );
}

function InfoRow({ icon, label, value, color, onClick, last }) {
  return (
    <div onClick={onClick} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:last?"none":`1px solid ${T.border}`,cursor:onClick?"pointer":"default" }}>
      <div style={{ width:36,height:36,borderRadius:10,background:(color||T.blue)+"18",display:"flex",alignItems:"center",justifyContent:"center",color:color||T.blue,flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ color:T.t1,fontSize:13,fontWeight:700 }}>{label}</div>
        {value&&<div style={{ color:T.t2,fontSize:10,marginTop:2 }}>{value}</div>}
      </div>
      {onClick&&<span style={{ color:T.t2 }}>{I.chev}</span>}
    </div>
  );
}

function ToolBtn({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ background:T.card,borderRadius:15,border:`1px solid ${T.border}`,padding:"13px 6px 11px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer" }}>
      <div style={{ width:42,height:42,borderRadius:"50%",background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",color }}>{icon}</div>
      <span style={{ color:T.t1,fontSize:10,fontWeight:700 }}>{label}</span>
    </button>
  );
}

function StatPill({ value, label, color, onClick }) {
  return (
    <div onClick={onClick} style={{ flex:1,background:T.card,borderRadius:13,border:`1px solid ${color}40`,padding:"10px 6px",textAlign:"center",cursor:"pointer" }}>
      <div style={{ color,fontSize:22,fontWeight:900,lineHeight:1 }}>{String(value).padStart(2,"0")}</div>
      <div style={{ color:T.t3,fontSize:9,fontWeight:600,marginTop:3 }}>{label}</div>
    </div>
  );
}

function ActionBtn({ icon, label, sub, color, onClick, href }) {
  const inner=(<><div style={{ width:36,height:36,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",color,flexShrink:0 }}>{icon}</div><div style={{ flex:1 }}><div style={{ color,fontSize:13,fontWeight:700 }}>{label}</div>{sub&&<div style={{ color:T.t2,fontSize:10,marginTop:2 }}>{sub}</div>}</div><span style={{ color }}>{I.chev}</span></>);
  const s={ display:"flex",alignItems:"center",gap:11,background:T.card,borderRadius:13,border:`1px solid ${color}40`,padding:13,marginBottom:9,cursor:"pointer",textDecoration:"none" };
  if(href) return <a href={href} target={href.startsWith("http")?"_blank":undefined} rel="noreferrer" style={s}>{inner}</a>;
  return <div onClick={onClick} style={s}>{inner}</div>;
}

// ─── Incident Modal ───────────────────────────────────────────────────────────
function IncidentModal({ item, onClose, onUpdate }) {
  const [status,setStatus]=useState(item?.status||"pending");
  const [updating,setUpdating]=useState(false);
  const mapRef=useRef(null);
  useEffect(()=>{if(item)setStatus(item.status);},[item?.status]);
  if(!item) return null;
  const isFlood=item.type==="flood";
  const tCol=isFlood?T.blue:T.amber; const sCol=STAT_COLOR[status]||T.red; const sevCol=SEV_COLOR[item.severity]||T.blue;
  const mapsUrl=`https://www.google.com/maps?q=${item.latitude},${item.longitude}&z=15`;
  const navUrl=`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
  const wazeUrl=`https://waze.com/ul?ll=${item.latitude},${item.longitude}&navigate=yes`;
  const handleShare=()=>{ const m=`🚨 DISASTER REPORT\nType: ${item.type?.toUpperCase()}\nSeverity: ${item.severity}\nLocation: ${item.location}\nMaps: ${mapsUrl}`; if(navigator.share)navigator.share({title:"Safe Nepal",text:m,url:mapsUrl}).catch(()=>{}); else window.open(mapsUrl,"_blank"); };
  const handleStatus=async(st)=>{ setUpdating(true); await new Promise(r=>setTimeout(r,500)); setStatus(st); onUpdate(item.id,st); setUpdating(false); };
  const incMapHTML=item.latitude&&item.longitude?buildIncidentMapHTML(item.latitude,item.longitude,item):null;

  return (
    <BottomSheet visible={true} onClose={onClose} title={`${isFlood?"Flood":"Landslide"} Emergency`} subtitle={`#${item.id.slice(0,8).toUpperCase()}`} icon={isFlood?I.water:I.mount} iconColor={tCol}>
      <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginBottom:16 }}>
        <span style={{ background:sevCol+"18",color:sevCol,border:`1px solid ${sevCol}40`,borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:800 }}>{item.severity} Severity</span>
        <span style={{ background:STAT_BG[status],color:sCol,border:`1px solid ${sCol}40`,borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",gap:4 }}><span style={{ width:5,height:5,borderRadius:"50%",background:sCol,display:"inline-block" }}/>{status.toUpperCase()}</span>
        {item.liveTracking&&<span style={{ background:T.green+"15",border:`1px solid ${T.green}40`,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:4 }}><LiveBadge/></span>}
        <span style={{ color:T.t2,fontSize:10,marginLeft:"auto",alignSelf:"center" }}>{timeAgo(item.createdAt)}</span>
      </div>

      {/* Real Leaflet map for this incident — street level zoom 16 */}
      {incMapHTML&&(
        <>
          <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:8 }}>CITIZEN LOCATION</div>
          <div style={{ background:T.card,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden",marginBottom:14 }}>
            <LeafletFrame html={incMapHTML} height={200} mapRef={mapRef}/>
            <div style={{ display:"flex",alignItems:"flex-start",padding:"12px 13px",gap:10,borderTop:`1px solid ${T.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ color:T.t1,fontSize:12,fontWeight:700 }}>{item.location}</div>
                <div style={{ color:T.t2,fontSize:10,marginTop:3 }}>{Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}</div>
                {item.accuracy&&<div style={{ color:T.t2,fontSize:10,marginTop:2 }}>GPS accuracy: ±{Math.round(item.accuracy)}m</div>}
                {item.liveTracking&&<div style={{ color:T.green,fontSize:10,marginTop:2 }}>● Live GPS active</div>}
              </div>
              <div style={{ width:40,height:40,borderRadius:11,background:(item.liveTracking?T.green:T.blue)+"20",display:"flex",alignItems:"center",justifyContent:"center",color:item.liveTracking?T.green:T.blue }}>{item.liveTracking?I.radio:I.location}</div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",borderTop:`1px solid ${T.border}` }}>
              {[{label:"Navigate",color:T.blue,icon:I.nav,href:navUrl},{label:"View Map",color:T.green,icon:I.map,href:mapsUrl},{label:"Waze",color:T.purple,icon:I.car,href:wazeUrl},{label:"Share",color:T.amber,icon:I.share,action:handleShare}].map((b,i)=>(
                <a key={b.label} href={b.href||"#"} target={b.href?"_blank":undefined} rel="noreferrer" onClick={b.action?(e)=>{e.preventDefault();b.action();}:undefined}
                  style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"9px 4px",background:b.color+"10",borderRight:i<3?`1px solid ${T.border}`:"none",textDecoration:"none",cursor:"pointer" }}>
                  <span style={{ color:b.color }}>{b.icon}</span>
                  <span style={{ color:b.color,fontSize:9,fontWeight:800 }}>{b.label}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:8 }}>INCIDENT DETAILS</div>
      <div style={{ background:T.card,borderRadius:13,border:`1px solid ${T.border}`,padding:"4px 14px",marginBottom:14 }}>
        {[{label:"Description",value:item.description||"No description."},isFlood&&item.waterLevel?{label:"Water Level",value:item.waterLevel}:null,item.roadBlocked!==undefined?{label:"Road Blocked",value:item.roadBlocked?"Yes – impassable":"No – passable",color:item.roadBlocked?T.red:T.green}:null,{label:"Affected People",value:item.affectedPeople>0?`~${item.affectedPeople} people`:"Unknown"},item.accuracy?{label:"GPS Accuracy",value:`±${Math.round(item.accuracy)}m`}:null].filter(Boolean).map((r,i,arr)=>(
          <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",gap:10 }}>
            <span style={{ color:T.t2,fontSize:11 }}>{r.label}</span>
            <span style={{ color:r.color||T.t1,fontSize:11,fontWeight:600,textAlign:"right",flex:1,maxWidth:"65%" }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:8 }}>CITIZEN REPORTER</div>
      <div style={{ background:T.card,borderRadius:13,border:`1px solid ${T.border}`,padding:"4px 14px",marginBottom:14 }}>
        <div style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.border}` }}><span style={{ color:T.t2,fontSize:11 }}>Name</span><span style={{ color:T.t1,fontSize:11,fontWeight:600 }}>{item.reportedBy||"Anonymous"}</span></div>
        <div style={{ display:"flex",justifyContent:"space-between",padding:"10px 0" }}><span style={{ color:T.t2,fontSize:11 }}>Phone</span><a href={`tel:${item.citizenPhone}`} style={{ color:T.blue,fontSize:11,fontWeight:700,textDecoration:"none" }}>{item.citizenPhone||"Not provided"}</a></div>
      </div>

      <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:8 }}>RESPONDER ACTIONS</div>
      <ActionBtn icon={I.call}  label="Call Citizen"       sub={item.citizenPhone}                 color={T.green} href={`tel:${item.citizenPhone}`}/>
      <ActionBtn icon={I.nav}   label="Navigate to Scene"  sub="Opens turn-by-turn directions"     color={T.blue}  href={navUrl}/>
      <ActionBtn icon={I.dl}    label="Download Report"    sub="Export incident as .txt"            color={T.teal}  onClick={()=>downloadReport({...item,status})}/>
      <ActionBtn icon={I.share} label="Share Incident"     sub="Send location to other units"       color={T.amber} onClick={handleShare}/>

      <div style={{ background:T.card,borderRadius:13,border:`1px solid ${T.border}`,padding:14,marginTop:4 }}>
        <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:1.2,marginBottom:11 }}>UPDATE INCIDENT STATUS</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
          {["pending","responding","resolved"].map(st=>{
            const col=STAT_COLOR[st]; const active=status===st;
            return <button key={st} disabled={updating||active} onClick={()=>handleStatus(st)} style={{ padding:"10px 4px",borderRadius:10,border:`1.5px solid ${col}`,background:active?col+"28":"transparent",color:col,fontSize:10,fontWeight:800,cursor:active?"default":"pointer" }}>{updating&&active?"…":st.charAt(0).toUpperCase()+st.slice(1)}</button>;
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function ResponderDashboard() {
  const user={name:"Aakash Shrestha",role:"Field Agent",district:"Kathmandu",badgeNo:"KTM-007"};

  const [reports,setReports]=useState(MOCK_REPORTS);
  const [selected,setSelected]=useState(null);
  const [incidentOpen,setIncidentOpen]=useState(false);
  const [activeModal,setActiveModal]=useState(null);
  const [newAlert,setNewAlert]=useState(null);
  const liveMapRef=useRef(null);

  const pending=reports.filter(r=>r.status==="pending");
  const responding=reports.filter(r=>r.status==="responding");
  const resolved=reports.filter(r=>r.status==="resolved");
  const live=reports.filter(r=>r.liveTracking);
  const activeCount=pending.length+responding.length;

  useEffect(()=>{
    const t=setTimeout(()=>{setNewAlert({type:"flood",location:"Bhaktapur, Ward 7"});setTimeout(()=>setNewAlert(null),5000);},10000);
    return()=>clearTimeout(t);
  },[]);

  const updateStatus=(id,st)=>{
    setReports(prev=>prev.map(r=>r.id===id?{...r,status:st,responderName:user.name,updatedAt:new Date()}:r));
    setSelected(prev=>prev?.id===id?{...prev,status:st}:prev);
  };
  const openIncident=(item)=>{setSelected(item);setIncidentOpen(true);};
  const close=()=>setActiveModal(null);

  // Full Nepal Leaflet map — center 28.39°N 84.12°E, zoom 7
  const nepalMapHTML = buildLeafletHTML(
    NEPAL_LAT, NEPAL_LNG,
    reports,
    { latitude:27.7000, longitude:85.3300 },
    NEPAL_ZOOM
  );

  const tools=[
    {icon:I.warning,label:"SOS Feed", color:T.red,   action:()=>setActiveModal("sos")},
    {icon:I.location,label:"Patrol",  color:T.blue,  action:()=>setActiveModal("patrol")},
    {icon:I.mega,label:"Broadcast",   color:T.amber, action:()=>setActiveModal("broadcast")},
    {icon:I.shield,label:"Units",     color:T.purple,action:()=>setActiveModal("units")},
    {icon:I.doc,label:"Reports",      color:T.blue,  action:()=>setActiveModal("reports")},
    {icon:I.dl,label:"Export All",    color:T.teal,  action:()=>downloadAll(reports)},
    {icon:I.map,label:"Live Map",     color:T.green, action:()=>setActiveModal("map")},
    {icon:I.people,label:"Volunteers",color:T.teal,  action:()=>setActiveModal("volunteers")},
    {icon:I.cog,label:"Settings",     color:T.t3,    action:()=>setActiveModal("settings")},
  ];

  return (
    <div style={{ background:T.bg,minHeight:"100vh",fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:T.t1,maxWidth:430,margin:"0 auto",position:"relative",boxShadow:"0 0 80px rgba(0,0,0,0.8)" }}>
      <style>{`
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        @keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0;}
        button{font-family:inherit;}
        a{color:inherit;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px;}
      `}</style>

      {newAlert&&(
        <div style={{ position:"sticky",top:0,zIndex:300,background:"#7f1d1d",padding:"10px 16px",display:"flex",alignItems:"center",gap:8,animation:"slideDown 0.3s ease",borderBottom:`1px solid ${T.red}` }}>
          <span style={{ color:T.red }}>{I.warning}</span>
          <span style={{ flex:1,color:"#fca5a5",fontSize:11,fontWeight:800,letterSpacing:0.5 }}>NEW REPORT · {newAlert.type.toUpperCase()} · {newAlert.location}</span>
          <button onClick={()=>setNewAlert(null)} style={{ background:"none",border:"none",color:"#fca5a5",cursor:"pointer" }}>{I.close}</button>
        </div>
      )}

      {/* Header */}
      <div style={{ background:T.surface,padding:"20px 16px 18px",borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:9 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:T.blueDk,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff" }}>{I.shield}</div>
            <span style={{ color:"#fff",fontSize:17,fontWeight:800 }}>Safe Nepal</span>
          </div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <div onClick={()=>setActiveModal("alerts")} style={{ width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",color:T.t1 }}>
              {I.bell}
              {pending.length>0&&<div style={{ position:"absolute",top:4,right:4,minWidth:14,height:14,borderRadius:"50%",background:T.red,border:`2px solid ${T.surface}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"#fff",padding:"0 2px" }}>{pending.length>9?"9+":pending.length}</div>}
            </div>
            <div onClick={()=>setActiveModal("settings")} style={{ width:32,height:32,borderRadius:"50%",background:T.blueDk,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,fontWeight:800,color:"#fff" }}>{user.name.charAt(0)}</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}><PulseDot color={T.green} size={7}/><span style={{ color:T.green,fontSize:9,fontWeight:900,letterSpacing:2 }}>ON DUTY · ONLINE</span></div>
        <div style={{ color:"rgba(255,255,255,0.38)",fontSize:12 }}>{greeting()},</div>
        <div style={{ color:"#fff",fontSize:22,fontWeight:800,marginTop:2 }}>{user.name}</div>
        <div style={{ color:"#93c5fd",fontSize:11,marginTop:3 }}>{user.role.toUpperCase()} · {user.district} · {user.badgeNo}</div>
      </div>

      {/* Content */}
      <div style={{ overflowY:"auto",paddingBottom:40 }}>
        {live.length>0&&(
          <div onClick={()=>setActiveModal("map")} style={{ margin:"12px 12px 0",background:T.green+"12",border:`1px solid ${T.green}30`,borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer" }}>
            <div style={{ display:"flex",alignItems:"center",gap:7 }}><PulseDot color={T.green} size={7}/><span style={{ color:T.green,fontSize:11,fontWeight:700 }}>{live.length} citizen{live.length>1?"s":""} sharing live location</span></div>
            <span style={{ color:T.green,fontSize:11,fontWeight:900 }}>View →</span>
          </div>
        )}

        <div style={{ display:"flex",gap:7,padding:"12px 12px 0" }}>
          <StatPill value={activeCount}     label="Active"   color={T.red}   onClick={()=>setActiveModal("reports")}/>
          <StatPill value={pending.length}  label="Pending"  color={T.amber} onClick={()=>setActiveModal("sos")}/>
          <StatPill value={resolved.length} label="Resolved" color={T.green} onClick={()=>setActiveModal("reports")}/>
          <StatPill value={live.length}     label="Live GPS" color={T.teal}  onClick={()=>setActiveModal("map")}/>
        </div>

        <div style={{ margin:"12px 12px 0",background:T.card,borderRadius:16,border:`1px solid ${T.border}`,padding:"13px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ color:T.t1,fontSize:12,fontWeight:700,marginBottom:2 }}>{user.district}</div>
            <div style={{ color:T.t2,fontSize:9,fontWeight:700,letterSpacing:1,marginBottom:8 }}>SCATTERED CLOUDS</div>
            <div style={{ display:"flex",gap:14 }}>
              {[["72%","Humidity"],["12km/h","Wind"],["Low","UV Index"]].map(([v,k])=>(
                <div key={k} style={{ textAlign:"center" }}><div style={{ color:T.t3,fontSize:11,fontWeight:700 }}>{v}</div><div style={{ color:T.t2,fontSize:8 }}>{k}</div></div>
              ))}
            </div>
          </div>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:26 }}>⛅</div><div style={{ color:"#fff",fontSize:28,fontWeight:800,letterSpacing:-1 }}>34°C</div></div>
        </div>

        <div style={{ margin:"10px 12px 0",background:T.card,borderRadius:14,border:`1px solid ${T.border}`,padding:"12px 13px" }}>
          <div style={{ color:T.t2,fontSize:9,fontWeight:700,letterSpacing:1.5,marginBottom:8 }}>CURRENT NATIONAL RISK LEVEL</div>
          <div style={{ border:`2px solid ${T.green}`,borderRadius:10,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div><div style={{ color:T.green,fontSize:20,fontWeight:900,letterSpacing:1 }}>LOW</div><div style={{ color:T.t2,fontSize:9,marginTop:1 }}>Secure · All factors safe</div></div>
            <div style={{ width:10,height:10,borderRadius:"50%",background:T.green }} />
          </div>
        </div>

        <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:2.5,padding:"20px 14px 10px" }}>RESPONDER TOOLS</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,padding:"0 12px" }}>
          {tools.map(t=><ToolBtn key={t.label} icon={t.icon} label={t.label} color={t.color} onClick={t.action}/>)}
        </div>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 14px 9px" }}>
          <span style={{ color:T.t1,fontSize:14,fontWeight:800 }}>Recent Alerts</span>
          <span onClick={()=>setActiveModal("alerts")} style={{ color:T.blue,fontSize:11,fontWeight:700,cursor:"pointer" }}>View all</span>
        </div>
        <div style={{ padding:"0 12px" }}>
          {reports.slice(0,3).map(item=><ReportRow key={item.id} item={item} onPress={openIncident}/>)}
        </div>

        <a href="tel:112" style={{ display:"flex",alignItems:"center",background:"#0c1f4a",borderRadius:14,border:"1px solid #1e3a8a",padding:"13px 14px",margin:"16px 12px 0",textDecoration:"none" }}>
          <div style={{ width:40,height:40,borderRadius:10,background:T.red,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff" }}>{I.disp}</div>
          <div style={{ flex:1,marginLeft:12 }}><div style={{ color:"#fff",fontWeight:800,fontSize:13 }}>Nepal Emergency Dispatch</div><div style={{ color:"#93c5fd",fontSize:10,marginTop:2 }}>Tap to call · Available 24/7</div></div>
          <div style={{ color:"#fff",fontSize:24,fontWeight:900,letterSpacing:-1 }}>112</div>
        </a>

        <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:2.5,padding:"18px 14px 10px" }}>QUICK DIAL</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"0 12px" }}>
          {[{num:"101",label:"Fire",icon:I.fire,color:T.red},{num:"102",label:"Ambulance",icon:I.med,color:T.green},{num:"100",label:"Authority",icon:I.shield,color:T.purple},{num:"1115",label:"Medical",icon:I.med,color:T.teal}].map(d=>(
            <a key={d.num} href={`tel:${d.num}`} style={{ borderRadius:13,border:`1px solid ${d.color}30`,background:d.color+"10",padding:"12px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,textDecoration:"none" }}>
              <span style={{ color:d.color }}>{d.icon}</span>
              <span style={{ color:d.color,fontSize:14,fontWeight:900 }}>{d.num}</span>
              <span style={{ color:T.t2,fontSize:8,fontWeight:700 }}>{d.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Modals */}
      {incidentOpen&&selected&&<IncidentModal item={selected} onClose={()=>{setIncidentOpen(false);setSelected(null);}} onUpdate={updateStatus}/>}

      <BottomSheet visible={activeModal==="alerts"} onClose={close} title="All Alerts" subtitle={`${reports.length} total · ${live.length} with live GPS`} icon={I.bell} iconColor={T.amber}>
        {reports.map(item=><ReportRow key={item.id} item={item} onPress={(i)=>{close();openIncident(i);}}/>)}
      </BottomSheet>

      <BottomSheet visible={activeModal==="sos"} onClose={close} title="SOS Feed" subtitle="Citizen emergency signals" icon={I.warning} iconColor={T.red}>
        {pending.length===0?<div style={{ textAlign:"center",padding:"40px 0",color:T.t2 }}>No active SOS signals ✓</div>:pending.map(item=><ReportRow key={item.id} item={item} onPress={(i)=>{close();openIncident(i);}}/>)}
      </BottomSheet>

      <BottomSheet visible={activeModal==="reports"} onClose={close} title="All Disaster Reports" subtitle={`${reports.length} total · ${pending.length} pending`} icon={I.doc} iconColor={T.blue}>
        <button onClick={()=>{close();downloadAll(reports);}} style={{ width:"100%",background:T.teal+"15",border:`1px solid ${T.teal}40`,color:T.teal,borderRadius:12,padding:12,fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>{I.dl} Export All Reports ({reports.length})</button>
        {reports.map(item=><ReportRow key={item.id} item={item} onPress={(i)=>{close();openIncident(i);}}/>)}
      </BottomSheet>

      {/* ── LIVE MAP MODAL — Full Nepal, Leaflet, real tiles ── */}
      <BottomSheet visible={activeModal==="map"} onClose={close} title="Live Disaster Map" subtitle="All of Nepal · Real-time incidents" icon={I.map} iconColor={T.green}>
        <div style={{ borderRadius:12,overflow:"hidden",border:`1px solid ${T.border}`,marginBottom:10 }}>
          {/* Nepal-wide map: center 28.39°N 84.12°E, zoom 7 */}
          <LeafletFrame html={nepalMapHTML} height={340} mapRef={liveMapRef}/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:`1px solid ${T.border}` }}>
            <button onClick={()=>liveMapRef.current?.send({type:"NEPAL_VIEW"})} style={{ padding:"10px 8px",background:T.green+"12",border:"none",borderRight:`1px solid ${T.border}`,color:T.green,fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>{I.globe} Nepal Overview</button>
            <button onClick={()=>liveMapRef.current?.send({type:"RECENTER",lat:27.7000,lng:85.3300})} style={{ padding:"10px 8px",background:T.blue+"12",border:"none",color:T.blue,fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>{I.nav} My Location</button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:"flex",gap:12,padding:"8px 4px 12px",flexWrap:"wrap" }}>
          {[["#ef4444","High Severity"],["#f59e0b","Medium Severity"],["#22c55e","Low / Resolved"],["#3b82f6","Your Location"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex",alignItems:"center",gap:5 }}><div style={{ width:10,height:10,borderRadius:"50%",background:c }}/><span style={{ color:T.t2,fontSize:10 }}>{l}</span></div>
          ))}
        </div>

        <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:1.5,marginBottom:8 }}>LIVE GPS — TAP TO FLY TO LOCATION</div>
        {live.length>0?live.map(item=>(
          <div key={item.id} onClick={()=>liveMapRef.current?.send({type:"FLY_TO",lat:item.latitude,lng:item.longitude,zoom:15})}
            style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer" }}>
            <div style={{ width:34,height:34,borderRadius:9,background:T.green+"20",display:"flex",alignItems:"center",justifyContent:"center",color:T.green }}>{I.radio}</div>
            <div style={{ flex:1 }}><div style={{ color:T.t1,fontSize:12,fontWeight:700 }}>{item.reportedBy||"Citizen"} · {item.location}</div><div style={{ color:T.green,fontSize:9,marginTop:2,fontWeight:600 }}>{item.type} · {item.severity} · LIVE GPS</div></div>
            <span style={{ color:T.t2,fontSize:10 }}>Fly to →</span>
          </div>
        )):<div style={{ textAlign:"center",padding:"16px 0",color:T.t2 }}>No live GPS tracking active</div>}

        <div style={{ color:T.t2,fontSize:9,fontWeight:800,letterSpacing:1.5,margin:"16px 0 8px" }}>ALL NEPAL INCIDENTS</div>
        {reports.map(item=>(
          <div key={item.id} onClick={()=>liveMapRef.current?.send({type:"FLY_TO",lat:item.latitude,lng:item.longitude,zoom:14})}
            style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer" }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:SEV_COLOR[item.severity]||T.red,flexShrink:0 }}/>
            <div style={{ flex:1 }}><div style={{ color:T.t1,fontSize:12,fontWeight:700 }}>{item.location}</div><div style={{ color:T.t2,fontSize:10 }}>{item.type} · {item.severity} · {item.status.toUpperCase()}</div></div>
            <span style={{ color:T.t2,fontSize:10 }}>Fly to →</span>
          </div>
        ))}
      </BottomSheet>

      <BottomSheet visible={activeModal==="patrol"} onClose={close} title="Patrol Zones" subtitle={`Your district: ${user.district}`} icon={I.location} iconColor={T.blue}>
        <InfoRow icon={I.location} label="Zone A · Baneshwor"     value="High alert · 2 units active"  color={T.red}   onClick={()=>window.open("https://maps.google.com/?q=27.6939,85.3480","_blank")}/>
        <InfoRow icon={I.location} label="Zone B · Teku"          value="Monitoring · 1 unit active"   color={T.amber} onClick={()=>window.open("https://maps.google.com/?q=27.6848,85.3002","_blank")}/>
        <InfoRow icon={I.location} label="Zone C · New Baneshwor" value="Clear · Patrol pending"       color={T.green} onClick={()=>window.open("https://maps.google.com/?q=27.69,85.34","_blank")}/>
        <InfoRow icon={I.map}      label="Open Live Map"          value="View real-time positions"     color={T.blue}  onClick={()=>{close();setActiveModal("map");}} last/>
      </BottomSheet>

      <BottomSheet visible={activeModal==="broadcast"} onClose={close} title="Broadcast" subtitle="Send alerts to citizens or units" icon={I.mega} iconColor={T.amber}>
        <InfoRow icon={I.warning} label="Evacuation Alert" value="Warn citizens to evacuate"    color={T.red}    onClick={()=>alert("Evacuation Alert broadcast sent!")}/>
        <InfoRow icon={I.radio}   label="Unit Dispatch"    value="Send message to field units"  color={T.blue}   onClick={()=>alert("Unit Dispatch message sent!")}/>
        <InfoRow icon={I.doc}     label="Status Update"    value="Broadcast current situation"  color={T.purple} onClick={()=>alert("Status Update broadcast sent!")}/>
        <InfoRow icon={I.check}   label="All Clear Signal" value="Notify area is safe"          color={T.green}  onClick={()=>alert("All Clear signal broadcast sent!")} last/>
      </BottomSheet>

      <BottomSheet visible={activeModal==="units"} onClose={close} title="Active Units" subtitle="Field teams deployed" icon={I.shield} iconColor={T.purple}>
        <InfoRow icon={I.car}  label="Unit KTM-01 · Baneshwor"   value="Responding · Flood incident" color={T.purple} onClick={()=>window.open("https://maps.google.com/?q=27.6939,85.3480","_blank")}/>
        <InfoRow icon={I.car}  label="Unit KTM-02 · Teku"        value="En route · SOS call"         color={T.purple} onClick={()=>window.open("https://maps.google.com/?q=27.6848,85.3002","_blank")}/>
        <InfoRow icon={I.fire} label="Fire Unit F-03 · Patan"    value="Standby · Available"         color={T.red}/>
        <InfoRow icon={I.med}  label="Ambulance A-01 · Kirtipur" value="Standby · Available"         color={T.green} last/>
      </BottomSheet>

      <BottomSheet visible={activeModal==="volunteers"} onClose={close} title="Volunteers" subtitle="12 active · 3 zones covered" icon={I.people} iconColor={T.teal}>
        <InfoRow icon={I.people} label="Zone A · 5 volunteers"    value="Baneshwor · Flood assist"   color={T.teal}/>
        <InfoRow icon={I.people} label="Zone B · 4 volunteers"    value="Teku · Evacuation support"  color={T.teal}/>
        <InfoRow icon={I.people} label="Zone C · 3 volunteers"    value="Patan · Standby"            color={T.teal}/>
        <InfoRow icon={I.add}    label="Request More Volunteers"  value="Send call-out to list"      color={T.blue} onClick={()=>alert("Volunteer call-out sent!")} last/>
      </BottomSheet>

      <BottomSheet visible={activeModal==="settings"} onClose={close} title="Settings" subtitle="Account & preferences" icon={I.cog} iconColor={T.t3}>
        <InfoRow icon={I.person}   label="Agent Profile"    value={`${user.name} · ${user.badgeNo}`}     color={T.blue}/>
        <InfoRow icon={I.bell}     label="Notifications"   value="All alerts enabled"                    color={T.amber}/>
        <InfoRow icon={I.location} label="Location Sharing"value="Active · Sharing with HQ"              color={T.green}/>
        <InfoRow icon={I.globe}    label="Language"        value="English · नेपाली"                       color={T.purple}/>
        <InfoRow icon={I.dl}       label="Export All Data" value={`Download ${reports.length} reports`}  color={T.teal} onClick={()=>downloadAll(reports)}/>
        <InfoRow icon={I.logout}   label="Sign Out"        value=""                                       color={T.red} onClick={()=>alert("Signed out!")} last/>
      </BottomSheet>
    </div>
  );
}