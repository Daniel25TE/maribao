// Toggle sidebar en móviles
const sidebar = document.getElementById('sidebar');
const hamburgerBtn = document.getElementById('hamburgerBtn');

hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});

// Navegación entre secciones
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const sections = document.querySelectorAll('.admin-section');

sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Quitar active a todos
        sidebarBtns.forEach(b => b.classList.remove('bg-gray-200'));
        btn.classList.add('bg-gray-200');

        const targetId = btn.getAttribute('data-target');
        sections.forEach(sec => {
            if (sec.id === targetId) {
                sec.classList.remove('hidden');
            } else {
                sec.classList.add('hidden');
            }
        });

        // Si estamos en móvil, cerrar sidebar
        if (window.innerWidth < 768) {
            sidebar.classList.add('-translate-x-full');
        }
    });
});
