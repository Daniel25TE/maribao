// middlewares/auth.js

export function protegerRuta(req, res, next) {
    if (req.session?.usuarioAutenticado) {
        next();
    } else {
        res.status(401).json({ error: 'No autorizado' });
    }
}

