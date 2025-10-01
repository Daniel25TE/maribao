export async function loadGallery() {
    const overlay = document.getElementById("loader-overlay");
    const loaderCount = document.getElementById("loader-count");
    let firstImageLoaded = false;

    let count = 50;
    const interval = setInterval(() => {
        if (count > 0) {
            count--;
            loaderCount.textContent = count;
        } else {
            clearInterval(interval);
        }
    }, 1000);
    
    try {
        const res = await fetch("https://hotel-backend-3jw7.onrender.com/api/media");
        const images = await res.json();
        const gallery = document.getElementById("galeria");
        const filterContainer = document.getElementById("galeria-filtros");

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

        images.forEach((img, index) => {
            const imageEl = document.createElement("img");

            imageEl.dataset.src = img.url_medium;
            imageEl.dataset.srcset = `${img.url_mobile} 640w, ${img.url_medium} 1200w, ${img.url_large} 1920w`;
            imageEl.sizes = "(max-width: 840px) 100vw, 50vw";
            imageEl.alt = img.alt;
            imageEl.dataset.room = img.room;
            imageEl.classList.add("lazy-img");

            imageEl.onload = () => {
                if (!firstImageLoaded) {
                    firstImageLoaded = true;
                    overlay.classList.add("hidden");
                }
            };

            gallery.appendChild(imageEl);

            if (index === 0 || index === 1) {
                imageEl.src = imageEl.dataset.src;
                imageEl.srcset = imageEl.dataset.srcset;
            } else {
                observer.observe(imageEl);
            }
        });

        const roomTypes = [...new Set(images.map(img => img.room))];
        roomTypes.unshift("all");

        roomTypes.forEach(room => {
            const btn = document.createElement("button");
            btn.textContent = room === "all" ? "Todas" : room;
            btn.dataset.room = room;
            btn.classList.add("filter-btn");
            filterContainer.appendChild(btn);

            btn.addEventListener("click", () => {
                filterContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                filterImages(room);
            });
            if (room === "all") btn.classList.add("active");
        });

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

        modalClose.addEventListener("click", () => modal.hidden = true);
        modalOverlay.addEventListener("click", () => modal.hidden = true);

    } catch (err) {
        console.error("Error cargando galería:", err);
        overlay.classList.add("hidden");
    }
}
