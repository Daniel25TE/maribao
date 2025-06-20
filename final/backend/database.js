import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para insertar reserva en Supabase
export async function insertarReserva(datos) {
    const {
        firstName,
        lastName,
        email,
        phone,
        country,
        checkin,
        checkout,
        cuarto,
        specialRequests,
        arrivalTime,
        bookingFor,
        travelForWork,
        addFlights,
        addCar,
        addTaxi,
        fullGuestName,
    } = datos;

    const { data, error } = await supabase
        .from('reservas')
        .insert([
            {
                nombre: `${firstName} ${lastName}`,
                email: email,
                telefono: phone,
                pais: country,
                checkin_date: checkin,
                checkout_date: checkout,
                room_name: cuarto,
                special_requests: specialRequests || '',
                arrival_time: arrivalTime || '',
                booking_for: bookingFor,
                travel_for_work: travelForWork,
                add_flights: addFlights,
                add_car: addCar,
                add_taxi: addTaxi,
                full_guest_name: fullGuestName,
            },
        ])
        .select();

    if (error) {
        console.error('❌ Error al insertar en Supabase:', error);
        throw error;
    }

    console.log('✅ Reserva insertada con éxito:', data[0]);
    return data[0];
}

// Función para obtener todas las reservas desde Supabase
export async function obtenerReservas() {
    const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error al obtener reservas desde Supabase:', error);
        throw error;
    }

    return data;
}
