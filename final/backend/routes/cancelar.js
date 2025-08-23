import express from "express";
import supabase from "../database.js"; // tu conexión a supabase
const router = express.Router();

// Buscar reserva por número de transferencia
router.get("/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .eq("numeroTransferencia", numeroTransferencia)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Eliminar reserva por número de transferencia
router.delete("/:numeroTransferencia", async (req, res) => {
    const { numeroTransferencia } = req.params;

    try {
        const { error } = await supabase
            .from("reservas")
            .delete()
            .eq("numeroTransferencia", numeroTransferencia);

        if (error) {
            return res.status(500).json({ error: "Error al eliminar la reserva" });
        }

        res.json({ message: "Reserva cancelada con éxito" });
    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
