/* ==========================================================================
   BESTWEST CLEANING — SCRIPT
   --------------------------------------------------------------------------
   1. CONFIG — business contact constants (EDIT THESE)
   2. Icon initialization (Lucide)
   3. Sticky navbar + mobile menu
   4. Floating WhatsApp & hero WhatsApp links
   5. FAQ accordion
   6. Pricing plan -> booking form prefill
   7. Booking form validation
   8. Email / WhatsApp message builders
   9. Footer year
   ========================================================================== */

/* ----------------------------------------------------------------------
   1. CONFIG
   --------------------------------------------------------------------
   Replace these two constants to point the site at your real business
   email and WhatsApp number. The WhatsApp number must be in international
   format WITHOUT '+', spaces, or leading zeros (e.g. "2349026958161").
---------------------------------------------------------------------- */
const BUSINESS_EMAIL = "adewumisamuel0231@gmail.com";
const BUSINESS_WHATSAPP = "2349026958161"; // international format, digits only

/* ----------------------------------------------------------------------
   2. ICON INITIALIZATION (Lucide)
---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Lucide is loaded with `defer`, so also try on load in case DOMContentLoaded fired first
window.addEventListener("load", () => {
  if (window.lucide) {
    lucide.createIcons();
  }
});

/* ----------------------------------------------------------------------
   3. STICKY NAVBAR + MOBILE MENU
---------------------------------------------------------------------- */
const navbar = document.getElementById("navbar");
const navbarNav = document.getElementById("navbar-nav");
const navbarBurger = document.getElementById("navbar-burger");

window.addEventListener("scroll", () => {
  if (window.scrollY > 8) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

navbarBurger.addEventListener("click", () => {
  const isOpen = navbarNav.classList.toggle("open");
  navbarBurger.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Close mobile menu after a nav link is clicked (smooth scroll still applies)
navbarNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navbarNav.classList.remove("open");
    navbarBurger.setAttribute("aria-expanded", "false");
  });
});

/* ----------------------------------------------------------------------
   4. FLOATING WHATSAPP & HERO WHATSAPP LINKS
   --------------------------------------------------------------------
   Both buttons open a WhatsApp chat with a friendly default greeting.
---------------------------------------------------------------------- */
function buildWhatsAppGreetingLink() {
  const message = "Hi BestWest Cleaning! I'd like to ask about your cleaning services.";
  return `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

document.getElementById("hero-whatsapp").href = buildWhatsAppGreetingLink();
document.getElementById("floating-whatsapp").href = buildWhatsAppGreetingLink();

/* ----------------------------------------------------------------------
   5. FAQ ACCORDION
---------------------------------------------------------------------- */
const accordionItems = document.querySelectorAll(".accordion__item");

accordionItems.forEach((item) => {
  const trigger = item.querySelector(".accordion__trigger");
  const panel = item.querySelector(".accordion__panel");

  trigger.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    // Close all other items (single-open accordion)
    accordionItems.forEach((otherItem) => {
      otherItem.classList.remove("open");
      otherItem.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
      otherItem.querySelector(".accordion__panel").style.maxHeight = null;
    });

    // Toggle the clicked item
    if (!isOpen) {
      item.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});

/* ----------------------------------------------------------------------
   6. PRICING PLAN -> BOOKING FORM PREFILL
   --------------------------------------------------------------------
   Clicking "Book This Plan" scrolls to the booking form and stores the
   selected plan name in a hidden field so it's included in the message.
---------------------------------------------------------------------- */
const planButtons = document.querySelectorAll(".plan-select");
const selectedPlanInput = document.getElementById("selectedPlan");

planButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPlanInput.value = btn.dataset.plan || "";
  });
});

/* ----------------------------------------------------------------------
   7. BOOKING FORM VALIDATION
---------------------------------------------------------------------- */
const form = document.getElementById("booking-form");

// Required field ids and their human-readable labels (for messages)
const requiredFields = [
  { id: "fullName", label: "Full Name" },
  { id: "phone", label: "Phone Number" },
  { id: "email", label: "Email Address" },
  { id: "serviceType", label: "Service Type" },
  { id: "propertyType", label: "Property Type" },
  { id: "preferredDate", label: "Preferred Date & Time" },
  { id: "address", label: "Address" },
];

// Simple email regex (covers the vast majority of real addresses)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation: allow digits, spaces, +, -, (), minimum 7 digits total
const PHONE_REGEX = /^[+]?[\d\s().-]{7,}$/;

/**
 * Validates all required fields + email/phone formats.
 * Adds/removes `.invalid` classes and error messages.
 * Returns true if the form is valid, false otherwise.
 */
function validateForm() {
  let isValid = true;

  requiredFields.forEach(({ id, label }) => {
    const field = document.getElementById(id);
    const errorEl = document.querySelector(`[data-error-for="${id}"]`);
    const value = field.value.trim();

    let message = "";

    if (!value) {
      message = `${label} is required.`;
    } else if (id === "email" && !EMAIL_REGEX.test(value)) {
      message = "Please enter a valid email address.";
    } else if (id === "phone" && !PHONE_REGEX.test(value)) {
      message = "Please enter a valid phone number.";
    }

    if (message) {
      field.classList.add("invalid");
      if (errorEl) errorEl.textContent = message;
      isValid = false;
    } else {
      field.classList.remove("invalid");
      if (errorEl) errorEl.textContent = "";
    }
  });

  return isValid;
}

// Live-clear error state as the user types/changes a field
requiredFields.forEach(({ id }) => {
  const field = document.getElementById(id);
  field.addEventListener("input", () => {
    if (field.classList.contains("invalid")) {
      field.classList.remove("invalid");
      const errorEl = document.querySelector(`[data-error-for="${id}"]`);
      if (errorEl) errorEl.textContent = "";
    }
  });
});

/* ----------------------------------------------------------------------
   8. EMAIL / WHATSAPP MESSAGE BUILDERS
   --------------------------------------------------------------------
   Both builders pull the same data from the form and format it with
   clear labels, e.g.:

     Name: John Doe
     Phone: +234...
     Service: Deep Cleaning
     ...
---------------------------------------------------------------------- */

/**
 * Formats a datetime-local input value (YYYY-MM-DDTHH:MM) into a more
 * human-readable string, e.g. "Mon, 15 Jun 2026, 2:30 PM".
 * Falls back to the raw value if parsing fails.
 */
function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Gathers all form field values into a single object.
 */
function getFormData() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    serviceType: document.getElementById("serviceType").value,
    propertyType: document.getElementById("propertyType").value,
    preferredDate: document.getElementById("preferredDate").value,
    address: document.getElementById("address").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    selectedPlan: document.getElementById("selectedPlan").value,
  };
}

/**
 * Builds a clearly-labeled, multi-line summary of the booking request.
 * Used as the body for both the email and the WhatsApp message.
 */
function buildMessageBody(data) {
  const lines = [
    "New Cleaning Service Request",
    "------------------------------",
    `Name: ${data.fullName}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Service Type: ${data.serviceType}`,
    `Property Type: ${data.propertyType}`,
    `Preferred Date & Time: ${formatDateTime(data.preferredDate)}`,
    `Address: ${data.address}`,
  ];

  if (data.selectedPlan) {
    lines.push(`Selected Plan: ${data.selectedPlan}`);
  }

  if (data.notes) {
    lines.push("", "Additional Notes:", data.notes);
  }

  lines.push("", "------------------------------", "Sent from the BestWest Cleaning website");

  return lines.join("\n");
}

/**
 * Opens the user's default email client with a pre-filled subject and body.
 */
function sendViaEmail() {
  if (!validateForm()) {
    showToast("Please fill in all required fields correctly.");
    scrollToFirstInvalid();
    return;
  }

  const data = getFormData();
  const subject = `Cleaning Service Request - ${data.fullName} (${data.serviceType})`;
  const body = buildMessageBody(data);

  const mailtoUrl = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Opening mailto in the same tab is the most reliable way to trigger
  // the user's default mail client across browsers/devices.
  window.location.href = mailtoUrl;

  showToast("Opening your email app...");
}

/**
 * Opens WhatsApp (web or app) with a pre-filled message to the business number.
 */
function sendViaWhatsApp() {
  if (!validateForm()) {
    showToast("Please fill in all required fields correctly.");
    scrollToFirstInvalid();
    return;
  }

  const data = getFormData();
  const message = buildMessageBody(data);

  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener");

  showToast("Opening WhatsApp...");
}

document.getElementById("send-email-btn").addEventListener("click", sendViaEmail);
document.getElementById("send-whatsapp-btn").addEventListener("click", sendViaWhatsApp);

/**
 * Scrolls smoothly to the first invalid field in the booking form.
 */
function scrollToFirstInvalid() {
  const firstInvalid = form.querySelector(".invalid");
  if (firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalid.focus({ preventScroll: true });
  }
}

/* ----------------------------------------------------------------------
   9. TOAST NOTIFICATIONS
---------------------------------------------------------------------- */
const toast = document.getElementById("toast");
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ----------------------------------------------------------------------
   10. FOOTER YEAR
---------------------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();
