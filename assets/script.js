/* ============================================================
   ANORAK SYSTEM LOG — script.js
   ============================================================ */

/* ── Boot screen ──────────────────────────────────────────── */
setTimeout(() => {
  document.getElementById("boot-screen").classList.add("hidden");
}, 3500);

/* ── Loading bar ──────────────────────────────────────────── */
(function progressBar() {
  const fill = document.getElementById("progressFill");
  const text = document.getElementById("countText");
  let p = 0;
  const iv = setInterval(() => {
    if (p >= 100) {
      clearInterval(iv);
      return;
    }
    p++;
    fill.style.width = p + "%";
    text.innerText = p + "%";
  }, 20);
})();

/* ── Copyright ────────────────────────────────────────────── */
(function setCopyright() {
  const el = document.getElementById("copyright");
  if (el)
    el.innerHTML = `&copy; ${new Date().getFullYear()} Anorak System Log. All rights reserved.`;
})();

/* ── Log entries list ─────────────────────────────────────── */
/* Adicione novas datas aqui (mais recente primeiro) */
const entries = [
  "2026-05-12",
  "2026-01-16",
  "2025-12-03",
  "2025-08-26",
  "2025-08-16",
  "2025-08-06",
  "2025-07-31",
  "2025-07-28",
  "2025-07-25",
];

/* Gera os links na sidebar */
function generateLogLinks() {
  const list = document.querySelector(".log-links");
  if (!list) return;

  const countEl = document.getElementById("entry-count");
  if (countEl) countEl.textContent = `${entries.length} entries loaded`;

  entries.forEach((date) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${date}`;
    a.textContent = `>_ ${date}.log`;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      loadEntry(date);
      document
        .querySelectorAll(".log-links a")
        .forEach((l) => l.classList.remove("active"));
      a.classList.add("active");
    });

    li.appendChild(a);
    list.appendChild(li);
  });
}

/* Carrega o arquivo HTML do log */
async function loadEntry(date) {
  const container = document.querySelector(".entries");
  if (!container) return;

  container.innerHTML = `<div class="prompt">Carregando...<span class="blinker">_</span></div>`;

  try {
    const response = await fetch(`./logs/log-${date}.html`);
    if (!response.ok) throw new Error("not found");
    const html = await response.text();
    container.innerHTML = html;
  } catch {
    container.innerHTML = `
			<div class="entry">
				<div class="prompt">anorak@journal:~$ cat ${date}.log</div>
				<div class="entry-content">
					<p style="color:var(--meter-crit)">ERROR: Log file not found!</p>
					<p>O arquivo ./logs/log-${date}.html não existe.</p>
				</div>
			</div>`;
  }
}

/* ── Helpers ──────────────────────────────────────────────── */
function pad(n) {
  return String(n).padStart(2, "0");
}
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function setMeter(barId, pct, warnAt = 65, critAt = 85) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  bar.style.width = pct + "%";
  bar.className =
    "meter-fill" + (pct >= critAt ? " crit" : pct >= warnAt ? " warn" : "");
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── Mini sparkline ───────────────────────────────────────── */
function renderSparkline(containerId, history, max) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  history.forEach((v) => {
    const bar = document.createElement("div");
    bar.className = "mini-bar";
    bar.style.height = Math.max(2, Math.round((v / max) * 22)) + "px";
    el.appendChild(bar);
  });
}

/* ── Clock & uptime ───────────────────────────────────────── */
const startTime = Date.now();
const DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTHS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

function updateClock() {
  const now = new Date();
  const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  setText("clock", ts);
  setText(
    "clock-date",
    `${DAYS[now.getDay()]} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
  );

  const sec = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  setText("uptime", `${pad(h)}:${pad(m)}:${pad(s)}`);
}

/* ── CPU simulation ───────────────────────────────────────── */
const cpuTargets = [30, 45, 25, 55];
const cpuCurrent = [30, 45, 25, 55];
const cpuHistory = Array(14).fill(20);

function updateCPU() {
  let total = 0;
  for (let i = 0; i < 4; i++) {
    cpuTargets[i] = Math.max(5, Math.min(95, cpuTargets[i] + rnd(-15, 15)));
    cpuCurrent[i] = lerp(cpuCurrent[i], cpuTargets[i], 0.4);
    const v = cpuCurrent[i];
    total += v;
    setMeter(`c${i}`, v, 60, 80);
    setText(`c${i}v`, Math.round(v) + "%");
  }
  const avg = Math.round(total / 4);
  setText("tb-cpu", avg);
  cpuHistory.push(avg);
  cpuHistory.shift();
  renderSparkline("cpu-graph", cpuHistory, 100);
}

/* ── RAM simulation ───────────────────────────────────────── */
let ramUsed = 5.8;
let swapUsed = 0.3;
const RAM_TOTAL = 16;
const SWAP_TOTAL = 4;

function updateRAM() {
  ramUsed = Math.max(
    3,
    Math.min(RAM_TOTAL - 1, ramUsed + (Math.random() - 0.48) * 0.35),
  );
  swapUsed = Math.max(
    0,
    Math.min(SWAP_TOTAL - 0.1, swapUsed + (Math.random() - 0.5) * 0.06),
  );

  const rp = Math.round((ramUsed / RAM_TOTAL) * 100);
  const sp = Math.round((swapUsed / SWAP_TOTAL) * 100);

  setMeter("ram-bar", rp, 65, 85);
  setMeter("swap-bar", sp, 50, 75);
  setText("ram-val", ramUsed.toFixed(1) + `/${RAM_TOTAL} GB`);
  setText("swap-val", swapUsed.toFixed(1) + `/${SWAP_TOTAL} GB`);
  setText("tb-ram", rp);
}

/* ── Network simulation ───────────────────────────────────── */
let netUpTarget = 80,
  netDnTarget = 200;
let netUpCurrent = 80,
  netDnCurrent = 200;
const netHistory = Array(14).fill(10);

function updateNetwork() {
  netUpTarget = Math.max(5, Math.min(900, netUpTarget + rnd(-120, 120)));
  netDnTarget = Math.max(10, Math.min(3500, netDnTarget + rnd(-400, 400)));
  netUpCurrent = lerp(netUpCurrent, netUpTarget, 0.4);
  netDnCurrent = lerp(netDnCurrent, netDnTarget, 0.4);

  const fmt = (v) =>
    v >= 1024 ? (v / 1024).toFixed(1) + " MB/s" : Math.round(v) + " KB/s";
  setText("net-up", fmt(netUpCurrent));
  setText("net-dn", fmt(netDnCurrent));
  setText("ping", rnd(8, 45) + " ms");

  netHistory.push(Math.round(netDnCurrent / 35));
  netHistory.shift();
  renderSparkline("net-graph", netHistory, 100);
}

/* ── Temperature simulation ───────────────────────────────── */
let tempBase = 52;

function updateTemp() {
  tempBase = Math.max(38, Math.min(90, tempBase + rnd(-3, 3)));
  setText("temp", tempBase + "°C");
  setText("tb-temp", tempBase);
  setMeter("temp-bar", Math.round((tempBase / 100) * 100), 65, 80);
}

/* ── Disk (static — não muda sem acesso ao SO) ────────────── */
function initDisk() {
  setText("disk-root-val", "47/120 GB");
  setMeter("disk-root-bar", 39, 70, 90);
  setText("disk-hd2-val", "312/500 GB");
  setMeter("disk-hd2-bar", 62, 70, 90);
}

/* ── Status message rotation ──────────────────────────────── */
const STATUS_MSGS = [
  "SYSTEM NOMINAL",
  "ALL SERVICES RUNNING",
  "JOURNAL SERVICE: ACTIVE",
  "BTRFS: HEALTHY",
  "NO ERRORS DETECTED",
];
let statusIdx = 0;
function rotateStatus() {
  statusIdx = (statusIdx + 1) % STATUS_MSGS.length;
  setText("footer-status-msg", STATUS_MSGS[statusIdx]);
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  generateLogLinks();
  initDisk();

  updateClock();
  updateCPU();
  updateRAM();
  updateNetwork();
  updateTemp();

  setInterval(updateClock, 1000);
  setInterval(() => {
    updateCPU();
    updateRAM();
    updateNetwork();
    updateTemp();
  }, 1500);
  setInterval(rotateStatus, 5000);
});
