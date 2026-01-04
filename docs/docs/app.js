let RULES = null;
let STADIUMS = null;

const el = (id) => document.getElementById(id);

function money(n) {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
}

function renderOutput(html) {
  el("output").classList.remove("muted");
  el("output").innerHTML = html;
}

function renderError(msg) {
  el("output").classList.add("muted");
  el("output").textContent = msg;
}

async function loadData() {
  try {
    // From /docs -> go up one level to /data
    const [rulesRes, stadiumsRes] = await Promise.all([
      fetch("../data/rules.json"),
      fetch("../data/stadiums.json"),
    ]);

    RULES = await rulesRes.json();
    STADIUMS = await stadiumsRes.json();

    // Populate stadium dropdown
    const sel = el("stadiumSelect");
    sel.innerHTML = `<option value="">Select a stadium…</option>`;

    const list = (STADIUMS.stadiums || []);
    for (const s of list) {
      const opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = `${s.city} — ${s.name}`;
      sel.appendChild(opt);
    }

    renderError("Enter details and click Calculate.");
  } catch (err) {
    console.error(err);
    renderError("Could not load rules/stadiums. Make sure data/rules.json and data/stadiums.json exist.");
  }
}

function calculate() {
  if (!RULES) return;

  const fees = RULES.fees || {};
  const baseFee = Number(el("baseFee").value || 0);

  const isToronto = el("isToronto").checked;
  const isCrewChief = el("isCrewChief").checked;
  const isPitchClockOp = el("isPitchClockOp").checked;

  const torontoExtra = isToronto ? Number(fees.toronto_extra_fee || 0) : 0;
  const crewChiefBonus = isCrewChief ? Number(fees.crew_chief_bonus || 0) : 0;
  const pitchClockBonus = isPitchClockOp ? Number(fees.pitch_clock_operator_bonus || 0) : 0;

  const total = baseFee + torontoExtra + crewChiefBonus + pitchClockBonus;

  const stadiumName = el("stadiumSelect").value || "—";
  const numUmpires = el("numUmpires").value;

  renderOutput(`
    <div class="line"><strong>Stadium:</strong> ${stadiumName}</div>
    <div class="line"><strong>Umpires:</strong> ${numUmpires}</div>
    <hr />
    <div class="line"><span>Base fee</span><span>${money(baseFee)}</span></div>
    <div class="line"><span>Toronto extra</span><span>${money(torontoExtra)}</span></div>
    <div class="line"><span>Crew Chief bonus</span><span>${money(crewChiefBonus)}</span></div>
    <div class="line"><span>Pitch Clock Op bonus</span><span>${money(pitchClockBonus)}</span></div>
    <hr />
    <div class="line total"><span>Total per umpire</span><span>${money(total)}</span></div>
    <p class="muted small">Mileage not included yet.</p>
  `);
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  el("calcBtn").addEventListener("click", calculate);
});
