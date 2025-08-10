// app.js — core interactions for the NewsPlay homepage
// - Age switcher (6–8, 9–11, 12–14)
// - First story (Prices & Inflation): panels + TTS + quiz + explain-back
// - Glossary modal
// - Time-Travel Data (World Bank): line chart + year slider
// - Badges (shared with labs): stored in localStorage
// - Render core topics (Trade, Banks, Taxes, GDP) on init & tier changes
// - Kid-friendly emojis in ALL story panels

(function(){
  /* --------------------------- 0) Utilities & prefs --------------------------- */
  const PREFS_KEY='np_prefs_v1';
  const BADGES_KEY='np_badges_v1';

  function getPrefs(){ try{ return JSON.parse(localStorage.getItem(PREFS_KEY))||{} }catch{ return {} } }
  function setPrefs(p){ localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }
  function savePref(k,v){ const p=getPrefs(); p[k]=v; setPrefs(p); }

  function getBadges(){ try{ return JSON.parse(localStorage.getItem(BADGES_KEY))||[] }catch{ return [] } }
  function addBadge(name,emoji){ const list=getBadges(); if(!list.find(b=>b.name===name)){ list.push({name,emoji,ts:Date.now()}); localStorage.setItem(BADGES_KEY, JSON.stringify(list)); renderBadges(); burst(); } }
  function renderBadges(){ const shelf=document.getElementById('badge-shelf'); if(!shelf) return; shelf.innerHTML=''; getBadges().forEach(b=>{ const s=document.createElement('span'); s.textContent=b.emoji; s.title=b.name; shelf.appendChild(s); }); }
  function burst(){ const c=document.body; for(let i=0;i<10;i++){ const s=document.createElement('span'); s.textContent=['🎉','⭐','✨'][i%3]; s.style.position='fixed'; s.style.left=(50+Math.random()*8-4)+'%'; s.style.top='40%'; s.style.fontSize=(16+Math.random()*14)+'px'; s.style.pointerEvents='none'; s.style.transition='transform 900ms ease, opacity 900ms ease'; c.appendChild(s); requestAnimationFrame(()=>{ s.style.transform=`translate(${(Math.random()*160-80)}px, ${180+Math.random()*180}px) rotate(${Math.random()*720}deg)`; s.style.opacity='0'; }); setTimeout(()=>s.remove(),1000); } }

  // Expose for extras.js if needed
  window.getPrefs = getPrefs; window.addBadge = addBadge; window.renderBadges = renderBadges;

  /* --------------------------- 1) Age tier handling --------------------------- */
  function getCurrentTier(){
    const p=getPrefs();
    if(p.tier) return p.tier;
    const active=document.querySelector('.age-btn.text-white');
    return (active && active.dataset && active.dataset.tier) || '6_8';
  }
  window.getCurrentTier = getCurrentTier;

  function setTier(t){ savePref('tier', t); paintTier(); document.dispatchEvent(new CustomEvent('tierchange', {detail:t})); }
  function paintTier(){
    document.querySelectorAll('.age-btn').forEach(b=> b.className='age-btn pop px-3 py-2 rounded-xl bg-indigo-100');
    const active=document.querySelector(`.age-btn[data-tier="${getCurrentTier()}"]`);
    if(active) active.className='age-btn pop px-3 py-2 rounded-xl bg-indigo-600 text-white';
  }
  function bindTierButtons(){
    document.querySelectorAll('.age-btn').forEach(btn=> btn.addEventListener('click',()=> setTier(btn.dataset.tier)));
  }

  /* --------------------------- 2) First story: panels -------------------------- */
  const LINES={
    '6_8':[
      '🍌 Bananas are super popular today!',
      '🚚 Only a few boxes arrived.',
      '📈 When lots want it but there is little, prices go up.'
    ],
    '9_11':[
      '📈 High demand for bananas today.',
      '⛓️ Supply trucks were delayed.',
      '⚖️ When demand↑ and supply↓, price tends to rise.'
    ],
    '12_14':[
      '📊 Demand spike meets supply constraint.',
      '🚧 Logistics reduce deliveries.',
      '⚖️ Price rises as the market finds a new equilibrium.'
    ]
  };
  function renderPanels(){
    const t=getCurrentTier();
    const p1=document.getElementById('panel-1');
    const p2=document.getElementById('panel-2');
    const p3=document.getElementById('panel-3');
    if(p1&&p2&&p3){ const a=LINES[t]; p1.textContent=a[0]; p2.textContent=a[1]; p3.textContent=a[2]; }
  }

  /* --------------------------- 3) First story: TTS ---------------------------- */
  function speak(text){ if(!('speechSynthesis' in window)) return alert('Text-to-Speech not supported.'); const u=new SpeechSynthesisUtterance(text); u.rate=getCurrentTier()==='6_8'?0.9:1; speechSynthesis.cancel(); speechSynthesis.speak(u); }
  function bindTTS(){ const b=document.getElementById('btn-tts'); if(b){ b.addEventListener('click',()=>{ const t=getCurrentTier(); speak(LINES[t].join(' ')); }); } }

  /* --------------------------- 4) Quick Quiz (first card) --------------------- */
  function bindQuiz(){
    const btn=document.getElementById('btn-quiz'); if(!btn) return;
    btn.addEventListener('click',()=>{
      const a1=document.querySelector('input[name="q1"]:checked');
      const a2=document.querySelector('input[name="q2"]:checked');
      const a3=document.querySelector('input[name="q3"]:checked');
      let score=0; if(a1&&a1.value==='up') score++; if(a2&&a2.value==='inflation') score++; if(a3&&a3.value==='ripple') score++;
      const out=document.getElementById('quiz-output'); if(out){ out.textContent=`Score: ${score}/3`; }
      if(score===3) addBadge('Inflation Explorer','🧠');
    });
  }

  /* --------------------------- 5) Explain-Back scoring ------------------------ */
  function bindExplainBack(){
    const b=document.getElementById('btn-score'); const ta=document.getElementById('explain-text'); const out=document.getElementById('score-output');
    if(!b||!ta||!out) return;
    b.addEventListener('click',()=>{
      const txt=(ta.value||'').trim();
      if(!txt){ out.textContent='Try writing a few words first!'; return; }
      const okWords=['demand','supply','price','banana','few','many','go up','rise'];
      let hits=0; okWords.forEach(w=>{ if(txt.toLowerCase().includes(w)) hits++; });
      const len=txt.split(/\s+/).length;
      const score=Math.min(10, Math.round(hits*2 + len/10));
      out.textContent=`Great try! Feedback score: ${score}/10`;
      if(score>=8) addBadge('Clear Explainer','📣');
    });
  }

  /* --------------------------- 6) Glossary modal ------------------------------ */
  function bindGlossary(){
    const open=document.getElementById('open-glossary'); const close=document.getElementById('close-glossary'); const modal=document.getElementById('glossary-modal'); const holder=document.getElementById('glossary-content');
    if(!open||!close||!modal||!holder) return;
    const ITEMS=[
      ['Inflation','A general rise in prices over time.'],
      ['Demand','How much people want something.'],
      ['Supply','How much of something is available.'],
      ['GDP','The value of goods and services made in a country.'],
      ['Budget','A plan for income and spending.']
    ];
    holder.innerHTML=ITEMS.map(([k,v])=>`<div><b>${k}</b><div class="text-slate-600 text-sm">${v}</div></div>`).join('');
    open.addEventListener('click',()=> modal.classList.add('show'));
    close.addEventListener('click',()=> modal.classList.remove('show'));
  }

  /* --------------------------- 7) Time-Travel Data ---------------------------- */
  let chart;
  function byId(id){ return document.getElementById(id); }
  function bindData(){
    const countrySel=byId('country'); const indicatorSel=byId('indicator'); const cc=byId('country-code'); const loadBtn=byId('btn-load-country');
    const chartCanvas=byId('chart'); const year=byId('year'); const yearLabel=byId('year-label'); const yearVal=byId('year-value'); const indLabel=byId('indicator-label');
    if(!countrySel||!indicatorSel||!chartCanvas||!year||!yearLabel||!yearVal||!indLabel) return; // widget not on this page

    function labelFor(ind){ return ind==='NY.GDP.PCAP.CD' ? 'GDP per person (current US$)' : 'Inflation (CPI %)' }

    async function fetchData(iso, indicator){
      const url=`https://api.worldbank.org/v2/country/${iso}/indicator/${indicator}?format=json&per_page=80`;
      const res=await fetch(url); const json=await res.json();
      const arr=(json[1]||[]).filter(r=>r.value!=null).map(r=>({y:r.date|0, v:r.value})).sort((a,b)=>a.y-b.y);
      return arr; // [{y: year, v: value}]
    }

    function renderChart(data, indicator){
      const labels=data.map(d=>d.y);
      const values=data.map(d=>d.v);
      if(chart) chart.destroy();
      chart=new Chart(chartCanvas,{ type:'line', data:{ labels, datasets:[{ data:values, borderWidth:2, pointRadius:0 }] }, options:{ plugins:{legend:{display:false}}, responsive:true, scales:{ x:{ ticks:{ maxRotation:0, autoSkip:true }}, y:{ beginAtZero:false } } } });
    }

    async function load(){
      const iso=(cc && cc.value.trim()) || countrySel.value; const ind=indicatorSel.value;
      indLabel.textContent=labelFor(ind);
      try{
        const data=await fetchData(iso, ind);
        renderChart(data, ind);
        // set slider bounds
        const min=data[0]?.y||2000; const max=data.at(-1)?.y||2023;
        year.min=min; year.max=max; year.value=Math.floor((min+max)/2); yearLabel.textContent=year.value;
        const found=data.find(d=>d.y==year.value); yearVal.textContent=found? (ind==='NY.GDP.PCAP.CD' ? Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(found.v) : Number(found.v).toFixed(1)+'%') : '—';
      }catch(e){ console.error('World Bank fetch failed', e); }
    }

    loadBtn?.addEventListener('click', load);
    countrySel.addEventListener('change', load);
    indicatorSel.addEventListener('change', load);
    year.addEventListener('input', ()=>{ yearLabel.textContent=year.value; });
    year.addEventListener('change', ()=>{
      const pts=chart?.data?.labels||[];
      const idx=pts.indexOf(+year.value);
      const v=chart?.data?.datasets?.[0]?.data?.[idx];
      yearVal.textContent = (typeof v==='number') ? (indicatorSel.value==='NY.GDP.PCAP.CD' ? Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(v) : Number(v).toFixed(1)+'%') : '—';
    });

    load();
  }

  /* ---------------------- 8) Core topic panels (with emojis) ------------------ */
  const CORE_LINES = {
    trade: {
      '6_8': [
        '🧸 We make toys; they grow rice 🍚. We swap!',
        '🔄 Trading helps everyone get what they need.',
        '😊 Both sides are happier after trade.'
      ],
      '9_11': [
        '🏭 Countries specialize in what they do best.',
        '🚢 Export what’s easy; import what’s costly.',
        '🤝 Comparative advantage makes trade win–win.'
      ],
      '12_14': [
        '📉 Gains come from lower opportunity cost.',
        '📈 Terms of trade affect each side’s gains.',
        '🛃 Tariffs/standards shape flows & adjustment.'
      ]
    },
    banks: {
      '6_8': [
        '🏦 Banks keep money safe.',
        '💳 They lend money for big things.',
        '💸 Borrowers repay with extra called interest.'
      ],
      '9_11': [
        '🏦 Banks use deposits to make loans & keep reserves.',
        '📈 Borrowers pay interest; 💰 savers may earn interest.',
        '🛡️ Rules help banks stay safe.'
      ],
      '12_14': [
        '🏦 Intermediation: savers ↔ borrowers.',
        '📊 Banks earn a spread: loan − deposit rate.',
        '🧮 Capital/liquidity rules control risk.'
      ]
    },
    taxes: {
      '6_8': [
        '🤝 We all chip in a little money.',
        '🛣️ It pays for roads, 🏫 schools, and 🏞️ parks.',
        '🏷️ That shared money is called taxes.'
      ],
      '9_11': [
        '🧾 Income tax (earnings), 🛍️ GST/VAT (purchases).',
        '📈 Progressive = higher incomes → higher rates.',
        '🏛️ Taxes fund public services we all use.'
      ],
      '12_14': [
        '⚖️ Direct vs indirect; incidence = who bears it.',
        '🧭 Elasticities change price/quantity effects.',
        '🌍 Externality taxes (e.g., carbon) reduce harm.'
      ]
    },
    gdp: {
      '6_8': [
        '🧮 GDP adds up what a country makes this year.',
        '🧑‍⚕️ Services count too (doctors, teachers).',
        '🙂 More GDP means more made, not always happier.'
      ],
      '9_11': [
        '📚 GDP = value of goods & services this year.',
        '🧊 Real GDP removes price changes (inflation).',
        '👥 Per-person GDP helps compare countries.'
      ],
      '12_14': [
        '🧾 Expenditure: C + I + G + NX.',
        '📏 Real vs nominal; base-year matters.',
        '🔍 Limits: distribution, unpaid work, environment.'
      ]
    }
  };

  const CORE_IDS = {
    trade: ['panel2-1','panel2-2','panel2-3'],
    banks: ['panel3-1','panel3-2','panel3-3'],
    taxes: ['panel4-1','panel4-2','panel4-3'],
    gdp:   ['panel5-1','panel5-2','panel5-3']
  };

  function renderCoreTopics(){
    const t = getCurrentTier();
    Object.entries(CORE_IDS).forEach(([topic, ids])=>{
      const lines = CORE_LINES[topic] && CORE_LINES[topic][t];
      if (!lines) return;
      ids.forEach((id, i)=>{
        const el = document.getElementById(id);
        if (el) el.textContent = lines[i];
      });
    });
  }

  /* --------------------------- 9) Init & self-test ---------------------------- */
  function init(){
    try{
      renderBadges();
      bindTierButtons();
      paintTier();

      // First card
      renderPanels();
      bindTTS();
      bindQuiz();
      bindExplainBack();

      // Glossary + Data
      bindGlossary();
      bindData();

      // Core topics (emoji panels)
      renderCoreTopics();
      document.addEventListener('tierchange', renderCoreTopics);
    }catch(e){
      console.error('app.js init error', e);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();

  // Self-tests
  (function tests(){
    console.group('%cNewsPlay app.js self-tests','color:indigo;font-weight:bold');
    try{
      if(!document.querySelector('.age-btn')) throw new Error('Age buttons missing');
      if(document.getElementById('panel-1')){ // homepage present
        renderPanels();
        if(!document.getElementById('panel-1').textContent) throw new Error('Panels not filled');
      }
      console.log('✓ Basic wiring OK');
    }catch(e){ console.error('Self-test failed', e); }
    console.groupEnd();
  })();

  // Health flag for quick debugging
  window.NP_READY = true;
})();
