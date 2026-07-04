/* ===================================================================
   RYD Travels & Tours — main.js
   Handles: navigation, scroll effects, reveal, and EmailJS contact form
   =================================================================== */

/* -------------------------------------------------------------------
   1. EMAILJS CONFIGURATION  —  ⚠️  EDIT THESE THREE VALUES
   -------------------------------------------------------------------
   Find them in your EmailJS dashboard:
     • PUBLIC KEY  : Account → General → "Public Key"
     • SERVICE ID  : Email Services → your Outlook service  (already set)
     • TEMPLATE ID : Email Templates → "Contact Us" template → the ID
   ------------------------------------------------------------------- */
const EMAILJS_CONFIG = {
  PUBLIC_KEY:  "QH7QrnVHmYpBEEV2M",   // EmailJS Public Key (safe to expose in the browser)
  SERVICE_ID:  "service_aarxapn",     // Outlook service
  TEMPLATE_ID: "template_8grvpvm"     // "Contact Us" template
  // NOTE: do NOT put the EmailJS Private Key here — it must stay secret (server-side only).
};

/* ------------------------------------------------------------------ */
(function () {
  "use strict";

  /* ---- Init EmailJS if the SDK loaded ---- */
  function initEmailJS() {
    if (window.emailjs && EMAILJS_CONFIG.PUBLIC_KEY) {
      try { emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY }); }
      catch (e) { /* older SDK */ try { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); } catch (_) {} }
    }
  }

  /* ---- Mobile nav toggle ---- */
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", links.classList.contains("open"));
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { links.classList.remove("open"); });
      });
    }
    const header = document.querySelector(".site-header");
    const toTop = document.querySelector(".to-top");
    window.addEventListener("scroll", function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > 20);
      if (toTop) toTop.classList.toggle("show", window.scrollY > 500);
    });
    if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---- Hero dissolve-to-dark on scroll ---- */
  function initHeroFade() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var content = hero.querySelector(".hero-grid") || hero.querySelector(".container");
    var fade = document.createElement("div");
    fade.className = "hero-fade";
    hero.appendChild(fade);

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ticking = false;

    function update() {
      ticking = false;
      var h = hero.offsetHeight || 1;
      var p = window.scrollY / (h * 0.85);
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      fade.style.opacity = p;                       // dark solid grows in
      if (content) {
        content.style.opacity = 1 - p;              // hero content dissolves out
        if (!reduce) content.style.transform = "translateY(" + (p * 44) + "px)";
      }
    }
    function onScroll() {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach(function (i) { i.classList.add("in"); });
      return;
    }
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (i) { obs.observe(i); });
  }

  /* ---- Set current year ---- */
  function initYear() {
    document.querySelectorAll(".js-year").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---- Validation helpers ---- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showError(field, msg) {
    const input = field.querySelector("input, textarea");
    const err = field.querySelector(".err");
    if (input) input.classList.add("invalid");
    if (err) { err.textContent = msg; err.classList.add("show"); }
  }
  function clearError(field) {
    const input = field.querySelector("input, textarea");
    const err = field.querySelector(".err");
    if (input) input.classList.remove("invalid");
    if (err) err.classList.remove("show");
  }

  function validate(form) {
    let ok = true;
    const fields = {
      name:  form.querySelector('[data-field="name"]'),
      email: form.querySelector('[data-field="email"]'),
      phone: form.querySelector('[data-field="phone"]'),
      message: form.querySelector('[data-field="message"]')
    };

    // Full name
    const name = fields.name.querySelector("input").value.trim();
    if (name.length < 2) { showError(fields.name, "Please enter your full name."); ok = false; }
    else clearError(fields.name);

    // Email
    const email = fields.email.querySelector("input").value.trim();
    if (!EMAIL_RE.test(email)) { showError(fields.email, "Please enter a valid email address."); ok = false; }
    else clearError(fields.email);

    // Phone (digits only, min 6 after country code)
    const phone = fields.phone.querySelector('input[name="phone"]').value.trim();
    if (!/^[0-9\s\-]{6,15}$/.test(phone)) { showError(fields.phone, "Please enter a valid phone number."); ok = false; }
    else clearError(fields.phone);

    // Message
    const message = fields.message.querySelector("textarea").value.trim();
    if (message.length < 10) { showError(fields.message, "Please enter a message (at least 10 characters)."); ok = false; }
    else clearError(fields.message);

    // Optional tour-booking fields (tourist page only)
    const tourField = form.querySelector('[data-field="tour"]');
    if (tourField) {
      if (!tourField.querySelector("select").value) { showError(tourField, "Please select a tour plan."); ok = false; }
      else clearError(tourField);
    }
    const dateField = form.querySelector('[data-field="date"]');
    if (dateField) {
      if (!dateField.querySelector("input").value) { showError(dateField, "Please choose a preferred date."); ok = false; }
      else clearError(dateField);
    }
    const agesField = form.querySelector('[data-field="childages"]');
    if (agesField && !agesField.hidden) {
      const inputs = agesField.querySelectorAll("input");
      let filled = inputs.length > 0;
      inputs.forEach(function (i) { if (!i.value.trim()) filled = false; });
      if (!filled) { showError(agesField, "Please enter each child's age."); ok = false; }
      else clearError(agesField);
    }

    // Optional vehicle-booking fields (vehicle rental page only)
    const vehicleField = form.querySelector('[data-field="vehicle"]');
    if (vehicleField) {
      if (!vehicleField.querySelector("select").value) { showError(vehicleField, "Please select a vehicle type."); ok = false; }
      else clearError(vehicleField);
    }
    const daysField = form.querySelector('[data-field="rentaldays"]');
    if (daysField) {
      if (!daysField.querySelector("select").value) { showError(daysField, "Please choose how many days."); ok = false; }
      else clearError(daysField);
    }
    const rDateField = form.querySelector('[data-field="rentaldate"]');
    if (rDateField) {
      if (!rDateField.querySelector("input").value) { showError(rDateField, "Please choose a rental date."); ok = false; }
      else clearError(rDateField);
    }

    return ok;
  }

  /* ---- Success popup modal ---- */
  function showSuccessModal(msg) {
    let overlay = document.querySelector(".ryd-modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "ryd-modal-overlay";
      overlay.innerHTML =
        '<div class="ryd-modal" role="dialog" aria-modal="true" aria-labelledby="ryd-modal-title">' +
          '<div class="ryd-modal-check"><svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' +
          '<h3 id="ryd-modal-title">Thank you!</h3>' +
          '<p class="ryd-modal-msg"></p>' +
          '<button type="button" class="btn btn-primary ryd-modal-close">Close</button>' +
        "</div>";
      document.body.appendChild(overlay);
      const close = function () { overlay.classList.remove("show"); };
      overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
      overlay.querySelector(".ryd-modal-close").addEventListener("click", close);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    }
    overlay.querySelector(".ryd-modal-msg").textContent = msg ||
      "Your message has been sent successfully. Our team will reply within a few hours.";
    overlay.classList.add("show");
    const btn = overlay.querySelector(".ryd-modal-close");
    if (btn) setTimeout(function () { btn.focus(); }, 100);
  }

  /* ---- Contact form submit ---- */
  function initForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    const statusBox = form.querySelector(".form-status");
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn ? submitBtn.textContent : "";

    // live clearing
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        const field = el.closest(".field");
        if (field) clearError(field);
        if (statusBox) statusBox.classList.remove("show");
      });
    });

    function status(type, msg) {
      if (!statusBox) return;
      statusBox.className = "form-status show " + type;
      statusBox.textContent = msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) {
        status("bad", "Please correct the highlighted fields before sending.");
        return;
      }

      // Guard: config not filled in
      if (EMAILJS_CONFIG.PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
          EMAILJS_CONFIG.TEMPLATE_ID === "YOUR_TEMPLATE_ID") {
        status("bad", "Email service is not configured yet. Please set your EmailJS keys in js/main.js.");
        return;
      }
      if (!window.emailjs) {
        status("bad", "Email service failed to load. Please check your connection and try again.");
        return;
      }

      const fullName = form.querySelector('[data-field="name"] input').value.trim();
      const email = form.querySelector('[data-field="email"] input').value.trim();
      const code = form.querySelector('[data-field="phone"] input[name="country_code"]').value;
      const phone = form.querySelector('[data-field="phone"] input[name="phone"]').value.trim();
      const userMessage = form.querySelector('[data-field="message"] textarea').value.trim();
      const service = form.getAttribute("data-service") || "General Enquiry";
      const fullPhone = code + " " + phone;
      const time = new Date().toLocaleString();

      // Template variables (individual fields, also folded into the message below)
      const params = {
        name: fullName,
        from_name: fullName,
        from_email: email,
        reply_to: email,
        phone: fullPhone,
        service: service,
        time: time
      };

      // Build a clean, labelled details block for the email body
      const lines = [];
      lines.push("CUSTOMER MESSAGE");
      lines.push(userMessage || "(no message provided)");
      lines.push("");
      lines.push("----------------------------------------");
      lines.push("ENQUIRY DETAILS");
      lines.push("Enquiry from: " + service);
      lines.push("Full name: " + fullName);
      lines.push("Email: " + email);
      lines.push("Phone: " + fullPhone);

      // Tour-booking details (tourist page only)
      const tourField = form.querySelector('[data-field="tour"]');
      if (tourField) {
        const tour = tourField.querySelector("select").value;
        const tourDate = form.querySelector('[name="tour_date"]').value;
        const adults = form.querySelector('[name="adults"]').value;
        const childrenSel = form.querySelector('[name="children"]');
        const children = childrenSel ? childrenSel.value : "0";
        const ages = [];
        form.querySelectorAll(".child-ages-list input").forEach(function (i) {
          if (i.value.trim()) ages.push(i.value.trim());
        });
        params.tour_plan = tour;
        params.tour_date = tourDate;
        params.adults = adults;
        params.children = children;
        params.child_ages = ages.join(", ");
        lines.push("Tour plan: " + tour);
        lines.push("Preferred date: " + tourDate);
        lines.push("Adults: " + adults);
        lines.push("Children: " + children + (ages.length ? " (ages: " + ages.join(", ") + ")" : ""));
      }

      // Vehicle-booking details (vehicle rental page only)
      const vehicleField = form.querySelector('[data-field="vehicle"]');
      if (vehicleField) {
        const vType = vehicleField.querySelector("select").value;
        const seatsEl = form.querySelector('[data-seatfield]');
        const seats = seatsEl ? seatsEl.value : "";
        const rDays = (form.querySelector('[name="rental_days"]') || {}).value || "";
        const rDate = (form.querySelector('[name="rental_date"]') || {}).value || "";
        params.vehicle_type = vType;
        params.seats = seats;
        params.rental_days = rDays;
        params.rental_date = rDate;
        lines.push("Vehicle type: " + vType);
        lines.push("Seat count: " + seats);
        lines.push("Rental duration: " + rDays);
        lines.push("Rental date: " + rDate);
      }

      lines.push("Submitted: " + time);
      params.message = lines.join("\n");

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      status("ok", "Sending your message…");

      emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, params)
        .then(function () {
          showSuccessModal("Your message has been sent successfully. Our team will get back to you within a few hours.");
          status("ok", "✅ Thank you! Your message has been sent — we'll reply within a few hours.");
          form.reset();
          const seatEl = form.querySelector("[data-seatfield]");
          if (seatEl) seatEl.value = "";
        })
        .catch(function (err) {
          console.error("EmailJS error:", err);
          status("bad", "❌ Sorry, something went wrong. Please email us directly at hello@rydtravels.com.");
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = btnText; }
        });
    });
  }

  /* ---- Searchable country-code selector ----
     Data: [name, ISO2, dialCode]. Flag emoji derived from the ISO code. */
  var COUNTRIES = [
    ["Afghanistan","AF","+93"],["Albania","AL","+355"],["Algeria","DZ","+213"],["Andorra","AD","+376"],
    ["Angola","AO","+244"],["Antigua & Barbuda","AG","+1268"],["Argentina","AR","+54"],["Armenia","AM","+374"],
    ["Australia","AU","+61"],["Austria","AT","+43"],["Azerbaijan","AZ","+994"],["Bahamas","BS","+1242"],
    ["Bahrain","BH","+973"],["Bangladesh","BD","+880"],["Barbados","BB","+1246"],["Belarus","BY","+375"],
    ["Belgium","BE","+32"],["Belize","BZ","+501"],["Benin","BJ","+229"],["Bhutan","BT","+975"],
    ["Bolivia","BO","+591"],["Bosnia & Herzegovina","BA","+387"],["Botswana","BW","+267"],["Brazil","BR","+55"],
    ["Brunei","BN","+673"],["Bulgaria","BG","+359"],["Burkina Faso","BF","+226"],["Burundi","BI","+257"],
    ["Cambodia","KH","+855"],["Cameroon","CM","+237"],["Canada","CA","+1"],["Cape Verde","CV","+238"],
    ["Central African Republic","CF","+236"],["Chad","TD","+235"],["Chile","CL","+56"],["China","CN","+86"],
    ["Colombia","CO","+57"],["Comoros","KM","+269"],["Congo","CG","+242"],["Congo (DRC)","CD","+243"],
    ["Costa Rica","CR","+506"],["Côte d'Ivoire","CI","+225"],["Croatia","HR","+385"],["Cuba","CU","+53"],
    ["Cyprus","CY","+357"],["Czechia","CZ","+420"],["Denmark","DK","+45"],["Djibouti","DJ","+253"],
    ["Dominica","DM","+1767"],["Dominican Republic","DO","+1809"],["Ecuador","EC","+593"],["Egypt","EG","+20"],
    ["El Salvador","SV","+503"],["Equatorial Guinea","GQ","+240"],["Eritrea","ER","+291"],["Estonia","EE","+372"],
    ["Eswatini","SZ","+268"],["Ethiopia","ET","+251"],["Fiji","FJ","+679"],["Finland","FI","+358"],
    ["France","FR","+33"],["Gabon","GA","+241"],["Gambia","GM","+220"],["Georgia","GE","+995"],
    ["Germany","DE","+49"],["Ghana","GH","+233"],["Greece","GR","+30"],["Grenada","GD","+1473"],
    ["Guatemala","GT","+502"],["Guinea","GN","+224"],["Guinea-Bissau","GW","+245"],["Guyana","GY","+592"],
    ["Haiti","HT","+509"],["Honduras","HN","+504"],["Hong Kong","HK","+852"],["Hungary","HU","+36"],
    ["Iceland","IS","+354"],["India","IN","+91"],["Indonesia","ID","+62"],["Iran","IR","+98"],
    ["Iraq","IQ","+964"],["Ireland","IE","+353"],["Israel","IL","+972"],["Italy","IT","+39"],
    ["Jamaica","JM","+1876"],["Japan","JP","+81"],["Jordan","JO","+962"],["Kazakhstan","KZ","+7"],
    ["Kenya","KE","+254"],["Kiribati","KI","+686"],["Kuwait","KW","+965"],["Kyrgyzstan","KG","+996"],
    ["Laos","LA","+856"],["Latvia","LV","+371"],["Lebanon","LB","+961"],["Lesotho","LS","+266"],
    ["Liberia","LR","+231"],["Libya","LY","+218"],["Liechtenstein","LI","+423"],["Lithuania","LT","+370"],
    ["Luxembourg","LU","+352"],["Macau","MO","+853"],["Madagascar","MG","+261"],["Malawi","MW","+265"],
    ["Malaysia","MY","+60"],["Maldives","MV","+960"],["Mali","ML","+223"],["Malta","MT","+356"],
    ["Marshall Islands","MH","+692"],["Mauritania","MR","+222"],["Mauritius","MU","+230"],["Mexico","MX","+52"],
    ["Micronesia","FM","+691"],["Moldova","MD","+373"],["Monaco","MC","+377"],["Mongolia","MN","+976"],
    ["Montenegro","ME","+382"],["Morocco","MA","+212"],["Mozambique","MZ","+258"],["Myanmar","MM","+95"],
    ["Namibia","NA","+264"],["Nauru","NR","+674"],["Nepal","NP","+977"],["Netherlands","NL","+31"],
    ["New Zealand","NZ","+64"],["Nicaragua","NI","+505"],["Niger","NE","+227"],["Nigeria","NG","+234"],
    ["North Korea","KP","+850"],["North Macedonia","MK","+389"],["Norway","NO","+47"],["Oman","OM","+968"],
    ["Pakistan","PK","+92"],["Palau","PW","+680"],["Palestine","PS","+970"],["Panama","PA","+507"],
    ["Papua New Guinea","PG","+675"],["Paraguay","PY","+595"],["Peru","PE","+51"],["Philippines","PH","+63"],
    ["Poland","PL","+48"],["Portugal","PT","+351"],["Qatar","QA","+974"],["Romania","RO","+40"],
    ["Russia","RU","+7"],["Rwanda","RW","+250"],["Saint Kitts & Nevis","KN","+1869"],["Saint Lucia","LC","+1758"],
    ["Samoa","WS","+685"],["San Marino","SM","+378"],["São Tomé & Príncipe","ST","+239"],["Saudi Arabia","SA","+966"],
    ["Senegal","SN","+221"],["Serbia","RS","+381"],["Seychelles","SC","+248"],["Sierra Leone","SL","+232"],
    ["Singapore","SG","+65"],["Slovakia","SK","+421"],["Slovenia","SI","+386"],["Solomon Islands","SB","+677"],
    ["Somalia","SO","+252"],["South Africa","ZA","+27"],["South Korea","KR","+82"],["South Sudan","SS","+211"],
    ["Spain","ES","+34"],["Sri Lanka","LK","+94"],["Sudan","SD","+249"],["Suriname","SR","+597"],
    ["Sweden","SE","+46"],["Switzerland","CH","+41"],["Syria","SY","+963"],["Taiwan","TW","+886"],
    ["Tajikistan","TJ","+992"],["Tanzania","TZ","+255"],["Thailand","TH","+66"],["Timor-Leste","TL","+670"],
    ["Togo","TG","+228"],["Tonga","TO","+676"],["Trinidad & Tobago","TT","+1868"],["Tunisia","TN","+216"],
    ["Turkey","TR","+90"],["Turkmenistan","TM","+993"],["Tuvalu","TV","+688"],["Uganda","UG","+256"],
    ["Ukraine","UA","+380"],["United Arab Emirates","AE","+971"],["United Kingdom","GB","+44"],["United States","US","+1"],
    ["Uruguay","UY","+598"],["Uzbekistan","UZ","+998"],["Vanuatu","VU","+678"],["Vatican City","VA","+379"],
    ["Venezuela","VE","+58"],["Vietnam","VN","+84"],["Yemen","YE","+967"],["Zambia","ZM","+260"],["Zimbabwe","ZW","+263"]
  ];

  function isoToFlag(iso) {
    return iso.toUpperCase().replace(/./g, function (c) {
      return String.fromCodePoint(127397 + c.charCodeAt(0));
    });
  }

  function initCountrySelect() {
    var widgets = document.querySelectorAll(".country-select[data-country]");
    if (!widgets.length) return;

    widgets.forEach(function (w) {
      var btn = w.querySelector(".country-btn");
      var panel = w.querySelector(".country-panel");
      var search = w.querySelector(".country-search");
      var list = w.querySelector(".country-list");
      var hidden = w.querySelector('input[name="country_code"]');
      var flagEl = w.querySelector(".cs-flag");
      var codeEl = w.querySelector(".cs-code");

      // Build list once
      COUNTRIES.forEach(function (c, i) {
        var li = document.createElement("li");
        li.className = "country-item";
        li.setAttribute("role", "option");
        li.dataset.dial = c[2];
        li.dataset.search = (c[0] + " " + c[2] + " " + c[1]).toLowerCase();
        li.innerHTML = '<span class="ci-flag">' + isoToFlag(c[1]) + '</span>' +
                       '<span class="ci-name">' + c[0] + '</span>' +
                       '<span class="ci-dial">' + c[2] + '</span>';
        li.addEventListener("click", function () {
          hidden.value = c[2];
          flagEl.textContent = isoToFlag(c[1]);
          codeEl.textContent = c[2];
          close();
        });
        list.appendChild(li);
      });

      function open() {
        panel.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        search.value = "";
        filter("");
        setTimeout(function () { search.focus(); }, 30);
      }
      function close() {
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
      function filter(q) {
        q = q.trim().toLowerCase();
        list.querySelectorAll(".country-item").forEach(function (li) {
          li.style.display = (!q || li.dataset.search.indexOf(q) !== -1) ? "" : "none";
        });
      }

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (panel.hidden) open(); else close();
      });
      search.addEventListener("input", function () { filter(search.value); });
      search.addEventListener("click", function (e) { e.stopPropagation(); });
      panel.addEventListener("click", function (e) { e.stopPropagation(); });
      document.addEventListener("click", function () { if (!panel.hidden) close(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
    });
  }

  /* ---- Tour cards → pre-fill the enquiry tour select ---- */
  function initTourCards() {
    const cards = document.querySelectorAll(".tour-card[data-tour]");
    const select = document.querySelector('.contact-form [name="tour_plan"]');
    if (!cards.length || !select) return;
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        const val = card.getAttribute("data-tour");
        let matched = false;
        Array.prototype.forEach.call(select.options, function (o) {
          if (o.value === val || o.text === val) { select.value = o.value; matched = true; }
        });
        if (!matched) select.value = "Custom / Not sure yet";
        const f = select.closest(".field"); if (f) clearError(f);
      });
    });
  }

  /* ---- Vehicle type → auto-fill seat count ---- */
  function initVehicleSeats() {
    const sel = document.querySelector('select[data-seatselect]');
    const seatField = document.querySelector('[data-seatfield]');
    if (!sel || !seatField) return;
    function sync() {
      const opt = sel.options[sel.selectedIndex];
      const s = opt ? opt.getAttribute("data-seat") : "";
      seatField.value = s ? s + " seats" : "";
    }
    sel.addEventListener("change", sync);
    sync();
  }

  /* ---- Fleet cards → pre-select vehicle in the enquiry form ---- */
  function initVehicleCards() {
    const sel = document.querySelector('select[data-seatselect]');
    if (!sel) return;
    document.querySelectorAll("[data-vehicle]").forEach(function (card) {
      card.addEventListener("click", function () {
        const v = card.getAttribute("data-vehicle");
        sel.value = v;
        sel.dispatchEvent(new Event("change"));
      });
    });
  }

  /* ---- Gallery marquee: duplicate tiles for a seamless loop ---- */
  function initGalleryMarquee() {
    const track = document.querySelector(".gallery-track");
    if (!track) return;
    const items = Array.prototype.slice.call(track.children);
    items.forEach(function (node) {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  /* ---- Tour carousel (prev / next) ---- */
  function initTourCarousel() {
    const track = document.querySelector(".tour-track");
    if (!track) return;
    const prev = document.querySelector(".tc-prev");
    const next = document.querySelector(".tc-next");

    function pageSize() {
      const card = track.querySelector(".tour-card");
      const w = card ? card.getBoundingClientRect().width + 24 : track.clientWidth;
      const visible = Math.max(1, Math.round(track.clientWidth / w));
      return w * visible;
    }
    function update() {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: pageSize(), behavior: "smooth" }); });
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -pageSize(), behavior: "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    setTimeout(update, 300);
  }

  /* ---- Dynamic children age inputs ---- */
  function initTourExtras() {
    const form = document.querySelector(".contact-form");
    if (!form) return;
    const childrenSel = form.querySelector('[name="children"]');
    const wrap = form.querySelector(".child-ages");
    const listEl = form.querySelector(".child-ages-list");
    if (!childrenSel || !wrap || !listEl) return;
    childrenSel.addEventListener("change", function () {
      const n = parseInt(childrenSel.value, 10) || 0;
      listEl.innerHTML = "";
      for (let i = 1; i <= n; i++) {
        const inp = document.createElement("input");
        inp.type = "number"; inp.min = "0"; inp.max = "17";
        inp.placeholder = "Child " + i + " age";
        inp.setAttribute("aria-label", "Child " + i + " age");
        listEl.appendChild(inp);
      }
      wrap.hidden = n === 0;
    });
  }

  /* ---- Customer reviews (stars + localStorage + optional email) ---- */
  function initReviews() {
    const list = document.getElementById("reviewsList");
    const summary = document.getElementById("reviewsSummary");
    const form = document.getElementById("reviewForm");
    const starWrap = document.getElementById("starInput");
    if (!list || !form || !starWrap) return;

    const KEY = "ryd_reviews";
    const STAR = '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
    const seed = [
      { name: "Sarah M.", rating: 5, text: "Absolutely wonderful trip! Our guide knew every hidden gem — Sigiriya and Ella were unforgettable.", date: "2026-05-18" },
      { name: "David & Anna", rating: 5, text: "Comfortable van, friendly driver and a perfectly planned itinerary. Highly recommend RYD Travels.", date: "2026-04-02" },
      { name: "Rahul K.", rating: 4, text: "Great value and a very responsive team. The safari was the highlight of our week in Sri Lanka.", date: "2026-03-11" }
    ];

    function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
    function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
    let reviews = load();
    if (!reviews || !reviews.length) { reviews = seed.slice(); save(reviews); }

    function starsHtml(n) { let s = ""; for (let i = 1; i <= 5; i++) s += STAR.replace("<svg", '<svg class="' + (i <= n ? "" : "empty") + '"'); return s; }
    function initials(name) { return name.trim().split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); }
    function esc(t) { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
    function fmt(d) { try { return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch (e) { return d; } }

    function render() {
      list.innerHTML = reviews.map(function (r) {
        return '<div class="review-card"><div class="rc-top"><div class="rc-avatar">' + initials(r.name) +
          '</div><div><div class="rc-name">' + esc(r.name) + '</div><div class="rc-date">' + fmt(r.date) +
          '</div></div></div><div class="rc-stars">' + starsHtml(r.rating) + '</div><p>' + esc(r.text) + '</p></div>';
      }).join("");
      const avg = reviews.length ? reviews.reduce(function (a, r) { return a + r.rating; }, 0) / reviews.length : 0;
      summary.innerHTML = '<span class="rs-avg">' + avg.toFixed(1) + '</span><span class="rs-stars">' +
        starsHtml(Math.round(avg)) + '</span><span class="rs-count">' + reviews.length +
        " review" + (reviews.length !== 1 ? "s" : "") + "</span>";
    }

    // Build interactive star input
    let selected = 0;
    const starEls = [];
    for (let i = 1; i <= 5; i++) {
      const tmp = document.createElement("div"); tmp.innerHTML = STAR;
      const svg = tmp.firstChild; svg.dataset.v = i;
      starWrap.appendChild(svg); starEls.push(svg);
    }
    const ratingInput = form.querySelector('[name="rv_rating"]');
    function paint(n) { starEls.forEach(function (s, idx) { s.classList.toggle("on", idx < n); }); }
    starEls.forEach(function (s) {
      s.addEventListener("mouseenter", function () { paint(parseInt(s.dataset.v, 10)); });
      s.addEventListener("click", function () { selected = parseInt(s.dataset.v, 10); ratingInput.value = selected; paint(selected); });
    });
    starWrap.addEventListener("mouseleave", function () { paint(selected); });

    render();

    const statusBox = form.querySelector(".form-status");
    function rstatus(type, msg) { if (statusBox) { statusBox.className = "form-status show " + type; statusBox.textContent = msg; } }

    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () { const f = el.closest(".field"); if (f) clearError(f); if (statusBox) statusBox.classList.remove("show"); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const fn = form.querySelector('[data-field="rvname"]'), fr = form.querySelector('[data-field="rvrating"]'), ft = form.querySelector('[data-field="rvtext"]');
      const name = fn.querySelector("input").value.trim();
      const text = ft.querySelector("textarea").value.trim();
      let ok = true;
      if (name.length < 2) { showError(fn, "Please enter your name."); ok = false; } else clearError(fn);
      if (selected < 1) { showError(fr, "Please select a star rating."); ok = false; } else clearError(fr);
      if (text.length < 5) { showError(ft, "Please write your review."); ok = false; } else clearError(ft);
      if (!ok) { rstatus("bad", "Please complete the highlighted fields."); return; }

      reviews.unshift({ name: name, rating: selected, text: text, date: new Date().toISOString() });
      save(reviews);
      render();

      // Notify the company by email too (best-effort)
      if (window.emailjs && EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_PUBLIC_KEY" && EMAILJS_CONFIG.TEMPLATE_ID !== "YOUR_TEMPLATE_ID") {
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
          name: name, from_name: name, from_email: "hello@rydtravels.com", reply_to: "hello@rydtravels.com",
          service: "Customer Review", time: new Date().toLocaleString(),
          message: "New " + selected + "-star review from " + name + ":\n\n" + text
        }).catch(function (err) { console.error("Review email error:", err); });
      }

      form.reset(); selected = 0; ratingInput.value = "0"; paint(0);
      rstatus("ok", "✅ Thank you! Your review has been posted.");
    });
  }

  /* ---- Boot ---- */
  document.addEventListener("DOMContentLoaded", function () {
    initEmailJS();
    initNav();
    initHeroFade();
    initReveal();
    initYear();
    initCountrySelect();
    initForm();
    initGalleryMarquee();
    initVehicleSeats();
    initVehicleCards();
    initTourCards();
    initTourCarousel();
    initTourExtras();
    initReviews();
  });
})();
