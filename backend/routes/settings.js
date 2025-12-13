import express from "express";
import supabase from "../database.js";

const router = express.Router();

// GET /api/settings/home-video
router.get("/home-video", async (req, res) => {
  try {
    // Traer todos los registros de la tabla videos
    const { data, error } = await supabase
      .from("videos")       // tu tabla key/value
      .select("value");     // seleccionamos solo la columna value

    if (error) throw error;

    // Filtrar solo los valores válidos
    const urls = data.map(row => row.value).filter(Boolean);

    if (!urls.length) {
      return res.status(404).json({ urls: [] });
    }

    // Devolver un array de URLs
    res.json({ urls });
  } catch (err) {
    console.error("Error cargando videos home:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;

