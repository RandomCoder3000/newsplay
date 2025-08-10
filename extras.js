// extras.js — add more topics without changing your current index.html
// How to use: add this line just before </body> in index.html (AFTER the big inline <script>):
//   <script src="extras.js" defer></script>

(function(){
  // 0) Helpers
  function getTier(){
    try {
      // Prefer saved preference from main app
      if (typeof getPrefs === 'function') {
        const t = (getPrefs() || {}).tier; if (t) return t;
      }
    } catch {}
    // Fallback to the currently highlighted button (has text-white class) or default
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

  // 1) Extra topics
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
          '⚖️ A stronger currency makes imports cheaper, exports harder; the reverse for a weaker one.',
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
          '🧮 It’s a broad drop in output, income, jobs, and sales for months.',
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
    }
  ];

  // 2) Card factory
  function createStoryCard(story){
    const wrap = document.createElement('article');
    wrap.className = 'p-5 bg-white rounded-2xl shadow';

    const ttsId = `btn-tts-${story.id}`;
    const p1 = `panel-${story.id}-1`;
    const p2 = `panel-${story.id}-2`;
    const p3 = `panel-${story.id}-3`;

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
        <div class="comic-panel rounded-xl bg-slate-50 p-3" id="${p1}"></div>
        <div class="comic-panel rounded-xl bg-slate-50 p-3" id="${p2}"></div>
        <div class="comic-panel rounded-xl bg-slate-50 p-3" id="${p3}"></div>
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

    return { node: wrap, renderPanels, attachTTS };
  }

  // 3) Mount to the existing grid
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
      registry.push({ st, card });
    });

    // Re-render when user clicks an age button
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest && e.target.closest('.age-btn');
      if (!btn) return;
      const t = btn.dataset.tier || getTier();
      registry.forEach(({card})=> card.renderPanels(t));
    });
  }

  // Initialize after DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
