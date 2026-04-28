const widgetModal = document.getElementById('widget-modal');
const widgetTrigger = document.getElementById('widget-trigger');
const closeWidget = document.getElementById('close-widget');

widgetTrigger.addEventListener('click', () => {
    widgetModal.classList.toggle('active');
    widgetModal.style.display = 'flex'; // Overlay CSS'indeki display:none'ı kırmak için
});

closeWidget.addEventListener('click', () => {
    widgetModal.classList.remove('active');
});