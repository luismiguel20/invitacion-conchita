const CONFIG = {
  eventDate: new Date("2026-11-22T13:00:00-06:00"),
  whatsappNumber: "527711687304",
  fallbackWhatsappMessage:
    "Hola Conchita, con gusto te confirmo la asistencia a tu celebración del domingo 22 de noviembre de 2026 a la 1:00 PM."
};

const waUrl = (message) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

function decodeBase64UrlUtf8(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function readInvitationData() {
  const token = new URLSearchParams(window.location.search).get("i");
  if (!token) return null;

  try {
    const payload = JSON.parse(decodeBase64UrlUtf8(token));
    const name = String(payload.p ?? "").trim();
    const guests = Number.parseInt(payload.n, 10);

    if (!name || name.length > 80) return null;
    if (!Number.isInteger(guests) || guests < 1 || guests > 20) return null;

    return { name, guests };
  } catch (error) {
    console.warn("La liga personalizada no pudo interpretarse.", error);
    return null;
  }
}

const invitation = readInvitationData();

const personalizedSection = document.getElementById("invitacionPersonalizada");
const personalizedName = document.getElementById("personalizedName");
const personalizedQuota = document.getElementById("personalizedQuota");

if (invitation) {
  personalizedName.textContent = invitation.name;
  personalizedQuota.textContent = invitation.guests === 1
    ? "Tenemos reservado 1 lugar para ti."
    : `Tenemos reservados ${invitation.guests} lugares para ustedes.`;
  personalizedSection.hidden = false;
}

const whatsappButtons = document.querySelectorAll("#whatsappMain, #whatsappFloating");
const rsvpModal = document.getElementById("rsvpModal");

const genericRsvpPanel = document.getElementById("genericRsvpPanel");
const genericRsvpForm = document.getElementById("genericRsvpForm");
const guestIdentity = document.getElementById("guestIdentity");
const genericRsvpError = document.getElementById("genericRsvpError");
const genericRsvpDecline = document.getElementById("genericRsvpDecline");

const personalizedRsvpPanel = document.getElementById("personalizedRsvpPanel");
const rsvpOptions = document.getElementById("rsvpOptions");
const rsvpLimit = document.getElementById("rsvpLimit");
const rsvpDecline = document.getElementById("rsvpDecline");

function openWhatsapp(message) {
  window.open(waUrl(message), "_blank", "noopener,noreferrer");
}

function cleanIdentity(value) {
  return value.trim().replace(/\s+/g, " ");
}

function buildGenericAttendMessage(identity) {
  return `Hola Conchita, te escribe ${identity}. Con gusto te confirmo la asistencia a tu celebración del domingo 22 de noviembre de 2026 a la 1:00 PM.`;
}

function buildGenericDeclineMessage(identity) {
  return `Hola Conchita, te escribe ${identity}. Muchas gracias por la invitación. Lamentablemente no será posible acompañarte en tu celebración, pero esperamos que pases un día muy bonito.`;
}

function buildAttendMessage(count) {
  if (count === 1) {
    return "Hola Conchita, con gusto confirmo mi asistencia a tu celebración del domingo 22 de noviembre de 2026 a la 1:00 PM. Asistiré yo.";
  }

  return `Hola Conchita, con gusto confirmamos nuestra asistencia a tu celebración del domingo 22 de noviembre de 2026 a la 1:00 PM. Seremos ${count} personas.`;
}

function buildDeclineMessage() {
  if (invitation?.guests === 1) {
    return "Hola Conchita, muchas gracias por la invitación. Lamentablemente no podré acompañarte en tu celebración, pero espero que pases un día muy bonito.";
  }

  return "Hola Conchita, muchas gracias por la invitación. Lamentablemente no podremos acompañarte en tu celebración, pero esperamos que pases un día muy bonito.";
}

function showModal() {
  rsvpModal.hidden = false;
  document.body.classList.add("is-modal-open");
}

function closeRsvp() {
  rsvpModal.hidden = true;
  document.body.classList.remove("is-modal-open");
  genericRsvpError.hidden = true;
}

function openGenericRsvp() {
  personalizedRsvpPanel.hidden = true;
  genericRsvpPanel.hidden = false;
  guestIdentity.value = "";
  genericRsvpError.hidden = true;
  showModal();
  window.setTimeout(() => guestIdentity.focus(), 80);
}

function openPersonalizedRsvp() {
  genericRsvpPanel.hidden = true;
  personalizedRsvpPanel.hidden = false;
  rsvpOptions.innerHTML = "";

  rsvpLimit.textContent = invitation.guests === 1
    ? "Tu invitación contempla 1 lugar."
    : `Tu invitación contempla hasta ${invitation.guests} lugares.`;

  for (let count = 1; count <= invitation.guests; count += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rsvp-option";
    button.textContent = String(count);
    button.setAttribute(
      "aria-label",
      count === 1 ? "Confirmar 1 persona" : `Confirmar ${count} personas`
    );
    button.addEventListener("click", () => {
      closeRsvp();
      openWhatsapp(buildAttendMessage(count));
    });
    rsvpOptions.appendChild(button);
  }

  rsvpDecline.textContent = invitation.guests === 1
    ? "No podré asistir"
    : "No podremos asistir";

  showModal();
}

function openRsvp() {
  if (invitation) {
    openPersonalizedRsvp();
  } else {
    openGenericRsvp();
  }
}

whatsappButtons.forEach((link) => {
  link.href = waUrl(CONFIG.fallbackWhatsappMessage);
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openRsvp();
  });
});

genericRsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const identity = cleanIdentity(guestIdentity.value);

  if (!identity) {
    genericRsvpError.hidden = false;
    guestIdentity.focus();
    return;
  }

  closeRsvp();
  openWhatsapp(buildGenericAttendMessage(identity));
});

guestIdentity.addEventListener("input", () => {
  if (cleanIdentity(guestIdentity.value)) genericRsvpError.hidden = true;
});

genericRsvpDecline.addEventListener("click", () => {
  const identity = cleanIdentity(guestIdentity.value);

  if (!identity) {
    genericRsvpError.hidden = false;
    guestIdentity.focus();
    return;
  }

  closeRsvp();
  openWhatsapp(buildGenericDeclineMessage(identity));
});

document.querySelectorAll("[data-close-rsvp]").forEach((element) => {
  element.addEventListener("click", closeRsvp);
});

rsvpDecline.addEventListener("click", () => {
  closeRsvp();
  openWhatsapp(buildDeclineMessage());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !rsvpModal.hidden) closeRsvp();
});

const countdown = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  finished: document.getElementById("countdownFinished")
};

const pad = (n) => String(n).padStart(2, "0");

function updateCountdown() {
  const diff = CONFIG.eventDate.getTime() - Date.now();

  if (diff <= 0) {
    countdown.days.textContent = "00";
    countdown.hours.textContent = "00";
    countdown.minutes.textContent = "00";
    countdown.seconds.textContent = "00";
    countdown.finished.hidden = false;
    return;
  }

  const total = Math.floor(diff / 1000);
  countdown.days.textContent = pad(Math.floor(total / 86400));
  countdown.hours.textContent = pad(Math.floor((total % 86400) / 3600));
  countdown.minutes.textContent = pad(Math.floor((total % 3600) / 60));
  countdown.seconds.textContent = pad(total % 60);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -24px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const hero = document.querySelector(".hero");
const floating = document.getElementById("whatsappFloating");

if ("IntersectionObserver" in window && hero && floating) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      floating.classList.toggle("is-visible", !entry.isIntersecting);
    },
    { threshold: 0.12 }
  );

  heroObserver.observe(hero);
}
