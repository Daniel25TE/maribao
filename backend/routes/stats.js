import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware para proteger la ruta usando la sesión de tu login
function protegerRuta(req, res, next) {
  if (req.session.usuarioAutenticado) return next();
  return res.status(401).json({ error: "No autorizado" });
}

router.get("/admin/stats", protegerRuta, async (req, res) => {
  try {
    // total de visitas
    const { count: total, error: totalError } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true });
    if (totalError) throw totalError;

    // visitas por día
    const { data: daily, error: dailyError } = await supabase.rpc("visits_per_day");
    if (dailyError) throw dailyError;

    // visitas por semana
    const { data: weekly, error: weeklyError } = await supabase.rpc("visits_per_week");
    if (weeklyError) throw weeklyError;

    // visitas por mes
    const { data: monthly, error: monthlyError } = await supabase.rpc("visits_per_month");
    if (monthlyError) throw monthlyError;

    return res.json({
      total,
      daily,
      weekly,
      monthly,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

export default router;
