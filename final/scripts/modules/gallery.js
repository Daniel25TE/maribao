export async function loadGallery() {
    try {
        const res = await fetch("data/galeria.json");
        const images = await res.json();
        const gallery = document.getElementById("gallery");
        const filterContainer = document.getElementById("gallery-filters"); // contenedor para botones

        // 👉 Observer para lazy loading
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
                    obs.unobserve(img);
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.01
        });

        // 👉 Creamos las imágenes y guardamos el room
        images.forEach((img, index) => {
            const imageEl = document.createElement("img");
            imageEl.dataset.src = img.src;
            if (img.srcset) imageEl.dataset.srcset = img.srcset;
            if (img.sizes) imageEl.sizes = img.sizes;
            imageEl.alt = img.alt;
            imageEl.dataset.room = img.room; // 👈 guardamos tipo de habitación
            imageEl.classList.add("lazy-img");

            gallery.appendChild(imageEl);

            // Primeras imágenes hero se cargan de inmediato
            if (index === 0 || index === 1) {
                imageEl.src = imageEl.dataset.src;
                if (imageEl.dataset.srcset) imageEl.srcset = imageEl.dataset.srcset;
            } else {
                observer.observe(imageEl);
            }
        });

        // 👉 Creamos botones de filtro automáticamente
        const roomTypes = [...new Set(images.map(img => img.room))];
        roomTypes.unshift("all"); // opción todos

        roomTypes.forEach(room => {
            const btn = document.createElement("button");
            btn.textContent = room === "all" ? "Todas" : room;
            btn.dataset.room = room;
            btn.classList.add("filter-btn");
            filterContainer.appendChild(btn);

            btn.addEventListener("click", () => {
                // quitar clase active de todos
                filterContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                filterImages(room);
            });
            if (room === "all") {
                btn.classList.add("active");
            }

        });

        // 👉 Función de filtrado
        function filterImages(room) {
            const allImages = gallery.querySelectorAll("img");
            allImages.forEach(img => {
                if (room === "all" || img.dataset.room === room) {
                    img.style.display = "block";
                    if (!img.src) {
                        img.src = img.dataset.src;
                        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
                    }
                } else {
                    img.style.display = "none";
                }

            });

        }
        const modal = document.getElementById("image-modal");
        const modalImg = modal.querySelector("img");
        const modalClose = modal.querySelector(".modal-close-gallery");
        const modalOverlay = modal.querySelector(".modal-overlay-gallery");

        gallery.querySelectorAll("img").forEach(img => {
            img.addEventListener("click", () => {
                modalImg.src = img.src;
                modalImg.srcset = img.srcset || "";
                modalImg.sizes = img.sizes || "";
                modalImg.alt = img.alt || "";

                modal.hidden = false;
            });
        });

        modalClose.addEventListener("click", () => {
            modal.hidden = true;
        });

        modalOverlay.addEventListener("click", () => {
            modal.hidden = true;
        });

    } catch (err) {
        console.error("Error cargando galería:", err);
    }
}



