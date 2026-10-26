const CACHE = "timely-v16";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first so updates show up; fall back to cache when offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});

// ---- Reminders ----
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("timely", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const idbGet = (k) => idb().then((db) => new Promise((res) => { const q = db.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); })).catch(() => null);
const idbSet = (k, v) => idb().then((db) => new Promise((res) => { const t = db.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = res; t.onerror = res; })).catch(() => {});
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const kes = (n) => "KES " + Math.round(n).toLocaleString("en-KE");

function digest(S, now) {
  const t = iso(now), parts = [];
  const sc = S.school.filter((x) => !x.done && x.kind !== "lecture"), er = S.errands.filter((x) => !x.done);
  const dS = sc.filter((x) => x.when === t), dE = er.filter((x) => x.due === t);
  const late = sc.filter((x) => x.when < t).length + er.filter((x) => x.due && x.due < t).length;
  if (dS.length) parts.push(dS.map((x) => (({ cat: "CAT: ", exam: "Exam: " })[x.kind] || "Due: ") + x.title).join(", "));
  if (dE.length) parts.push("Errands: " + dE.map((x) => x.title).join(", "));
  if (late) parts.push(late + " overdue");
  const day = now.getDay(), dom = now.getDate();
  const nudge = S.goals.filter((g) => g.monthly > 0 && g.saved < g.target && ((g.period === "week" && day === 1) || (g.period !== "week" && dom === 1)));
  if (nudge.length) parts.push("Time to save: " + nudge.map((g) => kes(g.monthly) + " for " + g.name).join(", "));
  return parts.join(". ");
}

async function swCheck() {
  const R = await idbGet("remind"), S = await idbGet("state");
  if (!R || !R.on || !S) return;
  const now = new Date(), t = iso(now);
  const hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  if (R.last === t || hm < R.time) return;
  R.last = t;
  await idbSet("remind", R);
  const body = digest(S, now);
  if (body) await self.registration.showNotification("Timely", { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "timely-daily" });
}

self.addEventListener("periodicsync", (e) => { if (e.tag === "timely-daily") e.waitUntil(swCheck()); });

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return clients.openWindow("./");
    })
  );
});
