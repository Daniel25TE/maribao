// backend/routes/stats.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { protegerRuta } from "../middlewares/auth.js"; // tu middleware compartido

const router = express.Router();

// Supabase client (service role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Ruta de estadísticas protegida
router.get("/admin/stats", protegerRuta, async (req, res) => {
  try {
    // Total de visitas
    const { count: total } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true });

    // Visitas por día, semana y mes usando tus funciones RPC
    const { data: daily, error: dailyError } = await supabase.rpc("visits_per_day");
    const { data: weekly, error: weeklyError } = await supabase.rpc("visits_per_week");
    const { data: monthly, error: monthlyError } = await supabase.rpc("visits_per_month");

    if (dailyError || weeklyError || monthlyError) {
      console.error("Error obteniendo estadísticas:", { dailyError, weeklyError, monthlyError });
      return res.status(500).json({ error: "Error obteniendo estadísticas" });
    }

    return res.json({
      total,
      daily,
      weekly,
      monthly
    });
  } catch (error) {
    console.error("Error stats:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

export default router;

