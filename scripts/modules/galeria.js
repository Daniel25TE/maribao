export async function loadGallery() {
    const overlay = document.getElementById("loader-overlay");
    const loaderCount = document.getElementById("loader-count");

    let count = 50;
    const interval = setInterval(() => {
        if (count > 0) {
            count--;
            loaderCount.textContent = count;
        } else {
            clearInterval(interval);
        }
    }, 1000);

    // 1️⃣ CARGA LOCAL (PLACEHOLDER)
    try {
        const localRes = await fetch("/data/gallery-placeholder.json");
        const localImages = await localRes.json();
        renderGallery(localImages, { isPlaceholder: true });
    } catch (err) {
        console.warn("No se pudo cargar galería local", err);
    }

    // 2️⃣ CARGA BACKEND (REAL)
    try {
        const res = await fetch("https://hotel-backend-3jw7.onrender.com/api/media");
        const images = await res.json();

        renderGallery(images, {
            clear: true,
            hideLoaderOnLoad: true
        });

        clearInterval(interval);
    } catch (err) {
        console.error("Error cargando galería:", err);
        overlay?.classList.add("hidden");
    }
}

function renderGallery(
    images,
    {
        clear = false,
        isPlaceholder = false,
        hideLoaderOnLoad = false
    } = {}
) {
    const gallery = document.getElementById("galeria");
    const filterContainer = document.getElementById("galeria-filtros");
    const overlay = document.getElementById("loader-overlay");

    if (!gallery || !filterContainer) return;

    if (clear) {
        gallery.innerHTML = "";
        filterContainer.innerHTML = "";
    }

    let firstImageLoaded = false;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                if (img.dataset.srcset) img.srcset = img.dataset.srcset;
                obs.unobserve(img);
            }
        });
    }, { threshold: 0.01 });

    images.forEach((img, index) => {
        const imageEl = document.createElement("img");

        imageEl.dataset.src = img.url_medium;
        imageEl.dataset.srcset = `${img.url_mobile} 640w, ${img.url_medium} 1200w, ${img.url_large} 1920w`;
        imageEl.sizes = "(max-width: 840px) 100vw, 50vw";
        imageEl.alt = img.alt || "Imagen de galería";
        imageEl.dataset.room = img.room || "general";
        imageEl.classList.add("lazy-img");

        if (isPlaceholder) {
            imageEl.classList.add("placeholder-img");
        }

        imageEl.onload = () => {
            if (hideLoaderOnLoad && !firstImageLoaded) {
                firstImageLoaded = true;
                overlay?.classList.add("hidden");
            }
        };

        gallery.appendChild(imageEl);

        if (index < 2) {
            imageEl.src = imageEl.dataset.src;
            imageEl.srcset = imageEl.dataset.srcset;
        } else {
            observer.observe(imageEl);
        }
    });

    // 🎯 FILTROS
    const roomTypes = [...new Set(images.map(img => img.room || "general"))];
    roomTypes.unshift("all");

    roomTypes.forEach(room => {
        const btn = document.createElement("button");
        btn.textContent = room === "all" ? "Todas" : room;
        btn.dataset.room = room;
        btn.classList.add("filter-btn");

        btn.addEventListener("click", () => {
            filterContainer
                .querySelectorAll("button")
                .forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filterImages(room);
        });

        filterContainer.appendChild(btn);
        if (room === "all") btn.classList.add("active");
    });

    function filterImages(room) {
        gallery.querySelectorAll("img").forEach(img => {
            img.style.display =
                room === "all" || img.dataset.room === room
                    ? "block"
                    : "none";
        });
    }

    // 🖼 MODAL
    const modal = document.getElementById("image-modal");
    if (modal) {
        const modalImg = modal.querySelector("img");
        const modalClose = modal.querySelector(".modal-close-galeria");
        const modalOverlay = modal.querySelector(".modal-overlay-galeria");

        gallery.querySelectorAll("img").forEach(img => {
            img.onclick = () => {
                modalImg.src = img.src || img.dataset.src;
                modalImg.srcset = img.srcset || "";
                modalImg.sizes = img.sizes || "";
                modalImg.alt = img.alt || "";
                modal.hidden = false;
            };
        });

        modalClose.onclick = () => (modal.hidden = true);
        modalOverlay.onclick = () => (modal.hidden = true);
    }
}

