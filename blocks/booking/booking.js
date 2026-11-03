import { decorateIcons } from '../../scripts/aem.js';

/*
 * Booking: four-step appointment request (visit, time, details, review) with a live
 * summary card. Authored content: row 1 image (summary column), row 2 intro text
 * (eyebrow, H1, copy). Hospitals, visit types and openings live below; openings are
 * sample availability generated per hospital and day, and nothing is sent anywhere.
 */

const LOCATIONS = [
  {
    id: 'riverside',
    area: 'Downtown',
    name: 'Riverside',
    address: '1200 River Walk Ave, Suite 100, Riverside',
    phone: '(555) 010-1001',
    tel: '+15550101001',
    // opening hours by weekday, Sunday first: [open, close] in hours, null when closed
    hours: [[7, 21], [7, 21], [7, 21], [7, 21], [7, 21], [7, 21], [7, 21]],
  },
  {
    id: 'old-town',
    area: 'Downtown',
    name: 'Old Town',
    address: '48 Market Street, Old Town',
    phone: '(555) 010-1002',
    tel: '+15550101002',
    hours: [null, [8, 19], [8, 19], [8, 19], [8, 19], [8, 19], [9, 15]],
  },
  {
    id: 'lakeview',
    area: 'North Shore',
    name: 'Lakeview',
    address: '730 Lakeshore Drive, Lakeview',
    phone: '(555) 010-1003',
    tel: '+15550101003',
    hours: [null, [8, 20], [8, 20], [8, 20], [8, 20], [8, 20], [8, 20]],
  },
  {
    id: 'northgate',
    area: 'North Shore',
    name: 'Northgate',
    address: '2215 Northgate Parkway, Northgate',
    phone: '(555) 010-1004',
    tel: '+15550101004',
    hours: [null, [8, 19], [8, 19], [8, 19], [8, 19], [8, 19], null],
  },
];

const VISITS = [
  {
    id: 'wellness', name: 'Wellness exam', text: 'Routine care and checkups', icon: 'stethoscope',
  },
  {
    id: 'new-pet', name: 'New pet visit', text: 'A first hello and a healthy start', icon: 'paw',
  },
  {
    id: 'sick', name: 'Sick visit', text: 'Something doesn\'t feel quite right', icon: 'heart',
  },
  {
    id: 'follow-up', name: 'Follow-up', text: 'A return visit with our team', icon: 'calendar',
  },
];

const STEPS = ['Your visit', 'Choose a time', 'Your details', 'Review'];
const DAYS_SHOWN = 5;
const SLOTS_PER_DAY = 5;
const URGENT_LINE = '(555) 010-0911';

let instance = 0;

const fmtWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const fmtLongWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const fmtMonth = new Intl.DateTimeFormat('en-US', { month: 'short' });

/** Small seeded generator (Park–Miller) so a day's openings stay the same between visits. */
function seededRandom(seedText) {
  const MOD = 2147483647;
  let seed = [...seedText].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % MOD, 7) || 1;
  return () => {
    seed = (seed * 16807) % MOD;
    return seed / MOD;
  };
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** Sample openings for one hospital and day: a stable pick of quarter-hour slots. */
function slotsFor(location, date, now) {
  const hours = location.hours[date.getDay()];
  if (!hours) return [];
  const [open, close] = hours;
  const candidates = [];
  for (let t = open * 60 + 30; t <= close * 60 - 60; t += 15) candidates.push(t);
  const random = seededRandom(`${location.id}-${date.toDateString()}`);
  const picked = candidates
    .map((t) => ({ t, r: random() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, SLOTS_PER_DAY)
    .map(({ t }) => t)
    .sort((a, b) => a - b);
  const isToday = date.toDateString() === now.toDateString();
  const earliest = now.getHours() * 60 + now.getMinutes() + 60;
  return picked.filter((t) => !isToday || t >= earliest).map(formatTime);
}

function upcomingDays(location) {
  const now = new Date();
  const days = [];
  for (let offset = 0; offset < 21 && days.length < DAYS_SHOWN; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const slots = slotsFor(location, date, now);
    if (slots.length) days.push({ date, slots, isToday: offset === 0 });
  }
  return days;
}

function dayLabel(day) {
  return `${fmtWeekday.format(day.date)}, ${fmtMonth.format(day.date)} ${day.date.getDate()}`;
}

function icon(name) {
  return `<span class="icon icon-${name}"></span>`;
}

function buildMarkup(id) {
  const visitOptions = VISITS.map((v, i) => `
    <button class="booking-option" type="button" data-visit="${v.id}" aria-pressed="${i === 0}">
      <span class="booking-option-icon">${icon(v.icon)}</span>
      <span class="booking-option-text"><strong>${v.name}</strong><small>${v.text}</small></span>
      <span class="booking-option-check" aria-hidden="true"></span>
    </button>`).join('');
  const locationOptions = LOCATIONS.map((l) => `<option value="${l.id}">${l.name} · ${l.area}</option>`).join('');
  const stepper = STEPS.map((label, i) => `
    <li class="booking-stepper-item" data-step-indicator="${i + 1}">
      <span class="booking-stepper-number">${String(i + 1).padStart(2, '0')}</span>
      <span class="booking-stepper-label">${label}</span>
    </li>`).join('');

  return `
  <div class="booking-main">
    <div class="booking-intro"></div>
    <nav class="booking-stepper" aria-label="Booking progress">
      <ol>${stepper}</ol>
      <div class="booking-stepper-track" aria-hidden="true"><span></span></div>
    </nav>
    <div class="booking-steps" aria-live="polite">
      <section class="booking-panel" data-step="1" aria-labelledby="${id}-h1">
        <div class="booking-step-heading">
          <p class="booking-kicker">Step 01 <span>—</span> About your visit</p>
          <h2 id="${id}-h1" tabindex="-1">What can we help with?</h2>
          <p>Choose the closest fit. You can share more with your care team later.</p>
        </div>
        <fieldset class="booking-fieldset">
          <legend class="booking-label">What brings you in?</legend>
          <div class="booking-options">${visitOptions}</div>
        </fieldset>
        <div class="booking-row">
          <fieldset class="booking-fieldset">
            <legend class="booking-label">Have you visited us before?</legend>
            <div class="booking-segments">
              <button class="booking-segment" type="button" data-patient="new" aria-pressed="true">I'm new here</button>
              <button class="booking-segment" type="button" data-patient="returning" aria-pressed="false">I've been before</button>
            </div>
          </fieldset>
          <label class="booking-label" for="${id}-location">Choose a hospital
            <span class="booking-select"><select id="${id}-location" name="location">${locationOptions}</select></span>
          </label>
        </div>
        <p class="booking-note">${icon('emergency')}<span>If your pet needs urgent care, call us or walk in to Riverside urgent care. After hours, call our 24/7 partner hospital at <a href="tel:+15550100911">${URGENT_LINE}</a>.</span></p>
        <div class="booking-actions booking-actions-end">
          <button class="booking-next" type="button" data-action="next">Find a time <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section class="booking-panel" data-step="2" aria-labelledby="${id}-h2" hidden>
        <div class="booking-step-heading">
          <p class="booking-kicker">Step 02 <span>—</span> Your appointment</p>
          <h2 id="${id}-h2" tabindex="-1">Pick a time that works.</h2>
          <p>These are the next openings at <strong data-bind="location-name"></strong>.</p>
        </div>
        <div class="booking-dates-top">
          <span class="booking-label">Available days</span>
          <span class="booking-hint">Times are local to the hospital</span>
        </div>
        <div class="booking-dates" role="group" aria-label="Choose an appointment day"></div>
        <div class="booking-slots-top">
          <h3 id="${id}-slots"></h3>
          <span class="booking-hint" data-bind="slot-count"></span>
        </div>
        <div class="booking-slots" role="group" aria-labelledby="${id}-slots"></div>
        <p class="booking-error" data-error="slot" role="alert" hidden>Please choose an appointment time to continue.</p>
        <div class="booking-actions">
          <button class="booking-back" type="button" data-action="back"><span aria-hidden="true">←</span> Back</button>
          <button class="booking-next" type="button" data-action="next">Continue <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section class="booking-panel" data-step="3" aria-labelledby="${id}-h3" hidden>
        <div class="booking-step-heading">
          <p class="booking-kicker">Step 03 <span>—</span> A few details</p>
          <h2 id="${id}-h3" tabindex="-1">Who are we welcoming?</h2>
          <p>Just the basics. No medical history needed here.</p>
        </div>
        <form class="booking-form" novalidate>
          <fieldset class="booking-fieldset">
            <legend class="booking-label">Your pet</legend>
            <div class="booking-row">
              <label class="booking-label" for="${id}-pet-name">Pet's name
                <input id="${id}-pet-name" name="petName" autocomplete="off" placeholder="e.g. Charlie" required>
              </label>
              <label class="booking-label" for="${id}-pet-type">Pet type
                <span class="booking-select"><select id="${id}-pet-type" name="petType"><option>Dog</option><option>Cat</option><option>Other</option></select></span>
              </label>
            </div>
          </fieldset>
          <fieldset class="booking-fieldset">
            <legend class="booking-label">Your contact details</legend>
            <div class="booking-row">
              <label class="booking-label" for="${id}-owner-name">Your name
                <input id="${id}-owner-name" name="ownerName" autocomplete="name" placeholder="First and last name" required>
              </label>
              <label class="booking-label" for="${id}-email">Email address
                <input id="${id}-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
              </label>
            </div>
          </fieldset>
          <p class="booking-privacy">${icon('shield')}<span>This booking form is a demo. Your details stay in this browser and are never sent or saved.</span></p>
          <p class="booking-error" data-error="details" role="alert" hidden>Please complete the highlighted fields with a valid email address.</p>
          <div class="booking-actions">
            <button class="booking-back" type="button" data-action="back"><span aria-hidden="true">←</span> Back</button>
            <button class="booking-next" type="button" data-action="next">Review booking <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>

      <section class="booking-panel" data-step="4" aria-labelledby="${id}-h4" hidden>
        <div class="booking-step-heading">
          <p class="booking-kicker">Step 04 <span>—</span> Almost there</p>
          <h2 id="${id}-h4" tabindex="-1">Everything look right?</h2>
          <p>Take a quick look. You can go back and change anything.</p>
        </div>
        <div class="booking-review">
          <div class="booking-review-top">
            <span class="booking-review-icon">${icon('calendar')}</span>
            <div><span class="booking-kicker">Your appointment</span><strong data-bind="service"></strong></div>
            <button class="booking-link" type="button" data-action="edit">Edit</button>
          </div>
          <dl>
            <div><dt>When</dt><dd data-bind="when"></dd></div>
            <div><dt>Where</dt><dd data-bind="where"></dd></div>
            <div><dt>For</dt><dd data-bind="for"></dd></div>
            <div><dt>Contact</dt><dd data-bind="contact"></dd></div>
          </dl>
        </div>
        <p class="booking-disclaimer">This demo does not reserve a real appointment. A live version would confirm the time with the hospital's scheduling system.</p>
        <div class="booking-actions">
          <button class="booking-back" type="button" data-action="back"><span aria-hidden="true">←</span> Back</button>
          <button class="booking-next" type="button" data-action="confirm">Confirm booking <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section class="booking-success" aria-labelledby="${id}-done" hidden>
        <span class="booking-success-icon" aria-hidden="true">✓</span>
        <p class="booking-kicker">Booking request complete</p>
        <h2 id="${id}-done" tabindex="-1">A good visit is on the calendar.</h2>
        <p>This is a demo confirmation only. No appointment was created and no information was sent.</p>
        <div class="booking-success-summary">
          <strong data-bind="success-pet"></strong>
          <span data-bind="when"></span>
          <span data-bind="where"></span>
        </div>
        <button class="booking-back" type="button" data-action="restart"><span aria-hidden="true">↻</span> Book another visit</button>
      </section>
    </div>
  </div>

  <aside class="booking-aside" aria-label="Booking summary">
    <div class="booking-media"></div>
    <div class="booking-summary">
      <div class="booking-summary-head">
        <span class="booking-kicker">Your visit</span>
        <span class="booking-badge"><span></span> About 2 min</span>
      </div>
      <p class="booking-summary-service" data-bind="service"></p>
      <div class="booking-summary-detail">${icon('location')}<span><small>Hospital</small><strong data-bind="location-name"></strong><span data-bind="location-address"></span></span></div>
      <div class="booking-summary-detail">${icon('clock')}<span><small>Date &amp; time</small><strong data-bind="summary-time"></strong></span></div>
      <div class="booking-summary-detail">${icon('paw')}<span><small>For</small><strong data-bind="summary-pet"></strong></span></div>
      <p class="booking-summary-note" data-bind="summary-note"></p>
    </div>
    <div class="booking-help">
      ${icon('phone')}
      <p>Need help booking? Call <span data-bind="location-name"></span> at <a data-bind="location-phone" href="#"></a> and a real person will help.</p>
    </div>
  </aside>`;
}

export default function decorate(block) {
  instance += 1;
  const id = `booking-${instance}`;
  const [imageRow, textRow] = [...block.children];
  const imageCell = imageRow?.firstElementChild;
  const textCell = textRow?.firstElementChild;

  block.innerHTML = '';
  const shell = document.createElement('div');
  shell.className = 'booking-shell';
  shell.innerHTML = buildMarkup(id);
  block.append(shell);

  // keep the authored cells (and their Universal Editor instrumentation)
  if (textCell) shell.querySelector('.booking-intro').append(textCell);
  if (imageCell?.querySelector('picture, img')) shell.querySelector('.booking-media').append(imageCell);
  else shell.querySelector('.booking-media').remove();

  const params = new URLSearchParams(window.location.search);
  const state = {
    step: 1,
    visit: VISITS.find((v) => v.id === params.get('visit')) || VISITS[0],
    patient: 'new',
    location: LOCATIONS.find((l) => l.id === params.get('location')) || LOCATIONS[0],
    days: [],
    dayIndex: 0,
    slot: '',
    petName: '',
    petType: 'Dog',
    ownerName: '',
    email: '',
  };

  const $ = (selector) => shell.querySelector(selector);
  const $$ = (selector) => [...shell.querySelectorAll(selector)];
  const panels = $$('.booking-panel');
  const form = $('.booking-form');
  const locationSelect = $(`#${id}-location`);
  locationSelect.value = state.location.id;

  const bind = (name, value) => $$(`[data-bind="${name}"]`).forEach((el) => { el.textContent = value; });
  const selectedDay = () => state.days[state.dayIndex];
  const whenText = () => (state.slot ? `${dayLabel(selectedDay())} at ${state.slot}` : '');

  function setPressed(selector, isSelected) {
    $$(selector).forEach((button) => {
      const selected = isSelected(button);
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function syncSummary() {
    const loc = state.location;
    bind('service', state.visit.name);
    bind('location-name', loc.name);
    bind('location-address', loc.address);
    $$('[data-bind="location-phone"]').forEach((a) => {
      a.textContent = loc.phone;
      a.href = `tel:${loc.tel}`;
    });
    bind('summary-time', state.slot ? `${dayLabel(selectedDay())} · ${state.slot}` : 'Choose a time next');
    bind('summary-pet', state.petName || 'Your pet');
    bind('summary-note', state.patient === 'new'
      ? 'New clients receive a complimentary first wellness exam at any of our hospitals.'
      : 'Welcome back. Your records are shared across all four hospitals.');
  }

  function renderSlots() {
    const day = selectedDay();
    $(`#${id}-slots`).textContent = `${day.isToday ? 'Today' : fmtLongWeekday.format(day.date)} · ${fmtMonth.format(day.date)} ${day.date.getDate()}`;
    bind('slot-count', `${day.slots.length} ${day.slots.length === 1 ? 'opening' : 'openings'}`);
    $('.booking-slots').replaceChildren(...day.slots.map((slot) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-slot';
      button.dataset.slot = slot;
      button.textContent = slot;
      return button;
    }));
    setPressed('.booking-slot', (b) => b.dataset.slot === state.slot);
  }

  function renderDates() {
    const dates = $('.booking-dates');
    dates.replaceChildren(...state.days.map((day, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-date';
      button.dataset.dayIndex = String(index);
      button.innerHTML = `<span>${day.isToday ? 'Today' : fmtWeekday.format(day.date)}</span><strong>${day.date.getDate()}</strong><span>${fmtMonth.format(day.date)}</span>`;
      return button;
    }));
    setPressed('.booking-date', (b) => Number(b.dataset.dayIndex) === state.dayIndex);
    renderSlots();
  }

  function renderReview() {
    bind('when', whenText());
    bind('where', `${state.location.name} · ${state.location.address}`);
    bind('for', `${state.petName} · ${state.petType} · ${state.patient === 'new' ? 'New client' : 'Returning client'}`);
    bind('contact', `${state.ownerName} · ${state.email}`);
  }

  function focusHeading(container) {
    const heading = container.querySelector('h2');
    if (block.getBoundingClientRect().top < 0) shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading?.focus({ preventScroll: true });
  }

  function renderStep(moveFocus = true) {
    panels.forEach((panel) => { panel.hidden = Number(panel.dataset.step) !== state.step; });
    $$('[data-step-indicator]').forEach((item) => {
      const index = Number(item.dataset.stepIndicator);
      item.classList.toggle('is-current', index === state.step);
      item.classList.toggle('is-complete', index < state.step);
      if (index === state.step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    $('.booking-stepper-track span').style.width = `${((state.step - 1) / (STEPS.length - 1)) * 100}%`;
    $('.booking-stepper').hidden = false;
    $('.booking-success').hidden = true;
    if (state.step === 2) renderDates();
    if (state.step === 4) renderReview();
    syncSummary();
    if (moveFocus) focusHeading(panels[state.step - 1]);
  }

  function validateDetails() {
    const error = $('[data-error="details"]');
    form.querySelectorAll('input[required]').forEach((field) => {
      field.setAttribute('aria-invalid', String(!field.checkValidity()));
    });
    if (!form.checkValidity()) {
      error.hidden = false;
      form.querySelector(':invalid')?.focus();
      return false;
    }
    error.hidden = true;
    state.petName = form.petName.value.trim();
    state.petType = form.petType.value;
    state.ownerName = form.ownerName.value.trim();
    state.email = form.email.value.trim();
    return true;
  }

  function nextStep() {
    if (state.step === 2 && !state.slot) {
      $('[data-error="slot"]').hidden = false;
      return;
    }
    if (state.step === 3 && !validateDetails()) return;
    if (state.step < STEPS.length) {
      state.step += 1;
      renderStep();
    }
  }

  function setLocation(location) {
    state.location = location;
    state.days = upcomingDays(location);
    state.dayIndex = 0;
    state.slot = '';
  }

  function confirmBooking() {
    $('.booking-stepper').hidden = true;
    panels.forEach((panel) => { panel.hidden = true; });
    const success = $('.booking-success');
    success.hidden = false;
    bind('success-pet', `${state.petName} · ${state.visit.name}`);
    focusHeading(success);
  }

  function restart() {
    Object.assign(state, {
      step: 1, visit: VISITS[0], patient: 'new', petName: '', petType: 'Dog', ownerName: '', email: '',
    });
    setLocation(state.location);
    form.reset();
    setPressed('.booking-option', (b) => b.dataset.visit === state.visit.id);
    setPressed('.booking-segment', (b) => b.dataset.patient === state.patient);
    $$('.booking-error').forEach((el) => { el.hidden = true; });
    form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    renderStep();
  }

  shell.addEventListener('click', (event) => {
    const option = event.target.closest('[data-visit]');
    if (option) {
      state.visit = VISITS.find((v) => v.id === option.dataset.visit);
      setPressed('.booking-option', (b) => b === option);
      syncSummary();
      return;
    }
    const segment = event.target.closest('[data-patient]');
    if (segment) {
      state.patient = segment.dataset.patient;
      setPressed('.booking-segment', (b) => b === segment);
      syncSummary();
      return;
    }
    const date = event.target.closest('[data-day-index]');
    if (date) {
      state.dayIndex = Number(date.dataset.dayIndex);
      state.slot = '';
      $('[data-error="slot"]').hidden = true;
      renderDates();
      syncSummary();
      return;
    }
    const slot = event.target.closest('[data-slot]');
    if (slot) {
      state.slot = slot.dataset.slot;
      $('[data-error="slot"]').hidden = true;
      renderSlots();
      syncSummary();
      return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'next') nextStep();
    if (action === 'back' && state.step > 1) {
      state.step -= 1;
      renderStep();
    }
    if (action === 'edit') {
      state.step = 1;
      renderStep();
    }
    if (action === 'confirm') confirmBooking();
    if (action === 'restart') restart();
  });

  locationSelect.addEventListener('change', () => {
    setLocation(LOCATIONS.find((l) => l.id === locationSelect.value));
    $('[data-error="slot"]').hidden = true;
    syncSummary();
  });

  form.addEventListener('input', (event) => {
    if (event.target.matches('input')) {
      event.target.removeAttribute('aria-invalid');
      $('[data-error="details"]').hidden = true;
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    nextStep();
  });

  setPressed('.booking-option', (b) => b.dataset.visit === state.visit.id);
  setPressed('.booking-segment', (b) => b.dataset.patient === state.patient);
  setLocation(state.location);
  renderStep(false);
  decorateIcons(shell);
}
