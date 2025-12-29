import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();


// Supabase client (service role)
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
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

      const userAgent = req.headers["user-agent"] || "unknown";
      
      if (isBot(userAgent)) {
        return res.sendStatus(204);
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // verificar si ya visitó hoy
    const { data: existingVisit } = await supabase
      .from("visits")
      .select("id")
      .eq("ip_address", ip)
      .gte("created_at", today.toISOString())
      .limit(1);

    if (existingVisit && existingVisit.length > 0) {
      return res.sendStatus(204);
    }

    await supabase.from("visits").insert([
      {
        ip_address: ip,
        user_agent: userAgent
      }
    ]);

    return res.sendStatus(204);
  } catch (error) {
    console.error("Error registrando visita:", error);
    return res.sendStatus(500);
  }
});

export default router;
