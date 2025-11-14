export function lazyLoadStaticContainers() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '150px',
        threshold: 0.1
    });

    document.querySelectorAll('.lazy-container').forEach(container => {
        observer.observe(container);
    });
}
