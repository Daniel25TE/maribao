// backend/routes/stats.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { protegerRuta } from "../middlewares/auth.js";

const router = express.Router();

// Supabase client (service role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper: formatear fecha a YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString().split("T")[0];
}

// Función para calcular número de semana si no viene de Supabase
function getWeekNumber(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Ruta de estadísticas protegida
router.get("/admin/stats", protegerRuta, async (req, res) => {
  try {
    // Total de visitas
    const { count: total } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true });
    console.log("✅ Total de visitas en Supabase:", total);

    // Traer visitas desde RPCs
    const { data: dailyRaw, error: dailyError } = await supabase.rpc("visits_per_day");
    const { data: weeklyRaw, error: weeklyError } = await supabase.rpc("visits_per_week");
    const { data: monthlyRaw, error: monthlyError } = await supabase.rpc("visits_per_month");

    if (dailyError || weeklyError || monthlyError) {
      console.error("Error obteniendo estadísticas:", { dailyError, weeklyError, monthlyError });
      return res.status(500).json({ error: "Error obteniendo estadísticas" });
    }

    console.log("📊 DailyRaw:", dailyRaw);
    console.log("📊 WeeklyRaw:", weeklyRaw);
    console.log("📊 MonthlyRaw:", monthlyRaw);

    // Transformar daily a { day, total }
    const daily = dailyRaw
      .filter(v => v.created_at || v.date)
      .map(v => ({
        day: formatDate(v.created_at || v.date),
        total: v.count ?? 1
      }));
    
    console.log("📊 Daily procesado:", daily);

    // Transformar weekly a { week, total }
    const weekly = weeklyRaw.map(v => ({
      week: v.week || getWeekNumber(new Date(v.created_at || v.date)),
      total: v.count ?? 1
    }));

    console.log("📊 Weekly procesado:", weekly);

    // Transformar monthly a { month, total }
    const monthly = monthlyRaw.map(v => ({
      month: formatDate(v.created_at || v.date),
      total: v.count ?? 1
    }));

    console.log("📊 Monthly procesado:", monthly);

    res.json({ total, daily, weekly, monthly });

    return res.json({ total, daily, weekly, monthly });
  } catch (error) {
    console.error("Error stats:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

export default router;




