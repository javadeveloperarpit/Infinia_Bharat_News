import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import fetch from "node-fetch";
import cloudinary from "./cloudinary";
import { db } from "./firebase";

dotenv.config();

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// === GLOBAL MIDDLEWARE ===
app.use(cors({
  origin: "https://infinia-bharat-news.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// === HELPER: Safe async route handler ===
function safeHandler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error("API Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

// === PUSH NOTIFICATION ===
async function sendPushNotification(title, message, url) {
  try {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.ONESIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: title },
        contents: { en: message },
        url
      })
    });
  } catch (err) {
    console.error("Push notification error:", err);
  }
}

// === PING ===
app.get("/ping", (req, res) => res.send("alive"));

// === ROBOTS ===
app.get("/robots.txt", (req, res) => {
  const content = `
User-agent: *
Disallow:

Sitemap: https://infinia-bharat-news.vercel.app/sitemap.xml
`.trim();
  res.header("Content-Type", "text/plain");
  res.send(content);
});

// === SITEMAP ===
async function generateSitemapXML() {
  const base = "https://infinia-bharat-news.vercel.app";
  const [articlesSnap, videosSnap] = await Promise.all([
    db.collection("articles").get(),
    db.collection("videos").get()
  ]);

  const staticUrls = `<url><loc>${base}</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`;
  const articleUrls = articlesSnap.docs.map(doc => `<url><loc>${base}/article/${doc.id}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`).join("");
  const videoUrls = videosSnap.docs.map(doc => `<url><loc>${base}/video/${doc.id}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleUrls}
${videoUrls}
</urlset>`;
}

app.get("/sitemap.xml", safeHandler(async (req, res) => {
  const xml = await generateSitemapXML();
  res.header("Content-Type", "application/xml");
  res.send(xml);
}));

app.get("/news-sitemap.xml", safeHandler(async (req, res) => {
  const base = "https://infinia-bharat-news.vercel.app";
  const [articlesSnap, videosSnap] = await Promise.all([
    db.collection("articles").get(),
    db.collection("videos").get()
  ]);

  const articleUrls = articlesSnap.docs.map(doc => `<url><loc>${base}/article/${doc.id}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`).join("");
  const videoUrls = videosSnap.docs.map(doc => `<url><loc>${base}/video/${doc.id}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articleUrls}
${videoUrls}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
}));

// === FILE UPLOAD ===
app.post("/api/upload", safeHandler(async (req, res) => {
  const uploadMiddleware = upload.single("image");
  uploadMiddleware(req, res, async err => {
    if (err) return res.status(500).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
      { folder: "news" },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({ url: result.secure_url });
      }
    );
    stream.end(req.file.buffer);
  });
}));

// === ARTICLES ===
app.get("/api/articles", safeHandler(async (req, res) => {
  const snapshot = await db.collection("articles").orderBy("created_at","desc").get();
  const data = snapshot.docs.map(doc => {
    const d = doc.data();
    return { id: doc.id, ...d, created_at: d.created_at?.toDate ? d.created_at.toDate() : d.created_at };
  });
  res.json(data);
}));

app.post("/api/articles", safeHandler(async (req, res) => {
  const body = req.body;
  const ref = await db.collection("articles").add({ ...body, created_at: new Date() });
  await sendPushNotification(body.title_en, "New article published on Infinia Bharat News", `https://infinia-bharat-news.vercel.app/article/${ref.id}`);
  res.json({ id: ref.id });
}));

app.put("/api/articles/:id", safeHandler(async (req, res) => {
  await db.collection("articles").doc(req.params.id).update(req.body);
  res.json({ success: true });
}));

app.delete("/api/articles/:id", safeHandler(async (req, res) => {
  await db.collection("articles").doc(req.params.id).delete();
  res.json({ success: true });
}));

// === VIDEOS ===
app.get("/api/videos", safeHandler(async (req, res) => {
  const snapshot = await db.collection("videos").orderBy("created_at","desc").get();
  res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
}));

app.post("/api/videos", safeHandler(async (req, res) => {
  const body = req.body;
  const ref = await db.collection("videos").add({ ...body, created_at: new Date() });
  await sendPushNotification(body.title_en, "New video uploaded", `https://infinia-bharat-news.vercel.app/video/${ref.id}`);
  res.json({ id: ref.id });
}));

app.delete("/api/videos/:id", safeHandler(async (req, res) => {
  await db.collection("videos").doc(req.params.id).delete();
  res.json({ success: true });
}));

// === BREAKING NEWS ===
app.get("/api/breaking-news", safeHandler(async (req, res) => {
  const snapshot = await db.collection("breaking_news").orderBy("created_at","desc").get();
  res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
}));

app.post("/api/breaking-news", safeHandler(async (req, res) => {
  const ref = await db.collection("breaking_news").add({ ...req.body, created_at: new Date() });
  res.json({ id: ref.id });
}));

app.delete("/api/breaking-news/:id", safeHandler(async (req, res) => {
  await db.collection("breaking_news").doc(req.params.id).delete();
  res.json({ success: true });
}));

// === ADS ===
app.get("/api/ads", safeHandler(async (req, res) => {
  const snapshot = await db.collection("ads").orderBy("created_at","desc").get();
  res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
}));

app.post("/api/ads", safeHandler(async (req, res) => {
  const ref = await db.collection("ads").add({ ...req.body, created_at: new Date() });
  res.json({ id: ref.id });
}));

app.delete("/api/ads/:id", safeHandler(async (req, res) => {
  await db.collection("ads").doc(req.params.id).delete();
  res.json({ success: true });
}));

// === HOME API (all-in-one) ===
app.get("/api/home", safeHandler(async (req, res) => {
  const [articlesSnap, videosSnap, newsSnap, adsSnap] = await Promise.all([
    db.collection("articles").orderBy("created_at", "desc").get(),
    db.collection("videos").orderBy("created_at", "desc").get(),
    db.collection("breaking_news").orderBy("created_at", "desc").get(),
    db.collection("ads").orderBy("created_at", "desc").get()
  ]);

  res.json({
    articles: articlesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    videos: videosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    breakingNews: newsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ads: adsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  });
}));

// === SETTINGS ===
app.get("/api/settings", safeHandler(async (req, res) => {
  const snapshot = await db.collection("settings").get();
  const obj = {};
  snapshot.docs.forEach(doc => { obj[doc.id] = doc.data().value });
  res.json(obj);
}));

app.post("/api/settings", safeHandler(async (req, res) => {
  const { key, value } = req.body;
  await db.collection("settings").doc(key).set({ value });
  res.json({ success: true });
}));

// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
