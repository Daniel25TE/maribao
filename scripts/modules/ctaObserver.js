export function setupCTAObserver(ctaElement, headerElement, weatherElement) {
    if (!ctaElement || !headerElement || !weatherElement) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            const visible = entry.isIntersecting;
            ctaElement.style.display = visible ? "none" : "block";
            weatherElement.style.display = visible ? "none" : "flex";
        },
        { root: null, threshold: 0 }
    );

    observer.observe(headerElement);
    fetchWeather(weatherElement);
}

async function fetchWeather(el) {
    const apiKey = "56d058cb82bb25bb1fbf5aa56dd47fa9";
    const city = "Playas";

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`
        );
        if (!res.ok) throw new Error("No se pudo obtener el clima");

        const data = await res.json();
        const temp = Math.round(data.main.temp);
        const icon = data.weather[0].icon;
        const alt = data.weather[0].description;

        el.innerHTML = `
    <span style="font-size:12px; opacity:0.8;">Maribao</span>
    <span style="font-size:12px; opacity:0.8;">ahora</span>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png"
         alt="${alt}"
         style="width:28px; height:28px;">
    <span>${temp}°C</span>
`;
    } catch (err) {
        console.error("Error al cargar el clima:", err);
        el.style.display = "none";
    }
}

