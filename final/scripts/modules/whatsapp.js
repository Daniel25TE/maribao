let isListOpen = false;

export function toggleContactList() {
  const list = document.getElementById('contactList');
  const iconContainer = document.getElementById('whatsappIcon');
  const iconImg = iconContainer.querySelector('img');

  isListOpen = !isListOpen;

  if (isListOpen) {
    list.style.display = 'flex';
    iconImg.src = 'images/x-circle.svg'; // 👈 cambia al ícono de cerrar
    iconImg.alt = 'Cerrar';
    list.setAttribute('aria-hidden', 'false');
  } else {
    list.style.display = 'none';
    iconImg.src = 'images/whatsapp.svg'; // 👈 vuelve al ícono de WhatsApp
    iconImg.alt = 'WhatsApp';
    list.setAttribute('aria-hidden', 'true');
  }
}

export function openWhatsApp(number) {
  const url = `https://wa.me/${number}`;
  window.open(url, '_blank');
}
