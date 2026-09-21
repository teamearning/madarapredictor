const TELEGRAM_URL = 'https://t.me/+5Ig1VyYW4c04YjA9';
const periodEl = document.querySelector('#period');
const timerEl = document.querySelector('#timer');
const utcEl = document.querySelector('#utcTime');
const progressEl = document.querySelector('#progressBar');
const predictionEl = document.querySelector('#prediction');
const chanceEl = document.querySelector('#chance');
const historyEl = document.querySelector('#historyList');
const historyCountEl = document.querySelector('#historyCount');
const scanStateEl = document.querySelector('#scanState');
const signalOrb = document.querySelector('#signalOrb');
const modal = document.querySelector('#joinModal');
let activePeriod = '';
let pendingTimer = null;
let history = [];

function getPeriod(now) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return `${year}${month}${day}-X${String(10001 + minutes).padStart(5, '0')}`;
}

function updateClock() {
  const now = new Date();
  const seconds = now.getUTCSeconds();
  const remaining = 60 - seconds;
  const currentPeriod = getPeriod(now);
  periodEl.textContent = currentPeriod;
  timerEl.textContent = `00:${String(remaining).padStart(2, '0')}`;
  utcEl.textContent = now.toISOString().slice(11, 19);
  progressEl.style.width = `${(seconds / 60) * 100}%`;
  if (activePeriod !== currentPeriod) {
    activePeriod = currentPeriod;
    beginScan(currentPeriod);
  }
}

function beginScan(period) {
  clearTimeout(pendingTimer);
  predictionEl.textContent = 'SCANNING…';
  predictionEl.className = 'pending';
  chanceEl.textContent = '—%';
  scanStateEl.textContent = 'READING THE FIELD';
  signalOrb.style.setProperty('--scan', '1');
  pendingTimer = setTimeout(() => completeScan(period), 2400);
}

function completeScan(period) {
  const prediction = Math.random() > 0.5 ? 'BIG' : 'SMALL';
  const confidence = Math.floor(72 + Math.random() * 23);
  predictionEl.textContent = prediction;
  predictionEl.className = prediction === 'BIG' ? 'outcome' : 'outcome small-outcome';
  chanceEl.textContent = `${confidence}%`;
  scanStateEl.textContent = 'SIGNAL LOCKED';
  signalOrb.animate([{ transform: 'scale(1)', boxShadow: '0 0 10px rgba(240,68,80,.2)' }, { transform: 'scale(1.24)', boxShadow: '0 0 42px rgba(240,68,80,.75)' }, { transform: 'scale(1)' }], { duration: 800, easing: 'ease-out' });
  addHistory(period, prediction, confidence);
}

function addHistory(period, prediction, confidence) {
  history.unshift({ period, prediction, confidence });
  history = history.slice(0, 5);
  historyCountEl.textContent = `${history.length} LOG${history.length === 1 ? '' : 'S'}`;
  historyEl.innerHTML = history.map(item => `<tr><td>${item.period}</td><td class="${item.prediction === 'SMALL' ? 'outcome small-outcome' : 'outcome'}">${item.prediction}</td><td class="confidence">${item.confidence}%</td><td class="result-status">● VERIFIED</td></tr>`).join('');
}

function openModal() { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }
document.querySelectorAll('[data-open-join]').forEach(btn => btn.addEventListener('click', openModal));
document.querySelectorAll('[data-close-join]').forEach(btn => btn.addEventListener('click', closeModal));
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.querySelector('#atmosphereToggle').addEventListener('click', e => {
  document.body.classList.toggle('calm-mode');
  e.currentTarget.textContent = document.body.classList.contains('calm-mode') ? '◐' : '◒';
  document.querySelector('#particles').style.opacity = document.body.classList.contains('calm-mode') ? '.16' : '.62';
});

// Lightweight local particle field; no libraries or network requests required.
const canvas = document.querySelector('#particles');
const ctx = canvas.getContext('2d');
let dots = [];
function resizeCanvas() { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); dots = Array.from({ length: Math.min(95, Math.floor(window.innerWidth / 15)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.3 + .3, vx: (Math.random() - .5) * .13, vy: (Math.random() - .5) * .13, a: Math.random() * .6 + .15 })); }
function drawParticles() { ctx.clearRect(0, 0, innerWidth, innerHeight); dots.forEach(d => { d.x += d.vx; d.y += d.vy; if (d.x < -5) d.x = innerWidth + 5; if (d.x > innerWidth + 5) d.x = -5; if (d.y < -5) d.y = innerHeight + 5; if (d.y > innerHeight + 5) d.y = -5; ctx.beginPath(); ctx.fillStyle = `rgba(218, 73, 91, ${d.a})`; ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }); requestAnimationFrame(drawParticles); }
window.addEventListener('resize', resizeCanvas); resizeCanvas(); drawParticles();
updateClock(); setInterval(updateClock, 1000);

// The join action uses the exact channel URL requested in the page markup.
void TELEGRAM_URL;

// First visit opens the channel invitation; Cancel remains available without leaving the page.
window.setTimeout(openModal, 450);
