/* Startup */
window.onload = function () {
    initDatabase();
    // Click outside a popup, or press Esc, to close it
    document.getElementById('global-modal').addEventListener('mousedown', e => { if (e.target.id === 'global-modal') closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
};
