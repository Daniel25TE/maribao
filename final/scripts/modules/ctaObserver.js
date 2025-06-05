export function setupCTAObserver(ctaElement, headerElement) {
    if (!ctaElement || !headerElement) return;

    const observer = new IntersectionObserver(
        (entries) => {
            const [entry] = entries;
            ctaElement.style.display = entry.isIntersecting ? "none" : "block";
        },
        {
            root: null,
            threshold: 0,
        }
    );

    observer.observe(headerElement);
}
