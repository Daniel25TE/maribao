import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function isBot(userAgent = "") {
  return /bot|crawl|spider|slurp|facebook|whatsapp|telegram|preview|headless/i.test(
    userAgent
  );
}

router.post("/visit", async (req, res) => {
  console.log("📌 /visit fue llamado");
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    const userAgent = req.headers["user-agent"] || "unknown";

    console.log("🌐 IP detectada:", ip);
    console.log("📝 User-Agent:", userAgent);

    if (isBot(userAgent)) {
      console.log("🤖 Ignorado: es un bot");
      return res.sendStatus(204);
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const { data: existingVisit, error: existingError } = await supabase
      .from("visits")
      .select("id")
      .eq("ip_address", ip)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .limit(1);

    if (existingError) console.error("❌ Error verificando visita existente:", existingError);

    console.log("👀 Visitas existentes hoy:", existingVisit);

    if (existingVisit && existingVisit.length > 0) {
      console.log("✅ Ya visitó hoy");
      return res.sendStatus(204);
    }

    console.log("✏️ Insertando nueva visita...");
    const { data, error: insertError } = await supabase.from("visits").insert([
      {
        ip_address: ip,
        user_agent: userAgent
      }
    ]);

    if (insertError) {
      console.error("❌ Error insertando visita:", insertError);
      return res.sendStatus(500);
    } else {
      console.log("✅ Visita insertada:", data);
      return res.sendStatus(204);
    }

  } catch (error) {
    console.error("❌ Error registrando visita:", error);
    return res.sendStatus(500);
  }
});

export default router;