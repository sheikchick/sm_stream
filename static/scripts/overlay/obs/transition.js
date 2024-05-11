const transitionEL = document.getElementById('media');

window.addEventListener('transitionStart', () => {
    transitionEL.play()
});
window.addEventListener('transitionStop', () => {
    transitionEL.load();
});