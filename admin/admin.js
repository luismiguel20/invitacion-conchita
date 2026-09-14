const form = document.getElementById('inviteForm');
const recipientInput = document.getElementById('recipient');
const placesInput = document.getElementById('places');
const result = document.getElementById('result');
const resultRecipient = document.getElementById('resultRecipient');
const resultPlaces = document.getElementById('resultPlaces');
const generatedUrl = document.getElementById('generatedUrl');
const copyLink = document.getElementById('copyLink');
const copyMessage = document.getElementById('copyMessage');
const openInvite = document.getElementById('openInvite');
const shareWhatsapp = document.getElementById('shareWhatsapp');
const copyNotice = document.getElementById('copyNotice');

let currentUrl = '';
let currentMessage = '';

function encodeBase64Url(obj) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function getInvitationBaseUrl() {
  const url = new URL('../', window.location.href);
  url.search = '';
  url.hash = '';
  return url.href;
}

function buildGuestMessage(url) {
  return `Hola. Me dará mucho gusto contar con su compañía en mi celebración el domingo 22 de noviembre de 2026 a la 1:00 PM. Aquí puede ver su invitación: ${url}`;
}

function showNotice(message) {
  copyNotice.textContent = message;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    copyNotice.textContent = '';
  }, 2500);
}

async function copyText(text, okMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showNotice(okMessage);
  } catch (error) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    showNotice(okMessage);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const recipient = recipientInput.value.trim();
  const places = Number.parseInt(placesInput.value, 10);

  if (!recipient) {
    recipientInput.focus();
    alert('Escribe el nombre de la persona o familia.');
    return;
  }

  if (!Number.isInteger(places) || places < 1 || places > 20) {
    placesInput.focus();
    alert('Escribe un número de lugares entre 1 y 20.');
    return;
  }

  const payload = { v: 1, p: recipient, n: places };
  const token = encodeBase64Url(payload);
  currentUrl = `${getInvitationBaseUrl()}?i=${token}`;
  currentMessage = buildGuestMessage(currentUrl);

  resultRecipient.textContent = recipient;
  resultPlaces.textContent = places === 1 ? '1 lugar reservado' : `${places} lugares reservados`;
  generatedUrl.value = currentUrl;
  openInvite.href = currentUrl;
  shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(currentMessage)}`;

  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

copyLink.addEventListener('click', () => {
  if (currentUrl) copyText(currentUrl, 'Liga copiada');
});

copyMessage.addEventListener('click', () => {
  if (currentMessage) copyText(currentMessage, 'Mensaje completo copiado');
});
