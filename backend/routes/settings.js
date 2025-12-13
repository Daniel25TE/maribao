import express from "express";
import supabase from "../database.js";

const router = express.Router();

// GET /api/settings/home-video
router.get("/home-video", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("videos")        // tu tabla key/value
      .select("value")
      .eq("key", "home_video")  // la clave que identifica el video de la home
      .single();

    if (error || !data) {
      return res.status(404).json({ url: null });
    }

    res.json({ url: data.value }); // data.value = URL pública del video
  } catch (err) {
    console.error("Error cargando video home:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;

