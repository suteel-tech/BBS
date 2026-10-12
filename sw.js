// BBS service worker: เก็บหน้าแอป/ไอคอนไว้ในเครื่อง ส่วนข้อมูลยังดึงจาก Google แบบสดทุกครั้ง
var CACHE = "bbs-shell-v1";
var SHELL = ["./", "index.html", "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// network-first สำหรับไฟล์ของเราเอง (ได้เวอร์ชันล่าสุดเสมอ ถ้าออฟไลน์ใช้ที่เก็บไว้)
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return r;
  }).catch(function () { return caches.match(e.request); }));
});
