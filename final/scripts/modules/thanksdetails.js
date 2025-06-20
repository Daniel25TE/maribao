export function thanksdetails() {

    const myInfo = new URLSearchParams(window.location.search);
    console.log(myInfo);

    console.log(myInfo.get('checkin'));
    console.log(myInfo.get('checkout'));
    console.log(myInfo.get('firstName'));
    console.log(myInfo.get('lastName'));
    console.log(myInfo.get('email'));
    console.log(myInfo.get('phone'));
    console.log(myInfo.get('country'));
    console.log(myInfo.get('paperlessConfirm'));
    console.log(myInfo.get('bookingFor'));
    console.log(myInfo.get('travelForWork'));
    console.log(myInfo.get('fullGuestName'));
    console.log(myInfo.get('specialRequests'));
    console.log(myInfo.get('arrivalTime'));

    document.querySelector('#results').innerHTML = `
    <h2>¡Reserva confirmada! Pronto recibirás un correo electrónico con tu número de reserva y los detalles.</h2>
<p>Reserva a nombre de ${myInfo.get('firstName')} ${myInfo.get('lastName')}</p>
<p>Fecha de llegada: ${myInfo.get('checkin')}</p>
<p>Fecha de salida: ${myInfo.get('checkout')}</p>
<p>Teléfono de contacto: ${myInfo.get('phone')}</p>
<p>Es el Huesped principal?: ${myInfo.get('bookingFor')}</p>
<p>Reserva a nombre de: ${myInfo.get('fullGuestName')}</p>
<p>Tiene algun solicitud especial?: ${myInfo.get('specialRequests')}</p>
<p>Tiempo de llegada al hotel: ${myInfo.get('arrivalTime')}</p>

`
}