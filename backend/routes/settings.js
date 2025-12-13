import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// GET /api/settings/home-video
router.get("/home-video", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "home_video_url")
      .single();

    if (error || !data) {
      return res.json({ url: null });
    }

    res.json({ url: data.value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
