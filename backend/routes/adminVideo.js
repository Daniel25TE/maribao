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
    const { data, error: urlError } = await supabase.storage
      .from("videos_storage")
      .createSignedUrl(filePath, 7 * 24 * 60 * 60);

    if (urlError) throw urlError;

    const signedUrl = data.signedUrl;

    // 3️⃣ Guardar o actualizar en la tabla videos
    const { data: upsertData, error: upsertError } = await supabase
      .from("videos")
      .upsert({ key: "home_video", value: signedUrl });

    if (upsertError) throw upsertError;

    res.json({ 
      message: "Video subido y URL guardada correctamente", 
      url: signedUrl
    });

  } catch (err) {
    console.error("Error subiendo video:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/videos
router.get("/videos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("id, value"); // traer key y value de cada video

    if (error) throw error;

    res.json({ videos: data });
  } catch (err) {
    console.error("Error listando videos:", err);
    res.status(500).json({ error: "Error listando videos" });
  }
});

// DELETE /admin/video/:key
router.delete("/video/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Buscar el video en la tabla
    const { data, error } = await supabase
      .from("videos")
      .select("value")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Video no encontrado" });
    }

    // 2️⃣ Extraer path del archivo desde la URL
    const url = data.value;
    const path = url.split("/videos_storage/")[1].split("?")[0];

    // 3️⃣ Borrar del bucket
    const { error: deleteError } = await supabase.storage
      .from("videos_storage")
      .remove([path]);

    if (deleteError) throw deleteError;

    // 4️⃣ Borrar de la tabla
    await supabase.from("videos").delete().eq("id", id);

    res.json({ message: "Video eliminado correctamente" });

  } catch (err) {
    console.error("Error eliminando video:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;

