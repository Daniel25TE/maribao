// database.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para conectar con Supabase
    }
});

export async function insertarReserva({ nombre, email, room_name, checkin_date, checkout_date }) {
    const query = `
    INSERT INTO reservas (nombre, email, room_name, checkin_date, checkout_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

    const values = [nombre, email, room_name, checkin_date, checkout_date];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('Error al insertar reserva:', err);
        throw err;
    }
}
