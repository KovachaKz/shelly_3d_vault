import { animate, initViewer } from './scene.js';

document.getElementById('return-button')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

initViewer();
animate();

const guiToggle = document.getElementById('gui-toggle');
if (guiToggle) {
  guiToggle.addEventListener('click', () => {
    const guiEl = document.querySelector('.dg.ac');
    guiEl?.classList.toggle('active');
  });
}
