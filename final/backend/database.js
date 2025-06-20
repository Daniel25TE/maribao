// database.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function insertarReserva({ nombre, email, room_name, checkin_date, checkout_date }) {
    const { data, error } = await supabase
        .from('reservas')
        .insert([
            {
                nombre,
                email,
                room_name,
                checkin_date,
                checkout_date
            }
        ]);

    if (error) {
        console.error('Error al insertar en Supabase:', error);
        throw error;
    }

    return data[0];
}

