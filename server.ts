import express from "express"
import { createServer as createViteServer } from "vite"
import path from "path"
import fs from "fs"
import multer from "multer"
import dotenv from "dotenv"
import cloudinary from "./cloudinary"
import { db } from "./firebase"
import cors from "cors"

dotenv.config()

const upload = multer({ storage: multer.memoryStorage() })

const app = express()
app.use(cors({
  origin: "https://infinia-bharat-news.vercel.app",
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}))

app.use(express.json())

async function sendPushNotification(title, message, url) {

 await fetch("https://onesignal.com/api/v1/notifications", {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
   "Authorization": "os_v2_app_bnrmcrpmcnbfdbbtisehoqqw6dfuv5ihvzreqlvmsausv7kwuvxshlmhx4zgxl6r2gpgt6kflf7kumquacj4424mzrisxwmn5pr3qfi"
  },
  body: JSON.stringify({
   app_id: "0b62c145-ec13-4251-8433-4488774216f0",
   included_segments: ["All"],
   headings: { en: title },
   contents: { en: message },
   url
  })
 })

}

app.post("/api/upload", upload.single("image"), async (req, res) => {

 if (!req.file) {
  return res.status(400).json({ error: "No file uploaded" })
 }

 const stream = cloudinary.uploader.upload_stream(
  { folder: "news" },
  (error, result) => {

   if (error) return res.status(500).json({ error })

   res.json({ url: result.secure_url })

  }
 )

 stream.end(req.file.buffer)

})
app.get("/ping",(req,res)=>{
 res.send("alive")
})

/* ARTICLES */

app.get("/api/articles", async (req, res) => {

 const snapshot = await db.collection("articles")
 .orderBy("created_at","desc")
 .get()

 const data = snapshot.docs.map(doc => {
 const d = doc.data()

 return {
  id: doc.id,
  ...d,
  created_at: d.created_at?.toDate ? d.created_at.toDate() : d.created_at
 }
})

 res.json(data)

})

app.post("/api/articles", async (req,res)=>{

 const body = req.body

 const ref = await db.collection("articles").add({
  ...body,
  created_at: new Date()
 })

 await sendPushNotification(
  body.title_en,
  "New article published on Infinia Bharat News",
  "https://infinia-bharat-news.vercel.app/article/"+ref.id
 )

 res.json({id:ref.id})

})

app.delete("/api/articles/:id", async(req,res)=>{

 await db.collection("articles").doc(req.params.id).delete()

 res.json({success:true})

})

app.put("/api/articles/:id", async(req,res)=>{

 await db.collection("articles").doc(req.params.id).update(req.body)

 res.json({success:true})

})

/* VIDEOS */

app.get("/api/videos", async(req,res)=>{

 const snapshot = await db.collection("videos")
 .orderBy("created_at","desc")
 .get()

 res.json(snapshot.docs.map(d=>({id:d.id,...d.data()})))

})

app.post("/api/videos", async(req,res)=>{

 const body = req.body

 const ref = await db.collection("videos").add({
  ...body,
  created_at:new Date()
 })

 await sendPushNotification(
  body.title_en,
  "New video uploaded",
  "https://infinia-bharat-news.vercel.app/video/"+ref.id
 )

 res.json({id:ref.id})

})

app.delete("/api/videos/:id", async(req,res)=>{

 await db.collection("videos").doc(req.params.id).delete()

 res.json({success:true})

})

/* BREAKING NEWS */

app.get("/api/breaking-news", async(req,res)=>{

 const snapshot = await db.collection("breaking_news")
 .orderBy("created_at","desc")
 .get()

 res.json(snapshot.docs.map(d=>({id:d.id,...d.data()})))

})

app.post("/api/breaking-news", async(req,res)=>{

 const ref = await db.collection("breaking_news").add({
  ...req.body,
  created_at:new Date()
 })

 res.json({id:ref.id})

})

app.delete("/api/breaking-news/:id", async(req,res)=>{

 await db.collection("breaking_news").doc(req.params.id).delete()

 res.json({success:true})

})

/* ADS */

app.get("/api/ads", async(req,res)=>{

 const snapshot = await db.collection("ads")
 .orderBy("created_at","desc")
 .get()

 res.json(snapshot.docs.map(d=>({id:d.id,...d.data()})))

})

app.post("/api/ads", async(req,res)=>{

 const ref = await db.collection("ads").add({
  ...req.body,
  created_at:new Date()
 })

 res.json({id:ref.id})

})

app.delete("/api/ads/:id", async(req,res)=>{

 await db.collection("ads").doc(req.params.id).delete()

 res.json({success:true})

})
/* HOME DATA (ALL IN ONE API) */

app.get("/api/home", async (req, res) => {

 const [articlesSnap, videosSnap, newsSnap, adsSnap] = await Promise.all([
  db.collection("articles").orderBy("created_at","desc").get(),
  db.collection("videos").orderBy("created_at","desc").get(),
  db.collection("breaking_news").orderBy("created_at","desc").get(),
  db.collection("ads").orderBy("created_at","desc").get()
 ])

 res.json({
  articles: articlesSnap.docs.map(d=>({id:d.id,...d.data()})),
  videos: videosSnap.docs.map(d=>({id:d.id,...d.data()})),
  breakingNews: newsSnap.docs.map(d=>({id:d.id,...d.data()})),
  ads: adsSnap.docs.map(d=>({id:d.id,...d.data()}))
 })

})

/* SETTINGS */

app.get("/api/settings", async(req,res)=>{

 const snapshot = await db.collection("settings").get()

 const obj={}

 snapshot.docs.forEach(doc=>{
  obj[doc.id]=doc.data().value
 })

 res.json(obj)

})

app.post("/api/settings", async(req,res)=>{

 const {key,value}=req.body

 await db.collection("settings").doc(key).set({value})

 res.json({success:true})

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
 console.log("Server running",PORT)
})
