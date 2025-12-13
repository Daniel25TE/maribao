import express from "express";
import multer from "multer";
import { supabase } from "../supabaseClient.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió video" });
    }

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `home-video.${fileExt}`;

    // 1️⃣ Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 2️⃣ Obtener URL pública
    const { data } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    // 3️⃣ Guardar URL en DB
    await supabase
      .from("site_settings")
      .upsert({
        key: "home_video_url",
        value: data.publicUrl
      });

    res.json({ success: true, url: data.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error subiendo video" });
  }
});

export default router;
