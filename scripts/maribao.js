const currentYear = new Date().getFullYear();
document.getElementById('currentyear').textContent = currentYear;

const currentYearMobile = new Date().getFullYear();
document.getElementById('currentyear-mobile').textContent = currentYearMobile;

const lastModified = document.lastModified;
document.getElementById('lastModified').textContent = `Last Modified: ${lastModified}`;

document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navigation = document.querySelector(".navigation");

    hamburger.addEventListener("click", function () {
        navigation.classList.toggle("active");
        hamburger.classList.toggle("is-active");
    });

    showHome(); // Ensure images exist before selecting them

    setTimeout(() => {
        const images = document.querySelectorAll(".image-container img");
        const prevBtn = document.querySelector(".prev-btn");
        const nextBtn = document.querySelector(".next-btn");
        let currentImageIndex = 0;
    
        function updateImages() {
            const len = images.length;
            const prevIndex = (currentImageIndex - 1 + len) % len;
            const nextIndex = (currentImageIndex + 1) % len;
        
            console.log("Current Index:", currentImageIndex); // Debugging
            console.log("Next Index:", nextIndex); // Debugging
            console.log("Next Image Element:", images[nextIndex]); // Should log the element

        
            images.forEach((img, index) => {
                img.classList.remove("prev", "current", "next");
                img.style.opacity = 0;
                img.style.transform = ""; // Reset transformations
                if (index === prevIndex) {
                    img.classList.add("prev");
                    img.style.opacity = 0.6;
                    img.style.transform = "translate(-50%, -50%) scale(0.8)";
                } else if (index === currentImageIndex) {
                    img.classList.add("current");
                    img.style.opacity = 1;
                    img.style.transform = "translate(-50%, -50%) scale(1)";
                } else if (index === nextIndex) {
                    img.classList.add("next");
                    img.style.opacity = 0.6;
                    img.style.transform = "translate(50%, -50%) scale(0.8)";
                }
            });
        }
        
    
        prevBtn.addEventListener("click", () => {
            currentImageIndex =
                (currentImageIndex - 1 + images.length) % images.length;
            updateImages();
        });
    
        nextBtn.addEventListener("click", () => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            updateImages();
        });
    
        updateImages(); // Initialize carousel
    }, 100); // Small delay ensures images exist before selection
    
});


function showHome() {
    const content = document.querySelector('.verna');
    content.innerHTML = `
        <h1 class="maintitle">Bienvenidos a Maribao!</h1>
        <div class="album">
            <div class="carousel-wrapper">
                <div class="image-container">
                    <img src="https://picsum.photos/1000/550" class="current" alt="Current Image">
                    <img src="https://picsum.photos/1000/550" class="next" alt="Next Image">
                    <img src="https://picsum.photos/1000/550" class="prev" alt="Previous Image">
                    <img src="https://picsum.photos/1000/550" alt="Extra Image">
                    <img src="https://picsum.photos/1000/550" alt="Extra Image">
                    <img src="https://picsum.photos/1000/550" alt="Extra Image">
                </div>
            </div>    
            <button class="prev-btn">◀</button>
            <button class="next-btn">▶</button>
        </div>
        <h1 class="maintitle">Bienvenidos a Maribao!</h1>
        <h1 class="maintitle">Bienvenidos a Maribao!</h1>
    `;
}


