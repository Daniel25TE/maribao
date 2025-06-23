// auth.js
import auth from 'basic-auth';

export function basicAuth(req, res, next) {
    const user = auth(req);

    const USERNAME = process.env.ADMIN_USER;
    const PASSWORD = process.env.ADMIN_PASS;

    if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
        res.set('WWW-Authenticate', 'Basic realm="Admin Panel"');
        return res.status(401).send('Acceso no autorizado');
    }

    next();
}
