const container = document.getElementById('instagram-feed');

async function loadMedia() {
  try {
    const res = await fetch('https://hotel-backend-3jw7.onrender.com/api/media');
    const data = await res.json();

    data.forEach(item => {
      const el = document.createElement(item.tipo === 'video' ? 'video' : 'img');

      if (item.tipo === 'video') {
        el.src = item.url;
        el.controls = true;
      } else {
        el.src = item.url;
      }

      el.alt = item.caption;
      el.className = 'rounded-lg shadow';
      container.appendChild(el);
    });
  } catch (err) {
    console.error('Error cargando media:', err);
  }
}

loadMedia();
