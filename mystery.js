// mystery.js — News Mystery Missions (evidence → mini-sim → claim + scoring + badges + trade map)
(function(){
  const STORE='np_mystery_v1';
  const BADGES_KEY='np_badges_v1';

  /* ---------- helpers ---------- */
  const $ = sel => document.querySelector(sel);
  const on = (el,ev,fn)=> el && el.addEventListener(ev,fn);
  const save = data => localStorage.setItem(STORE, JSON.stringify(data));
  const load = () => { try{return JSON.parse(localStorage.getItem(STORE))||{}}catch{return{}} };
  const state = load();

  // cross-page badges
  function getBadges(){ try{ return JSON.parse(localStorage.getItem(BADGES_KEY))||[] }catch{ return [] } }
  function addBadge(name,emoji){
    const list=getBadges();
    if(!list.find(b=>b.name===name)){
      list.push({name,emoji,ts:Date.now()});
      localStorage.setItem(BADGES_KEY, JSON.stringify(list));
      renderBadges(); confetti();
    }
  }
  function renderBadges(){
    const shelf=$('#badge-shelf'); if(!shelf) return;
    shelf.innerHTML=''; getBadges().forEach(b=>{ const s=document.createElement('span'); s.textContent=b.emoji; s.title=b.name; shelf.appendChild(s); });
  }
  function confetti(){
    const c=document.body;
    for(let i=0;i<12;i++){
      const s=document.createElement('span');
      s.textContent=['🎉','⭐','✨'][i%3];
      s.style.position='fixed'; s.style.left=(50+Math.random()*10-5)+'%'; s.style.top='35%';
      s.style.fontSize=(16+Math.random()*12)+'px'; s.style.pointerEvents='none';
      s.style.transition='transform 900ms ease, opacity 900ms ease';
      c.appendChild(s);
      requestAnimationFrame(()=>{ s.style.transform=`translate(${(Math.random()*200-100)}px, ${220+Math.random()*160}px) rotate(${Math.random()*720}deg)`; s.style.opacity='0'; });
      setTimeout(()=>s.remove(),950);
    }
  }

  /* ---------- missions & evidence (with tags) ---------- */
  // evidence item format: [emojiTitle, meaning, tag]
  // tags: 'supply-' 'supply+' 'demand-' 'demand+' 'policy+' 'policy-' 'other'
  const TIER_TEXT = {
    bananas: {
      title: '🍌 The Bananas Price Puzzle',
      brief: {
        '6_8': 'Banana prices are higher this month. What changed?',
        '9_11': 'Banana prices jumped. Investigate supply, demand, and costs.',
        '12_14': 'Banana prices spiked. Trace shocks in supply/demand and policy.'
      },
      evidence: [
        ['🚚 Fewer trucks arrived','Supply dropped due to delays','supply-'],
        ['🌧️ Storm hit farms','Harvest smaller this month','supply-'],
        ['📺 New banana snack trend','Demand up from a trend','demand+'],
        ['⛽ Fuel price up','Transport cost increased','policy+'],
        ['🧾 Import tariff added','+10% import cost','policy+'],
        ['🍌 Big sale ended','Temporary demand cooled','demand-'],
        ['⚖️ Other fruits got pricey','Substitutes push demand to bananas','demand+'],
        ['🚢 Port congestion easing','Supply recovering soon','supply+']
      ]
    },
    fuel: {
      title: '⛽ The Fuel Spike',
      brief: {
        '6_8': 'Fuel got more expensive. Why?',
        '9_11': 'Fuel prices rose. Was it supply, demand, or policy?',
        '12_14': 'Fuel price shock—analyze global supply/demand and taxes.'
      },
      evidence: [
        ['🛢️ Output cut by producers','Global supply fell','supply-'],
        ['🛫 Holiday travel surge','Seasonal demand rise','demand+'],
        ['🧾 Fuel tax increased','Policy added cost','policy+'],
        ['🛠️ Refinery maintenance','Capacity drop','supply-'],
        ['🌍 Strong dollar','Import pricing changed','other'],
        ['🚗 EV incentives grow','Long-run demand down later','demand-'],
        ['📉 Economic slowdown','Demand softening soon','demand-'],
        ['🧯 Reserve release','Temporary supply boost','supply+']
      ]
    },
    trade: {
      title: '🚢 The Trade Swap',
      brief: {
        '6_8': 'Two countries swap toys and rice. Who gains?',
        '9_11': 'Why trade helps both sides—find the reason.',
        '12_14': 'Assess comparative advantage and terms of trade.'
      },
      evidence: [
        ['🧸 Country A makes toys efficiently','Lower opportunity cost in toys','demand+'],
        ['🍚 Country B grows rice efficiently','Lower opportunity cost in rice','demand+'],
        ['🚢 Shipping cheaper this year','Trade cost falling','policy-'],
        ['🛃 Tariffs removed','Policy boosts trade volume','policy-'],
        ['🏭 New toy factory in A','A’s productivity rose','supply+'],
        ['🌾 Good harvest in B','B’s output increased','supply+'],
        ['💱 Stable exchange rate','Predictable pricing','other'],
        ['🧪 Safety standards aligned','Lower non-tariff barriers','policy-']
      ]
    },
    notebooks: {
      title: '📓 The Notebook Price Drop',
      brief: {
        '6_8': 'Notebooks got cheaper. Why did prices fall?',
        '9_11': 'Notebook prices dropped—what changed in supply/demand?',
        '12_14': 'Explain a price fall using supply/demand and input costs.'
      },
      evidence: [
        ['🌳 Paper pulp cheaper','Input cost fell','policy-'],
        ['🏭 New factory opened','More notebooks produced','supply+'],
        ['🤖 Faster machines','Productivity up','supply+'],
        ['🎒 Students shifted to tablets','Demand down','demand-'],
        ['🧾 Sales tax cut','Policy reduced cost','policy-'],
        ['📦 Overstock clearance','Temporary sale increased supply','supply+'],
        ['📈 Population grew','Demand up for school supplies','demand+'],
        ['🛑 Strike at old plant','Short-run supply down','supply-']
      ]
    }
  };

  /* ---------- stepper visuals ---------- */
  function setStep(n){
    ['st1','st2','st3','st4'].forEach((id,i)=>{
      const el = $('#'+id);
      el.className = 'px-2 py-1 rounded ' + (i===n-1 ? 'bg-rose-100':'');
    });
    ['step1','step2','step3','step4'].forEach((id,i)=>{
      const el = $('#'+id);
      el.className = (i===n-1 ? 'mt-6 p-4 bg-white rounded-2xl shadow' : 'hidden-step mt-6 p-4 bg-white rounded-2xl shadow');
    });
    state.step = n; save(state);
  }

  /* ---------- age tier ---------- */
  let tier = state.tier || '6_8';
  function paintTier(){
    document.querySelectorAll('.age-btn').forEach(b=> b.className='age-btn pop px-3 py-2 rounded-xl bg-rose-100');
    const active = document.querySelector(`.age-btn[data-tier="${tier}"]`);
    if(active) active.className='age-btn pop px-3 py-2 rounded-xl bg-rose-600 text-white';
    renderCase();
  }
  document.querySelectorAll('.age-btn').forEach(btn=>{
    on(btn,'click', ()=>{ tier = btn.dataset.tier; state.tier = tier; save(state); paintTier(); });
  });

  /* ---------- mission selection ---------- */
  let missionId = state.mission || 'bananas';
  function renderCase(){
    const m = TIER_TEXT[missionId];
    $('#case-title').textContent = m.title;
    $('#case-brief').textContent = m.brief[tier];
    // show/hide trade map in step 3
    const tm = $('#trade-map');
    if(tm) tm.classList.toggle('hidden', missionId!=='trade');
  }
  on($('#mission'),'change', e=>{ missionId = e.target.value; state.mission = missionId; save(state); renderCase(); });

  /* ---------- evidence board ---------- */
  function makeCard([emojiText, meaning], idx){
    const div = document.createElement('div');
    div.className = 'card p-3 rounded-xl bg-rose-50 border cursor-move';
    div.draggable = true;
    div.dataset.idx = idx;
    div.innerHTML = `<div class="text-xl">${emojiText}</div><div class="text-xs text-slate-600 mt-1">${meaning}</div>`;
    on(div,'dragstart', ev=>{ ev.dataTransfer.setData('text/plain', idx); div.classList.add('opacity-70'); });
    on(div,'dragend', ()=> div.classList.remove('opacity-70'));
    return div;
  }

  function renderEvidence(){
    const holder = $('#cards'); holder.innerHTML='';
    TIER_TEXT[missionId].evidence.forEach((ev,i)=> holder.appendChild(makeCard(ev,i)));
    const tray = $('#tray'); tray.innerHTML='';
    for(let i=0;i<3;i++){
      const slot = document.createElement('div');
      slot.className='p-2 rounded-xl bg-white border text-xs text-slate-500 dropee';
      slot.textContent='Drop here';
      on(slot,'dragover', e=>e.preventDefault());
      on(slot,'drop', e=>{
        e.preventDefault();
        const idx = +e.dataTransfer.getData('text/plain');
        if(tray.querySelectorAll('.card').length>=3) return;
        const card = makeCard(TIER_TEXT[missionId].evidence[idx], idx);
        card.classList.remove('cursor-move'); card.draggable=false;
        card.dataset.idx = idx;
        slot.textContent=''; slot.appendChild(card);
        updateProceed();
      });
      tray.appendChild(slot);
    }
  }

  function chosenIndices(){
    return [...$('#tray').querySelectorAll('.card')].map(c=> +c.dataset.idx);
  }
  function chosenEvidenceText(){
    return chosenIndices().map(i => TIER_TEXT[missionId].evidence[i][0] + ' — ' + TIER_TEXT[missionId].evidence[i][1]);
  }
  function updateProceed(){ $('#to-sim').disabled = chosenIndices().length!==3; }

  /* ---------- mini-sim ---------- */
  function policyFactor(){
    let f = 1;
    if($('#tariff').checked) f *= 1.10;
    if($('#subsidy').checked) f *= 0.90;
    return f;
  }

  function recompute(){
    const S = +$('#supply').value;
    const D = +$('#demand').value;
    const base = 10; // arbitrary baseline
    let price = base * (D / S) * policyFactor();
    price = Math.max(2, Math.min(price, 30)); // clamp for UI
    const pct = Math.round(((price-2)/(30-2))*100);
    $('#meter').style.width = pct+'%';
    $('#price').textContent = '$' + price.toFixed(2);
  }

  ['supply','demand','tariff','subsidy'].forEach(id=>{
    const el = $('#'+id);
    on(el, el?.type==='range' ? 'input':'change', recompute);
  });

  /* ---------- trade map overlay ---------- */
  const COUNTRIES = {
    'USA': {lat:38, lon:-97},
    'India': {lat:20, lon:78},
    'UK': {lat:54, lon:-2},
    'Indonesia': {lat:-2, lon:118},
    'Brazil': {lat:-10, lon:-55},
    'Japan': {lat:36, lon:138}
  };
  function projXY(lat, lon){ // equirectangular onto 800x400
    const x = (lon+180)/360*800;
    const y = (90-lat)/180*400;
    return [x,y];
  }
  function drawMapRoute(){
    const wrap = $('#trade-map'); if(!wrap || wrap.classList.contains('hidden')) return;
    const A = $('#countryA').value, B = $('#countryB').value;
    const svg = $('#mapsvg'); svg.innerHTML='';
    // grid
    for(let i=1;i<8;i++){ const v=document.createElementNS('http://www.w3.org/2000/svg','line'); v.setAttribute('x1',i*100);v.setAttribute('x2',i*100);v.setAttribute('y1',0);v.setAttribute('y2',400);v.setAttribute('stroke','#eef2f7'); svg.appendChild(v); }
    for(let j=1;j<4;j++){ const h=document.createElementNS('http://www.w3.org/2000/svg','line'); h.setAttribute('y1',j*100);h.setAttribute('y2',j*100);h.setAttribute('x1',0);h.setAttribute('x2',800);h.setAttribute('stroke','#eef2f7'); svg.appendChild(h); }
    // pins
    const [xa,ya]=projXY(COUNTRIES[A].lat, COUNTRIES[A].lon);
    const [xb,yb]=projXY(COUNTRIES[B].lat, COUNTRIES[B].lon);
    const pin=(x,y,label,color)=> {
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle'); c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',6); c.setAttribute('fill',color); svg.appendChild(c);
      const t=document.createElementNS('http://www.w3.org/2000/svg','text'); t.setAttribute('x',x+8); t.setAttribute('y',y-8); t.setAttribute('font-size','12'); t.setAttribute('fill','#334155'); t.textContent=label; svg.appendChild(t);
    };
    pin(xa,ya,A,'#fb7185'); pin(xb,yb,B,'#60a5fa');
    // route (quadratic curve)
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    const cx=(xa+xb)/2, cy=Math.min(ya,yb)-40; // simple arc
    path.setAttribute('d',`M ${xa} ${ya} Q ${cx} ${cy} ${xb} ${yb}`);
    path.setAttribute('stroke','#94a3b8'); path.setAttribute('fill','none'); path.setAttribute('stroke-width','2');
    svg.appendChild(path);
  }
  function setupTradeMap(){
    const wrap=$('#trade-map'); if(!wrap) return;
    const A=$('#countryA'), B=$('#countryB');
    const opts = Object.keys(COUNTRIES).map(k=>`<option value="${k}">${k}</option>`).join('');
    A.innerHTML=opts; B.innerHTML=opts; A.value='India'; B.value='USA';
    on(A,'change',drawMapRoute); on(B,'change',drawMapRoute);
    drawMapRoute();
  }

  /* ---------- claim builder + scoring ---------- */
  function renderClaimTemplate(){
    const ev = chosenEvidenceText();
    const simPrice = $('#price').textContent || '$—';
    const template = (
`My claim:
Because ${ev[0] || '…'} and ${ev[1] || '…'}, ${ev[2] || '…'}.
In the simulator, the price showed ${simPrice}, which supports my claim.`
    );
    $('#claim').value = template;
    const list = $('#chosen'); list.innerHTML='';
    ev.forEach(t=>{
      const li=document.createElement('li'); li.textContent=t; list.appendChild(li);
    });
  }

  function directionFromSim(){
    const base=10;
    const S=+$('#supply').value, D=+$('#demand').value, f=policyFactor();
    const p = base*(D/S)*f;
    if(p>10.5) return 'up';
    if(p<9.5) return 'down';
    return 'flat';
    }

  function scoreClaim(){
    const idxs = chosenIndices();
    const evs = idxs.map(i => TIER_TEXT[missionId].evidence[i]);
    const tags = evs.map(e => e[2]); // tag list
    const simDir = directionFromSim();
    const claim = ($('#claim').value||'').toLowerCase();

    let score=0, notes=[];

    // (1) Evidence count
    if(idxs.length===3){ score++; notes.push('Picked 3 evidence ✅'); } else { notes.push('Pick exactly 3 evidence'); }

    // (2) Evidence ↔ Sim coherence
    let match=0;
    if(tags.includes('supply-') && +$('#supply').value<100) match++;
    if(tags.includes('supply+') && +$('#supply').value>100) match++;
    if(tags.includes('demand+') && +$('#demand').value>100) match++;
    if(tags.includes('demand-') && +$('#demand').value<100) match++;
    if(tags.includes('policy+') && $('#tariff').checked) match++;
    if(tags.includes('policy-') && $('#subsidy').checked) match++;
    if(match>=2){ score++; notes.push('Your evidence matches your sim settings ✅'); }
    else { notes.push('Try aligning sliders/toggles with your evidence'); }

    // (3) Claim mentions key econ words
    const kws = missionId==='trade'
      ? ['trade','advantage','export','import','cost','price']
      : ['supply','demand','price','cost','tariff','subsidy'];
    const kwHits = kws.filter(k=> claim.includes(k)).length;
    if(kwHits>=2){ score++; notes.push('Used correct words ✅'); }
    else { notes.push('Use words like '+kws.slice(0,4).join(', ')); }

    // (4) Claim direction vs sim
    const saysUp = /(up|increase|higher|rise|rising)/.test(claim);
    const saysDown = /(down|decrease|lower|fall|falling|drop)/.test(claim);
    if( (simDir==='up' && saysUp) || (simDir==='down' && saysDown) || (simDir==='flat' && !saysUp && !saysDown) ){
      score++; notes.push('Claim matches your sim direction ✅');
    } else { notes.push('Mention whether price goes up or down based on your sim'); }

    // (5) Trade extras
    if(missionId==='trade'){
      const goodRoute = $('#countryA').value !== $('#countryB').value;
      if(goodRoute){ score++; notes.push('Picked two countries and drew a route ✅'); }
      else { notes.push('Pick two different countries for trade'); }
    } else {
      // non-trade: bonus if you used both a supply AND a demand tag
      const hasSup = tags.some(t=>t.startsWith('supply'));
      const hasDem = tags.some(t=>t.startsWith('demand'));
      if(hasSup && hasDem){ score++; notes.push('Balanced supply & demand reasoning ✅'); }
    }

    // clamp to /5
    if(score>5) score=5;

    let badge=null;
    if(score>=4){
      if(missionId==='trade') badge=['Trade Navigator','🌍'];
      else if(missionId==='fuel') badge=['Price Analyst','📈'];
      else if(missionId==='notebooks') badge=['Smart Saver','💡'];
      else badge=['Detective Thinker','🕵️'];
      addBadge(badge[0], badge[1]);
    }

    const msg = `Score: ${score}/5` + (badge? ` — Badge unlocked: ${badge[1]} ${badge[0]}!`:'');
    $('#score-out').innerHTML = `<div class="p-2 rounded bg-rose-50 border"><b>${msg}</b><ul class="list-disc pl-5 mt-1 text-slate-600">${notes.map(n=>`<li>${n}</li>`).join('')}</ul></div>`;
  }

  /* ---------- export ---------- */
  function exportNotes(){
    const ev = chosenEvidenceText();
    const blob=new Blob([`NewsPlay — Mystery Mission
Mission: ${TIER_TEXT[missionId].title}
Tier: ${tier}

Evidence:
- ${ev.join('\n- ')}

Claim:
${$('#claim').value}
`],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='newsplay-mystery-notes.txt'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),300);
  }

  /* ---------- navigation ---------- */
  on($('#to-evidence'),'click', ()=>{ setStep(2); renderEvidence(); });
  on($('#back1'),'click', ()=> setStep(1));
  on($('#to-sim'),'click', ()=>{ setStep(3); recompute(); if(missionId==='trade'){ $('#trade-map').classList.remove('hidden'); setupTradeMap(); } else { $('#trade-map').classList.add('hidden'); } });
  on($('#back2'),'click', ()=> setStep(2));
  on($('#to-claim'),'click', ()=>{ setStep(4); renderClaimTemplate(); });
  on($('#btn-copy'),'click', ()=>{ navigator.clipboard.writeText($('#claim').value); });
  on($('#btn-export'),'click', exportNotes);
  on($('#btn-check'),'click', scoreClaim);
  on($('#restart'),'click', ()=>{ setStep(1); });

  /* ---------- init ---------- */
  (function init(){
    renderBadges();
    if(state.mission) $('#mission').value = state.mission;
    tier = state.tier || tier;
    paintTier();
    renderCase();
    setStep(state.step || 1);
  })();
})();
