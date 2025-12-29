import express from "express";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "../middlewares/isAdmin.js";


const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ⚠️ aquí luego usaremos tu middleware isAdmin
router.get("/admin/stats", isAdmin, async (req, res) => {
  try {
    // total
    const { count: total } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true });

    // por día
    const { data: daily } = await supabase.rpc("visits_per_day");

    // por semana
    const { data: weekly } = await supabase.rpc("visits_per_week");

    // por mes
    const { data: monthly } = await supabase.rpc("visits_per_month");

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
