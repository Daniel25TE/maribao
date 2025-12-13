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
      .select("key, value"); // traer key y value de cada video

    if (error) throw error;

    res.json({ videos: data });
  } catch (err) {
    console.error("Error listando videos:", err);
    res.status(500).json({ error: "Error listando videos" });
  }
});

// DELETE /admin/video/:key
router.delete("/video/:key", async (req, res) => {
  const { key } = req.params;

  try {
    // 1️⃣ Buscar el video en la tabla para obtener la URL
    const { data, error: selectError } = await supabase
      .from("videos")
      .select("value")
      .eq("key", key)
      .single();

    if (selectError || !data) {
      return res.status(404).json({ error: "Video no encontrado" });
    }

    const fileUrl = data.value;

    // 2️⃣ Extraer el nombre del archivo del URL
    const urlParts = fileUrl.split("/");
    const fileName = decodeURIComponent(urlParts[urlParts.length - 1].split("?")[0]);

    // 3️⃣ Borrar el archivo del bucket
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from("videos_storage")
      .remove([fileName]);

    if (deleteError) throw deleteError;

    // 4️⃣ Borrar la fila de la tabla
    const { error: rowError } = await supabase
      .from("videos")
      .delete()
      .eq("key", key);

    if (rowError) throw rowError;

    res.json({ message: "Video eliminado correctamente" });

  } catch (err) {
    console.error("Error eliminando video:", err);
    res.status(500).json({ error: "Error eliminando video" });
  }
});


export default router;

