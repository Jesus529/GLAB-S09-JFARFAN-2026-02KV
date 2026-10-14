
const API = 'http://localhost:3000';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

const fileInput = document.getElementById('file');
const statusEl = document.getElementById('status');
const gallery = document.getElementById('gallery');

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const file = fileInput.files[0];

  if (!file) {
    statusEl.textContent = 'Selecciona una imagen.';
    return;
  }

  if (!ALLOWED.includes(file.type)) {
    statusEl.textContent = 'Solo se permiten JPG, PNG y WEBP.';
    return;
  }

  if (file.size === 0 || file.size >= MAX_SIZE) {
    statusEl.textContent = 'La imagen debe pesar menos de 5 MB.';
    return;
  }

  try {
    statusEl.textContent = 'Preparando subida...';

    const response = await fetch(`${API}/api/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al preparar subida');

    statusEl.textContent = 'Subiendo directamente a S3...';

    const upload = await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });

    if (!upload.ok) throw new Error('S3 rechazó la subida');

    statusEl.textContent = 'Imagen subida correctamente.';
    fileInput.value = '';
    await loadGallery();
  } catch (error) {
    statusEl.textContent = error.message;
  }
});

async function loadGallery() {
  try {
    const response = await fetch(`${API}/api/images`);
    if (!response.ok) throw new Error('No se pudo cargar la galería');

    const items = await response.json();
    gallery.replaceChildren();

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';

      const img = document.createElement('img');
      img.src = item.url;
      img.alt = 'Imagen almacenada en S3';

      const name = document.createElement('p');
      name.textContent = item.key.split('/').pop();

      const button = document.createElement('button');
      button.textContent = 'Eliminar';
      button.addEventListener('click', async () => {
        if (!confirm('¿Eliminar esta imagen?')) return;

        const result = await fetch(`${API}/api/images`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: item.key })
        });

        if (!result.ok) {
          statusEl.textContent = 'No se pudo eliminar la imagen.';
          return;
        }

        statusEl.textContent = 'Imagen eliminada.';
        await loadGallery();
      });

      card.append(img, name, button);
      gallery.append(card);
    });
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

loadGallery();

