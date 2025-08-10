// extras.js — extra topic cards with colored panels + mini‑quizzes (7 topics) + fallback quizzes for main cards
// Load order in index.html (at the very bottom):
//   <script src="app.js" defer></script>
//   <script src="extras.js" defer></script>

(function(){
  // 0) Helpers
  function getTier(){
    try {
      if (typeof window.getCurrentTier === 'function') return window.getCurrentTier();
      if (typeof getPrefs === 'function') { const t = (getPrefs() || {}).tier; if (t) return t; }
    } catch {}
    const activeBtn = document.querySelector('.age-btn.text-white');
    return activeBtn?.dataset?.tier || '6_8';
  }

  function speak(text){
    if (!('speechSynthesis' in window)) { alert('Text‑to‑Speech not supported in this browser.'); return; }
    const tier = getTier();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = tier === '6_8' ? 0.9 : 1;
    speechSynthesis.cancel(); speechSynthesis.speak(utter);
  }

  // 1) Extra topics (7)
  const EXTRA_STORIES = [
    {
      id: 'budget',
      title: 'What is a budget?',
      source: 'https://en.wikipedia.org/wiki/Government_budget',
      panels: {
        '6_8': [
          '🐖 Panel 1: A budget is a plan for your money—like a piggy‑bank map.',
          '📝 Panel 2: You list money coming in and money going out.',
          '🎯 Panel 3: You decide needs first, then nice‑to‑haves.'
        ],
        '9_11': [
          '📒 A budget compares income to spending so you don’t run out.',
          '⚖️ If spending is more than income, that’s a deficit; if less, a surplus.',
          '🧭 Budgets help choose priorities (save, give, spend).'
        ],
        '12_14': [
          '📑 Budgets allocate scarce resources; trade‑offs decide programs and savings.',
          '➖ Deficit = spending − income; Surplus = income − spending.',
          '🏛️ Governments publish budgets each year to plan taxes and services.'
        ]
      }
    },
    {
      id: 'fx',
      title: 'What is an exchange rate?',
      source: 'https://en.wikipedia.org/wiki/Exchange_rate',
      panels: {
        '6_8': [
          '💱 Panel 1: Different countries use different money.',
          '🔁 Panel 2: An exchange rate tells how much one money is worth in another.',
          '🧳 Panel 3: When you travel, you swap money using that rate.'
        ],
        '9_11': [
          '💵 1 US dollar might equal many rupees; this number changes over time.',
          '📉 If your money buys less of another money, it weakened (depreciated).',
          '📈 If it buys more, it strengthened (appreciated).'
        ],
        '12_14': [
          '🌊 Rates can float (markets) or be fixed/managed by policy.',
          '⚖️ Stronger currency → imports cheaper, exports harder; weaker → the reverse.',
          '🏦 Central banks and trade flows influence rates over time.'
        ]
      }
    },
    {
      id: 'recession',
      title: 'What is a recession?',
      source: 'https://en.wikipedia.org/wiki/Recession',
      panels: {
        '6_8': [
          '🐢 Panel 1: A recession is when the economy slows down.',
          '🏪 Panel 2: Shops sell less and some jobs get harder to find.',
          '🔧 Panel 3: Leaders try to help the economy speed up again.'
        ],
        '9_11': [
          '📉 A recession is when the economy shrinks for a while.',
          '👥 People spend less; businesses make less; some hiring pauses.',
          '🔁 Later, growth usually returns as spending and jobs pick up.'
        ],
        '12_14': [
          '🧮 Broad drop in output, income, jobs, and sales for months.',
          '🧰 Governments/central banks may use policy tools to support demand.',
          '📊 We track it with indicators like GDP and unemployment.'
        ]
      }
    },
    {
      id: 'unemployment',
      title: 'What is unemployment?',
      source: 'https://en.wikipedia.org/wiki/Unemployment',
      panels: {
        '6_8': [
          '👷 Panel 1: Unemployment is when grown‑ups want a job but can’t find one.',
          '🔎 Panel 2: Communities try to help people find work.',
          '📈 Panel 3: We count how many people are looking for jobs.'
        ],
        '9_11': [
          '📊 The unemployment rate shows the share of workers who are job‑hunting.',
          '⏳ Some unemployment is short while people switch jobs (frictional).',
          '🏭 Others come from skill changes or slowdowns.'
        ],
        '12_14': [
          '🧩 Types: frictional, structural (skills/location mismatch), cyclical (downturns).',
          '📈 Rate = unemployed ÷ labor force; policies aim to reduce it.',
          '🏫 Training & mobility can help lower structural unemployment.'
        ]
      }
    },
    // NEW 1: Supply & Demand
    {
      id: 'supplydemand',
      title: 'What are supply & demand?',
      source: 'https://en.wikipedia.org/wiki/Supply_and_demand',
      panels: {
        '6_8': [
          '🍎 Panel 1: Supply is how much there is. Demand is how much people want.',
          '📦 Panel 2: Lots to sell → prices can be lower.',
          '👥 Panel 3: Many people want it → prices can go up.'
        ],
        '9_11': [
          '📈 Higher demand or lower supply tends to raise prices; the reverse lowers prices.',
          '⚖️ Prices move toward a balance where buyers and sellers agree.',
          '🔁 Seasons, trends, or costs can shift supply or demand.'
        ],
        '12_14': [
          '🧮 Market price moves toward equilibrium where Qs = Qd.',
          '➡️ Shifters: income, tastes, substitutes/complements, expectations; also input costs & tech.',
          '📊 Curves shift (not just move along); shocks can cause shortages or surpluses.'
        ]
      }
    },
    // NEW 2: Stocks vs Bonds
    {
      id: 'stocksbonds',
      title: 'What are stocks and bonds?',
      source: 'https://en.wikipedia.org/wiki/Stock_(finance)',
      panels: {
        '6_8': [
          '🏢 Panel 1: A stock is a tiny piece of a company.',
          '💵 Panel 2: A bond is a promise to pay back money later with a little extra.',
          '🎯 Panel 3: People buy them to try to grow savings.'
        ],
        '9_11': [
          '📊 Stocks can go up and down a lot (riskier) but may grow more.',
          '🏦 Bonds pay steady interest and are usually steadier.',
          '🧮 A mix can balance growth and safety.'
        ],
        '12_14': [
          '📈 Stocks (equity) = ownership; may pay dividends; volatile.',
          '🏛️ Bonds (debt) = lending for interest; risks: default & rate moves.',
          '⚖️ Risk–return trade‑off: equities higher expected return with higher risk vs fixed income.'
        ]
      }
    },
    // NEW 3: Supply Chain
    {
      id: 'supplychain',
      title: 'What is a supply chain?',
      source: 'https://en.wikipedia.org/wiki/Supply_chain',
      panels: {
        '6_8': [
          '🚚 Panel 1: A supply chain is the trip a product takes from farm/factory to you.',
          '🏭 Panel 2: Many helpers—makers, trucks, ships, shops—work together.',
          '⏱️ Panel 3: If one step is slow, the whole trip can take longer.'
        ],
        '9_11': [
          '🧰 Steps: raw materials → factory → transport → warehouse → store → you.',
          '🌧️ Weather or shortages can delay parts and raise costs.',
          '💸 When costs rise, prices can rise too.'
        ],
        '12_14': [
          '🕸️ Network of suppliers, logistics, inventory systems moves goods to customers.',
          '🧱 Bottlenecks (ports, chips, energy) ripple through prices and availability.',
          '🔁 Firms balance efficiency (JIT) vs resilience (buffers, multi‑sourcing).'
        ]
      }
    }
  ];

  // 2) Color palettes per topic (so panels aren’t plain white)
  const PALETTES = {
    budget: ['bg-pink-50','bg-rose-50','bg-red-50'],
    fx: ['bg-indigo-50','bg-blue-50','bg-sky-50'],
    recession: ['bg-yellow-50','bg-amber-50','bg-orange-50'],
    unemployment: ['bg-lime-50','bg-green-50','bg-emerald-50'],
    supplydemand: ['bg-blue-50','bg-sky-50','bg-cyan-50'],
    stocksbonds: ['bg-purple-50','bg-violet-50','bg-fuchsia-50'],
    supplychain: ['bg-teal-50','bg-emerald-50','bg-green-50']
  };
  function paletteFor(id){ return PALETTES[id] || ['bg-slate-50','bg-slate-50','bg-slate-50']; }

  // 3) Mini‑quiz database (3 Q per topic)
  const QUIZ_DB = {
    budget: [
      { q:'A budget compares…', opts:['income to spending','sports to movies'], a:0 },
      { q:'Spending more than income is a…', opts:['surplus','deficit'], a:1 },
      { q:'First plan for…', opts:['needs','only fun things'], a:0 }
    ],
    fx: [
      { q:'An exchange rate tells…', opts:['how much one money is worth in another','the weather'], a:0 },
      { q:'If your money buys less foreign money, it…', opts:['depreciated','appreciated'], a:0 },
      { q:'Who influences exchange rates?', opts:['markets & central banks','librarians'], a:0 }
    ],
    recession: [
      { q:'In a recession the economy usually…', opts:['shrinks for a while','grows very fast'], a:0 },
      { q:'People often…', opts:['spend less','buy more luxury items'], a:0 },
      { q:'One way to track recessions is with…', opts:['GDP & jobs','shoe sizes'], a:0 }
    ],
    unemployment: [
      { q:'Unemployment means…', opts:['people want jobs but can’t find them','nobody wants a job'], a:0 },
      { q:'Switching between jobs is called…', opts:['frictional unemployment','magical hopping'], a:0 },
      { q:'Training and mobility help lower…', opts:['structural unemployment','ice cream prices'], a:0 }
    ],
    supplydemand: [
      { q:'Higher demand with same supply tends to…', opts:['raise prices','lower prices'], a:0 },
      { q:'The balance point is called…', opts:['equilibrium','edge point'], a:0 },
      { q:'A fall in input costs usually…', opts:['shifts supply right','shifts demand left'], a:0 }
    ],
    stocksbonds: [
      { q:'Stocks represent…', opts:['ownership in a company','a promise to pay interest only'], a:0 },
      { q:'Bonds usually…', opts:['pay interest','have no risk at all'], a:0 },
      { q:'Mixing stocks and bonds helps with…', opts:['balancing risk and return','making everything risk‑free'], a:0 }
    ],
    supplychain: [
      { q:'A supply chain is…', opts:['the path goods take to you','a type of jewelry'], a:0 },
      { q:'A bottleneck can…', opts:['slow the whole chain','make everything free'], a:0 },
      { q:'Resilience can be improved by…', opts:['backup suppliers','ignoring delays'], a:0 }
    ]
  };

  // 4) Card factory
  function createStoryCard(story){
    const wrap = document.createElement('article');
    wrap.className = 'p-5 bg-white rounded-2xl shadow';

    const ttsId = `btn-tts-${story.id}`;
    const p1 = `panel-${story.id}-1`;
    const p2 = `panel-${story.id}-2`;
    const p3 = `panel-${story.id}-3`;
    const colors = paletteFor(story.id);

    // quiz ids
    const quizId = `quiz-${story.id}`;
    const quizOut = `quiz-out-${story.id}`;

    wrap.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-xl font-bold" id="title-${story.id}">${story.title}</h3>
          <a id="src-${story.id}" class="text-xs text-indigo-600 underline" href="${story.source}" target="_blank" rel="noreferrer">Source link</a>
        </div>
        <div class="flex gap-2">
          <button id="${ttsId}" class="pop px-3 py-2 rounded-xl bg-emerald-600 text-white" title="Read aloud">🔊 Read aloud</button>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-3 gap-3">
        <div class="comic-panel rounded-xl ${colors[0]} p-3" id="${p1}"></div>
        <div class="comic-panel rounded-xl ${colors[1]} p-3" id="${p2}"></div>
        <div class="comic-panel rounded-xl ${colors[2]} p-3" id="${p3}"></div>
      </div>
      <div class="mt-4 p-3 rounded-xl bg-slate-50">
        <h4 class="font-semibold">Mini Quiz 🧠</h4>
        <div class="mt-2 space-y-2" id="${quizId}"></div>
        <button class="mt-2 pop px-3 py-2 rounded-xl bg-indigo-600 text-white" id="btn-${quizId}">Check answers</button>
        <p class="mt-2 text-sm" id="${quizOut}"></p>
      </div>
    `;

    function renderPanels(tier){
      const pan = story.panels[tier];
      document.getElementById(p1).textContent = pan[0];
      document.getElementById(p2).textContent = pan[1];
      document.getElementById(p3).textContent = pan[2];
    }

    function attachTTS(){
      const btn = wrap.querySelector('#'+ttsId);
      if (!btn) return;
      btn.addEventListener('click', ()=> speak(story.panels[getTier()].join(' ')) );
    }

    function renderQuiz(){
      const holder = wrap.querySelector('#'+quizId);
      const questions = QUIZ_DB[story.id] || [];
      holder.innerHTML = questions.map((qq, i)=>{
        const name = `q-${story.id}-${i}`;
        return `
          <div>
            <p class="text-sm font-medium">${i+1}) ${qq.q}</p>
            ${qq.opts.map((op, j)=>`<label class="text-sm block"><input type="radio" name="${name}" value="${j}"/> ${op}</label>`).join('')}
          </div>`;
      }).join('');
      const btn = wrap.querySelector('#btn-'+quizId);
      const out = wrap.querySelector('#'+quizOut);
      btn.onclick = ()=>{
        const questions = QUIZ_DB[story.id] || [];
        let score=0; let answered=0;
        questions.forEach((qq, i)=>{
          const checked = wrap.querySelector(`input[name="q-${story.id}-${i}"]:checked`);
          if (checked){ answered++; if (+checked.value === qq.a) score++; }
        });
        out.textContent = `Score: ${score}/${questions.length}`;
        if (typeof addBadge === 'function' && score === questions.length && questions.length>0){ addBadge(story.title+' Whiz','🧠'); }
      };
    }

    return { node: wrap, renderPanels, attachTTS, renderQuiz };
  }

  // 4.5) Fallback quizzes for main cards (Trade, Banks, Taxes, GDP)
  // (Only adds them if app.js didn’t already insert them.)
  const QUIZ_MAIN = {
    trade: [
      { q:'Countries trade to…', opts:['get things they don\'t make well','make everything themselves'], a:0 },
      { q:'Specialization means…', opts:['focusing on what you\'re best at','stopping trade'], a:0 },
      { q:'Imports are…', opts:['things we buy from other countries','things we sell to them'], a:0 }
    ],
    banks: [
      { q:'Banks use part of deposits to…', opts:['make loans','buy candy'], a:0 },
      { q:'Interest is…', opts:['extra money paid for borrowing','a holiday'], a:0 },
      { q:'Banks must keep part of deposits as…', opts:['reserves','recycling'], a:0 }
    ],
    taxes: [
      { q:'Taxes pay for…', opts:['public services like roads & schools','video game points'], a:0 },
      { q:'Tax on things you buy is…', opts:['sales tax / GST','plant tax'], a:0 },
      { q:'Higher incomes paying higher rates is called…', opts:['progressive','invisible'], a:0 }
    ],
    gdp: [
      { q:'GDP measures…', opts:['value of goods/services made in a country','amount of gold a country has'], a:0 },
      { q:'GDP per person is…', opts:['GDP divided by population','GDP times population'], a:0 },
      { q:'GDP does not capture everything, like…', opts:['happiness or environmental costs','any prices at all'], a:0 }
    ]
  };

  function mountMainQuiz(key, panelId, badge){
    if (document.getElementById('quiz-main-'+key)) return; // already present
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const article = panel.closest('article');
    if (!article) return;
    const holderId = `quiz-main-${key}`;
    const wrap = document.createElement('div');
    wrap.className = 'mt-4 p-3 rounded-xl bg-slate-50';
    const btnId = `btn-${holderId}`; const outId = `out-${holderId}`;
    wrap.innerHTML = `
      <h4 class="font-semibold">Mini Quiz 🧠</h4>
      <div class="mt-2 space-y-2" id="${holderId}"></div>
      <button class="mt-2 pop px-3 py-2 rounded-xl bg-indigo-600 text-white" id="${btnId}">Check answers</button>
      <p class="mt-2 text-sm" id="${outId}"></p>
    `;
    article.appendChild(wrap);
    const questions = QUIZ_MAIN[key] || [];
    const qHolder = wrap.querySelector('#'+holderId);
    qHolder.innerHTML = questions.map((qq,i)=>{
      const name = `q-${key}-${i}`;
      return `<div><p class=\"text-sm font-medium\">${i+1}) ${qq.q}</p>${qq.opts.map((op,j)=>`<label class=\"text-sm block\"><input type=\"radio\" name=\"${name}\" value=\"${j}\"/> ${op}</label>`).join('')}</div>`;
    }).join('');
    const btn = wrap.querySelector('#'+btnId); const out = wrap.querySelector('#'+outId);
    btn.onclick = ()=>{
      let score=0; const total=questions.length;
      questions.forEach((qq,i)=>{ const checked = wrap.querySelector(`input[name=\"q-${key}-${i}\"]:checked`); if(checked && +checked.value===qq.a) score++; });
      out.textContent = `Score: ${score}/${total}`;
      if (typeof addBadge === 'function' && score===total && total>0) addBadge(badge,'🧠');
    };
  }

  function ensureMainQuizzes(){
    // If app.js already mounted them, do nothing; else add.
    const ready = !!document.getElementById('panel2-1');
    if (!ready) return false;
    mountMainQuiz('trade','panel2-1','Trade Whiz');
    mountMainQuiz('banks','panel3-1','Banking Brain');
    mountMainQuiz('taxes','panel4-1','Tax Pro');
    mountMainQuiz('gdp','panel5-1','GDP Guru');
    return true;
  }

  // 5) Mount to the existing grid
  function mount(){
    const grid = document.querySelector('main section.grid');
    if (!grid) return;

    const tier = getTier();
    const registry = [];

    EXTRA_STORIES.forEach(st => {
      const card = createStoryCard(st);
      grid.appendChild(card.node);
      card.renderPanels(tier);
      card.attachTTS();
      card.renderQuiz();
      registry.push({ st, card });
    });

    // Re-render when user clicks an age button
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest && e.target.closest('.age-btn');
      if (!btn) return;
      const t = btn.dataset.tier || getTier();
      registry.forEach(({card})=> card.renderPanels(t));
    });

    // Also re-render when app.js dispatches a tierchange event
    document.addEventListener('tierchange', (e)=>{
      const t = e.detail || getTier();
      registry.forEach(({card})=> card.renderPanels(t));
    });

    // Try to ensure main quizzes exist (fallback if app.js didn’t add them)
    if (!ensureMainQuizzes()){
      // Retry a few times in case panels render a bit later
      let tries = 0; const h = setInterval(()=>{
        tries++; if (ensureMainQuizzes() || tries>10) clearInterval(h);
      }, 150);
    }
  }

  // Initialize after DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
