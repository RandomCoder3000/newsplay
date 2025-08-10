/* app.js — core logic for NewsPlay (stories 1–5, chart, quiz, glossary, badges)
   Load with: <script src="app.js" defer></script>
*/

/******************
 * 0) PREFS & BADGES HELPERS
 ******************/
const PREFS_KEY = 'np_prefs_v1';
const BADGES_KEY = 'np_badges_v1';
function getPrefs(){ try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; } }
function setPrefs(p){ localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }
function savePref(key, value){ const p = getPrefs(); p[key]=value; setPrefs(p); }
function getBadges(){ try { return JSON.parse(localStorage.getItem(BADGES_KEY)) || []; } catch { return []; } }
function addBadge(name, emoji){ const list = getBadges(); if(!list.find(b=>b.name===name)){ list.push({name,emoji,ts:Date.now()}); localStorage.setItem(BADGES_KEY, JSON.stringify(list)); renderBadges(); confetti(); } }
function renderBadges(){ const shelf=document.getElementById('badge-shelf'); if(!shelf) return; shelf.innerHTML=''; getBadges().forEach(b=>{ const s=document.createElement('span'); s.textContent=b.emoji; s.title=b.name; shelf.appendChild(s); }); }
function confetti(){ const c=document.body; for(let i=0;i<18;i++){ const s=document.createElement('span'); s.textContent=['🎉','⭐','✨'][i%3]; s.style.position='fixed'; s.style.left=(50+Math.random()*6-3)+'%'; s.style.top='40%'; s.style.fontSize=(16+Math.random()*14)+'px'; s.style.pointerEvents='none'; s.style.transition='transform 900ms ease, opacity 900ms ease'; c.appendChild(s); requestAnimationFrame(()=>{ s.style.transform=`translate(${(Math.random()*160-80)}px, ${180+Math.random()*180}px) rotate(${Math.random()*720}deg)`; s.style.opacity='0'; }); setTimeout(()=>s.remove(),1000); } }

/******************
 * 1) AGE‑ADAPTIVE STORY CONTENT
 ******************/
const story = {
  title: "Why do prices change?",
  panels: {
    "6_8": [
      "🍌 Panel 1: Your banana costs 10 coins yesterday.",
      "🏪 Panel 2: Storms hurt farms. Fewer bananas arrive.",
      "💡 Panel 3: With less bananas, shops raise prices. This is called price rise."
    ],
    "9_11": [
      "📈 When many people want an item but fewer are available, the price often goes up.",
      "🌧️ Bad weather or higher fuel costs can make it harder to bring goods to shops.",
      "🧠 This price increase across many things is called inflation."
    ],
    "12_14": [
      "🔍 Prices change with supply and demand. Lower supply or higher demand pushes prices up.",
      "⛽ Transport and energy costs also ripple into final prices you see.",
      "🧮 When average prices rise broadly over time, that’s inflation (often tracked by CPI)."
    ]
  },
  source: "https://en.wikipedia.org/wiki/Inflation"
};

const story2 = {
  title: "Why do countries trade?",
  panels: {
    "6_8": [
      "🌾 Panel 1: One country grows lots of rice. Another makes great toys.",
      "🚢 Panel 2: They swap—rice for toys—so both have what they need.",
      "🤝 Panel 3: Trading helps people get more choices at good prices."
    ],
    "9_11": [
      "📦 Countries trade when each can make some things easier or cheaper.",
      "💱 Swapping (import/export) means more variety and sometimes lower prices.",
      "🧠 This idea is called specialization—do what you’re best at, trade for the rest."
    ],
    "12_14": [
      "⚖️ Trade is driven by comparative advantage—produce where opportunity cost is lowest.",
      "🌍 Imports/exports increase variety, efficiency, and can lower average prices.",
      "🧭 Downsides can include job shifts or dependence; policies try to balance these."
    ]
  },
  source: "https://en.wikipedia.org/wiki/International_trade"
};

const story3 = {
  title: "How do banks work?",
  panels: {
    "6_8": [
      "🏦 Panel 1: People put money in a bank to keep it safe.",
      "💸 Panel 2: The bank keeps some money and lends the rest to people and businesses.",
      "➕ Panel 3: Loans are paid back later with a little extra called interest."
    ],
    "9_11": [
      "📥 Banks hold deposits and use part of them to make loans.",
      "📈 Borrowers pay interest; savers may earn a smaller interest.",
      "🛡️ Rules make banks keep a safe reserve so people can withdraw cash."
    ],
    "12_14": [
      "📊 Banks take deposits (liabilities) and make loans (assets); lending can create new deposit money.",
      "💱 Interest is the price of borrowing; the spread between loan and deposit rates is income.",
      "🏛️ Central banks influence rates/reserves; risk controls help prevent bank runs."
    ]
  },
  source: "https://en.wikipedia.org/wiki/Bank"
};

const story4 = {
  title: "How do taxes work?",
  panels: {
    "6_8": [
      "🧾 Panel 1: Grown‑ups and shops pay a small part of money called tax.",
      "🚒 Panel 2: This money helps pay for roads, schools, parks, and helpers like firefighters.",
      "🤝 Panel 3: Everyone giving a little means the whole town can share big things."
    ],
    "9_11": [
      "🏫 Taxes are money collected by the government to fund public services—schools, hospitals, roads.",
      "🧮 Some taxes are on income, some on things you buy (sales tax/GST).",
      "⚖️ Different countries choose different rates and rules to try to be fair."
    ],
    "12_14": [
      "📚 Taxes fund public goods and transfers. Main types: income, corporate, consumption (VAT/GST), property.",
      "📊 Systems can be progressive, proportional, or regressive; policy balances revenue, equity, and incentives.",
      "🌐 Compliance and enforcement matter; budgets decide how tax money is allocated."
    ]
  },
  source: "https://en.wikipedia.org/wiki/Tax"
};

const story5 = {
  title: "What is GDP?",
  panels: {
    "6_8": [
      "🏭 Panel 1: Imagine adding up all the things a country makes in a year.",
      "🧮 Panel 2: That big total is called GDP—it shows how busy the country’s economy is.",
      "📈 Panel 3: If GDP grows, people are making more stuff and services."
    ],
    "9_11": [
      "🧰 GDP is the value of goods and services made in a country in one year.",
      "🔁 It can grow or shrink; we compare years to see change.",
      "👥 GDP per person divides GDP by the number of people to compare countries."
    ],
    "12_14": [
      "🧮 GDP measures market value of final goods/services within borders over a period (often real vs nominal).",
      "📊 It’s tracked by components: consumption, investment, government spending, and net exports (C+I+G+NX).",
      "⚠️ Limits: doesn’t capture inequality, unpaid work, or environmental costs."
    ]
  },
  source: "https://en.wikipedia.org/wiki/Gross_domestic_product"
};

let currentTier = (function(){ const p=getPrefs(); return p.tier || '6_8'; })();

function renderStory(){
  document.getElementById('story-title').textContent = story.title;
  document.getElementById('story-source').href = story.source;
  const panels = story.panels[currentTier];
  for (let i=0;i<3;i++) document.getElementById(`panel-${i+1}`).textContent = panels[i];
}
function renderStory2(){
  document.getElementById('story2-title').textContent = story2.title;
  document.getElementById('story2-source').href = story2.source;
  const panels = story2.panels[currentTier];
  document.getElementById('panel2-1').textContent = panels[0];
  document.getElementById('panel2-2').textContent = panels[1];
  document.getElementById('panel2-3').textContent = panels[2];
}
function renderStory3(){
  document.getElementById('story3-title').textContent = story3.title;
  document.getElementById('story3-source').href = story3.source;
  const panels = story3.panels[currentTier];
  document.getElementById('panel3-1').textContent = panels[0];
  document.getElementById('panel3-2').textContent = panels[1];
  document.getElementById('panel3-3').textContent = panels[2];
}
function renderStory4(){
  document.getElementById('story4-title').textContent = story4.title;
  document.getElementById('story4-source').href = story4.source;
  const panels = story4.panels[currentTier];
  document.getElementById('panel4-1').textContent = panels[0];
  document.getElementById('panel4-2').textContent = panels[1];
  document.getElementById('panel4-3').textContent = panels[2];
}
function renderStory5(){
  document.getElementById('story5-title').textContent = story5.title;
  document.getElementById('story5-source').href = story5.source;
  const panels = story5.panels[currentTier];
  document.getElementById('panel5-1').textContent = panels[0];
  document.getElementById('panel5-2').textContent = panels[1];
  document.getElementById('panel5-3').textContent = panels[2];
}

// Age switcher

document.querySelectorAll('.age-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.age-btn').forEach(b => b.className = 'age-btn pop px-3 py-2 rounded-xl bg-indigo-100');
    btn.className = 'age-btn pop px-3 py-2 rounded-xl bg-indigo-600 text-white';
    currentTier = btn.dataset.tier;
    savePref('tier', currentTier);
    renderStory(); renderStory2(); renderStory3(); renderStory4(); renderStory5();
    // If glossary open, re-render for current tier
    const gm = document.getElementById('glossary-modal');
    if (gm && gm.classList.contains('show')) document.getElementById('glossary-content').innerHTML = glossaryHTML(currentTier);
    // Optional event for add-ons
    document.dispatchEvent(new CustomEvent('tierchange', { detail: currentTier }));
  });
});

// Highlight saved tier button on load
(function(){
  const target = document.querySelector(`.age-btn[data-tier="${currentTier}"]`);
  if (target) {
    document.querySelectorAll('.age-btn').forEach(b => b.className = 'age-btn pop px-3 py-2 rounded-xl bg-indigo-100');
    target.className = 'age-btn pop px-3 py-2 rounded-xl bg-indigo-600 text-white';
  }
})();

// Expose helper for add-ons
window.getCurrentTier = () => currentTier;

// Text‑to‑Speech (browser Web Speech API) — first card
const ttsBtn = document.getElementById('btn-tts');
if (ttsBtn) {
  ttsBtn.addEventListener('click', () => {
    const text = story.panels[currentTier].join(' ');
    if (!('speechSynthesis' in window)) { alert('Text‑to‑Speech not supported in this browser.'); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = currentTier === '6_8' ? 0.9 : 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  });
}

// TTS for other cards
(function(){
  const map = [
    ['btn-tts-2', ()=>story2.panels[currentTier].join(' ')],
    ['btn-tts-3', ()=>story3.panels[currentTier].join(' ')],
    ['btn-tts-4', ()=>story4.panels[currentTier].join(' ')],
    ['btn-tts-5', ()=>story5.panels[currentTier].join(' ')]
  ];
  map.forEach(([id, getter])=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', ()=>{
      if (!('speechSynthesis' in window)) { alert('Text‑to‑Speech not supported in this browser.'); return; }
      const utter = new SpeechSynthesisUtterance(getter());
      utter.rate = currentTier === '6_8' ? 0.9 : 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    });
  });
})();

// Explain‑Back — simple kindness scorer (on‑device; no AI key needed)
const scoreBtn = document.getElementById('btn-score');
if (scoreBtn) {
  scoreBtn.addEventListener('click', () => {
    const t = document.getElementById('explain-text').value.trim();
    const out = document.getElementById('score-output');
    if (t.length < 20) { out.textContent = 'Nice start! Try adding 1) what changed, 2) why it changed, 3) the word inflation.'; return; }
    let points = 1; if (/price|prices/i.test(t)) points++; if (/supply|demand/i.test(t)) points++; if (/inflation/i.test(t)) points++;
    const messages = { 1:'Great effort! Try to mention prices and why they changed.', 2:'Good! You noticed prices changed. Can you add supply or demand?', 3:'Strong! You used key ideas. One more detail would make it excellent.', 4:'Excellent explanation! You covered the big ideas 🎉' };
    out.textContent = messages[Math.min(points,4)];
    if (points >= 4) addBadge('Inflation Explainer','📈');
  });
}

// Optional: voice to text (only in some browsers)
let recognizing = false; let recognition;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;
  recognition.onstart = () => { document.getElementById('record-status').textContent = 'Mic: recording…'; };
  recognition.onend = () => { recognizing = false; document.getElementById('record-status').textContent = 'Mic: stopped'; };
  recognition.onresult = (e) => { const transcript = Array.from(e.results).map(r => r[0].transcript).join(' '); document.getElementById('explain-text').value = transcript; };
}
const recordBtn = document.getElementById('btn-record');
if (recordBtn) {
  recordBtn.addEventListener('click', ()=>{
    if (!recognition) { alert('Speech recognition not supported here. You can type instead!'); return; }
    if (!recognizing) { recognizing = true; recognition.start(); } else { recognition.stop(); }
  });
}

// Initial render of all stories
renderStory(); renderStory2(); renderStory3(); renderStory4(); renderStory5();

/******************
 * 2) WORLD BANK DATA CHART — no API key needed
 ******************/
const chartCtx = document.getElementById('chart');
let chart;

async function fetchWB(country3='IND', indicator='NY.GDP.PCAP.CD'){
  const url = `https://api.worldbank.org/v2/country/${country3}/indicator/${indicator}?format=json&per_page=20000`;
  const res = await fetch(url);
  const data = await res.json();
  const rows = (data[1] || []).filter(r => r.date >= '2000' && r.date <= '2023').reverse();
  const years = rows.map(r => +r.date);
  const values = rows.map(r => (r.value == null ? null : (indicator === 'NY.GDP.PCAP.CD' ? Math.round(r.value) : Number(r.value))));
  return { years, values };
}

function renderChart(years, values, label, fmt){
  if (chart) chart.destroy();
  chart = new Chart(chartCtx, {
    type: 'line',
    data: { labels: years, datasets: [{ label, data: values, tension: 0.25, pointRadius: 2 }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: true }, ticks: {} },
        y: { grid: { display: true }, ticks: { callback: (v)=> fmt(v) } }
      }
    }
  });
}

async function loadCountry(c){
  const indicator = document.getElementById('indicator').value;
  const label = indicator === 'NY.GDP.PCAP.CD' ? 'GDP per person (US$)' : 'Inflation (annual %)';
  document.getElementById('indicator-label').textContent = label;
  const { years, values } = await fetchWB(c, indicator);
  const fmt = indicator === 'NY.GDP.PCAP.CD' ? (v)=> v==null? '' : '$'+Math.round(v).toLocaleString() : (v)=> v==null? '' : (Number(v).toFixed(1)+'%');
  renderChart(years, values, label, fmt);
  const yearInput = document.getElementById('year');
  const yearLabel = document.getElementById('year-label');
  const yearValue = document.getElementById('year-value');
  yearInput.min = years[0];
  yearInput.max = years[years.length - 1];
  yearInput.value = years[Math.floor(years.length/2)];
  function updateFromSlider(){
    const y = +yearInput.value;
    yearLabel.textContent = y;
    const idx = years.indexOf(y);
    const v = values[idx];
    yearValue.textContent = v==null ? 'No data' : (indicator === 'NY.GDP.PCAP.CD' ? ('$' + Math.round(v).toLocaleString()) : (Number(v).toFixed(1) + '%'));
  }
  yearInput.oninput = updateFromSlider;
  updateFromSlider();
}

// Inputs & persistence
const countrySel = document.getElementById('country');
if (countrySel) countrySel.addEventListener('change', (e)=>{ savePref('country', e.target.value); loadCountry(e.target.value); });
const indicatorSel = document.getElementById('indicator');
if (indicatorSel) indicatorSel.addEventListener('change', (e)=>{ savePref('indicator', e.target.value); loadCountry(document.getElementById('country').value); });
const btnLoadCountry = document.getElementById('btn-load-country');
if (btnLoadCountry) btnLoadCountry.addEventListener('click', ()=>{ const code=(document.getElementById('country-code').value||'').trim().toUpperCase(); if(code.length===3){ savePref('country', code); loadCountry(code); }});

// Restore prefs and load
(function(){
  const p = getPrefs();
  if (p.indicator && indicatorSel) indicatorSel.value = p.indicator;
  if (p.country){ const sel=countrySel; if (sel && [...sel.options].some(o=>o.value===p.country)){ sel.value=p.country; loadCountry(p.country); return; } }
  loadCountry('IND');
})();

// Badges shelf init
renderBadges();

// Glossary
function glossaryHTML(tier){
  const defs = {
    inflation: { '6_8':'When many prices go up over time.', '9_11':'Prices rising across many goods and services.', '12_14':'A broad, sustained rise in average prices (often tracked by CPI).' },
    GDP: { '6_8':'All the things a country makes in a year, added up.', '9_11':'The value of goods and services made in a country in one year.', '12_14':'Market value of final goods/services produced within a country in a period.' },
    interest: { '6_8':'A little extra money paid back with a loan.', '9_11':'Extra money paid for borrowing, or earned from saving.', '12_14':'The price of borrowing money.' },
    trade: { '6_8':'Countries swap things so everyone gets what they need.', '9_11':'Buying and selling between countries (imports/exports).', '12_14':'Exchange across borders; driven by comparative advantage.' }
  };
  const items = Object.entries(defs).map(([k,v])=>`<div><strong>${k}</strong><div class="text-slate-600 mt-1">${v[tier]}</div></div>`);
  return items.join('');
}
const btnOpenGlossary = document.getElementById('open-glossary');
if (btnOpenGlossary) btnOpenGlossary.addEventListener('click', ()=>{
  const m=document.getElementById('glossary-modal'); const box=document.getElementById('glossary-content'); if(!m||!box) return;
  box.innerHTML = glossaryHTML(currentTier);
  m.classList.add('show');
});
const btnCloseGlossary = document.getElementById('close-glossary');
if (btnCloseGlossary) btnCloseGlossary.addEventListener('click', ()=>{ document.getElementById('glossary-modal')?.classList.remove('show'); });

// Quiz handler (awards a sticker on perfect score)
const btnQuiz = document.getElementById('btn-quiz');
if (btnQuiz) btnQuiz.addEventListener('click', ()=>{
  const q1=document.querySelector('input[name="q1"]:checked')?.value;
  const q2=document.querySelector('input[name="q2"]:checked')?.value;
  const q3=document.querySelector('input[name="q3"]:checked')?.value;
  let score=0; if(q1==='up') score++; if(q2==='inflation') score++; if(q3==='ripple') score++;
  const out=document.getElementById('quiz-output'); out.textContent = 'Score: '+score+'/3';
  if(score===3){ addBadge('Price Detective','🕵️'); }
});

/******************
 * 3) SELF‑TESTS (dev console)
 ******************/
(function runSelfTests(){
  console.group('%cNewsPlay Self‑Tests','color: purple; font-weight: bold');
  try {
    const tiers=['6_8','9_11','12_14'];
    function checkStory(s){ tiers.forEach(t=>{ if(!s.panels[t]||s.panels[t].length!==3) throw new Error('Story panels must have 3 items for tier '+t); }); }
    [story,story2,story3,story4,story5].forEach(checkStory);
    if(!document.getElementById('chart')) throw new Error('Chart canvas missing');
    // New tests: glossary & prefs
    const g6 = glossaryHTML('6_8'); if(typeof g6!=="string"||!g6.includes('inflation')) throw new Error('Glossary failed for 6_8');
    const before = getPrefs().tier; savePref('tier','9_11'); if(getPrefs().tier!=='9_11') throw new Error('Pref write failed'); if(before) savePref('tier', before); else { const p=getPrefs(); delete p.tier; setPrefs(p); }
    // Ensure dark mode is fully removed
    if (document.getElementById('toggle-dark')) throw new Error('Dark mode toggle should not exist');
    if (document.body.classList.contains('dark')) throw new Error('Dark mode class should not be present');
    console.log('✓ Stories, chart, glossary, prefs OK — light theme only');
  } catch (e) { console.error('Self‑test failed:', e); }
  console.groupEnd();
})();
