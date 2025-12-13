import express from "express";
import multer from "multer";
import supabase from "../database.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const file = req.file;
    const filePath = file.originalname; // ruta dentro del bucket

    // 1️⃣ Subir al bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("videos_storage")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true // reemplaza si ya existe
      });

    if (uploadError) throw uploadError;

    // 2️⃣ Generar URL pública
    const { publicUrl, error: urlError } = supabase.storage
      .from("videos_storage")
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    // 3️⃣ Guardar o actualizar en la tabla videos
    const { data: upsertData, error: upsertError } = await supabase
      .from("videos")
      .upsert({ key: "home_video", value: publicUrl });

    if (upsertError) throw upsertError;

    res.json({ message: "Video subido y URL guardada correctamente", url: publicUrl });

  } catch (err) {
    console.error("Error subiendo video:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

