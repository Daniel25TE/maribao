function protegerRuta(req, res, next) {
    if (req.session?.usuarioAutenticado) {
        return next();
    } else {
        return res.status(401).json({ error: "No autorizado" });
    }
}
