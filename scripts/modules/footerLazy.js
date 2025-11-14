export function lazyLoadFooterIcons() {
    const footerObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                obs.unobserve(img);
            }
        });
    }, {
        rootMargin: '100px', // puedes ajustar para que cargue un poco antes
        threshold: 0.1
    });

    document.querySelectorAll('.lazy-footer-icon').forEach(icon => {
        footerObserver.observe(icon);
    });
}
