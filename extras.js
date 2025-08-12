// News Play — Extras.js (updated, idempotent, Canvas/GitHub‑friendly)
// Adds extra story cards to the homepage and ensures nav hygiene.
// Safe to include alongside app.js; won’t duplicate if loaded twice.

(function(){
  'use strict';

  /***********************
   * 0) Tiny utilities
   ***********************/
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }
  function getTier(){
    // Prefer active age button; fallback to stored preference
    var active = $('.age-btn.text-white');
    if (active && active.dataset && active.dataset.tier) return active.dataset.tier;
    try{
      var p = JSON.parse(localStorage.getItem('np_prefs_v1')||'{}');
      return p.tier || '6_8';
    }catch(_){ return '6_8'; }
  }

  function speak(txt){
    if(!('speechSynthesis' in window)) return;
    try{ var u = new SpeechSynthesisUtterance(txt); u.rate = getTier()==='6_8'?0.9:1; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(_){ }
  }

  /***********************
   * 1) Extra stories data
   ***********************/
  // Each story has: id, title, source, panels{tier:[a,b,c]}, quiz{q,choices[],answer}
  var EXTRA_STORIES = [
    {
      id:'budget',
      title:'What is a budget? 💰',
      source:{href:'https://en.wikipedia.org/wiki/Budget', label:'Source link'},
      colors:['bg-amber-50','bg-yellow-50','bg-orange-50'],
      panels:{
        '6_8':['A budget is a simple plan for money.','List what you earn and spend.','Save a little for later.'],
        '9_11':['Track income and expenses.','Sort needs vs wants.','Set a savings goal (e.g., 10%).'],
        '12_14':['Plan cash‑flows by category.','Prioritize fixed vs variable costs.','Pay yourself first: automate saving.']
      },
      quiz:{q:'A budget mainly helps you…',choices:['Spend more now','Track money and plan','Ignore savings'],answer:'Track money and plan'}
    },
    {
      id:'fx',
      title:'What is an exchange rate? 🌐',
      source:{href:'https://en.wikipedia.org/wiki/Exchange_rate', label:'Source link'},
      colors:['bg-sky-50','bg-cyan-50','bg-teal-50'],
      panels:{
        '6_8':['It tells how much one country’s money is worth in another.','You swap money when visiting places.','The number can change every day.'],
        '9_11':['Price of one currency in another.','More buyers can push a currency up.','Rates move with trade and news.'],
        '12_14':['Currency price set in FX markets.','Driven by rates, inflation, flows.','Float vs peg; bid/ask spreads.']
      },
      quiz:{q:'If INR strengthens vs USD, imported goods in INR may…',choices:['Be cheaper','Be more expensive','Stay the same always'],answer:'Be cheaper'}
    },
    {
      id:'recession',
      title:'What is a recession? 📉',
      source:{href:'https://en.wikipedia.org/wiki/Recession', label:'Source link'},
      colors:['bg-rose-50','bg-pink-50','bg-rose-100'],
      panels:{
        '6_8':['A time when many shops sell less.','Some people lose jobs.','The country makes less stuff for a while.'],
        '9_11':['Big slowdown in spending and jobs.','Fewer new projects start.','Governments may try to help.'],
        '12_14':['Broad decline in activity (output/jobs).','Demand falls; investment cools.','Policy may cut rates or raise spending.']
      },
      quiz:{q:'During recessions, unemployment usually…',choices:['Goes up','Goes down','Never changes'],answer:'Goes up'}
    },
    {
      id:'unemployment',
      title:'What is unemployment? 🧑‍🏭',
      source:{href:'https://en.wikipedia.org/wiki/Unemployment', label:'Source link'},
      colors:['bg-lime-50','bg-green-50','bg-emerald-50'],
      panels:{
        '6_8':['People who want jobs but cannot find one.','They keep looking for work.','Training can help people get jobs.'],
        '9_11':['Job seekers without jobs (but available).','Can be short or long.','Skills and location matter.'],
        '12_14':['Share of labor force not employed.','Frictional, structural, cyclical types.','Measured by surveys; varies by age/region.']
      },
      quiz:{q:'Someone not looking for a job is counted as…',choices:['Unemployed','Not in the labor force','Employed'],answer:'Not in the labor force'}
    },
    {
      id:'supplydemand',
      title:'What are supply & demand? ⚖️',
      source:{href:'https://en.wikipedia.org/wiki/Supply_and_demand', label:'Source link'},
      colors:['bg-indigo-50','bg-blue-50','bg-violet-50'],
      panels:{
        '6_8':['Supply: how much sellers bring.','Demand: how much people want.','Price moves to balance them.'],
        '9_11':['Shifters move curves left/right.','Equilibrium is where they meet.','Shocks cause new prices/quantities.'],
        '12_14':['Elasticity changes slope/impact.','Policy can cap or floor prices.','Expectations shift curves too.']
      },
      quiz:{q:'If demand rises and supply stays the same, price tends to…',choices:['Go up','Go down','Stay fixed'],answer:'Go up'}
    },
    {
      id:'stocksbonds',
      title:'What are stocks & bonds? 📈',
      source:{href:'https://en.wikipedia.org/wiki/Stock', label:'Source link'},
      colors:['bg-fuchsia-50','bg-purple-50','bg-violet-50'],
      panels:{
        '6_8':['Stock: tiny piece of a company.','Bond: a loan you give to someone.','Both can help money grow over time.'],
        '9_11':['Stocks can rise/fall with profits.','Bonds pay interest until maturity.','Diversifying can lower risk.'],
        '12_14':['Equity (ownership) vs debt (lending).','Return vs risk trade‑off.','Price moves with news/discount rates.']
      },
      quiz:{q:'A bond is closest to…',choices:['A loan','A slice of ownership','A coupon for shopping'],answer:'A loan'}
    },
    {
      id:'supplychain',
      title:'What is a supply chain? 🛤️',
      source:{href:'https://en.wikipedia.org/wiki/Supply_chain', label:'Source link'},
      colors:['bg-amber-50','bg-emerald-50','bg-teal-50'],
      panels:{
        '6_8':['A path things travel from makers to you.','Trucks/ships move parts and goods.','If one step stops, others wait.'],
        '9_11':['Steps: raw parts → factory → store → home.','Delays can slow everything.','Planning helps keep it flowing.'],
        '12_14':['Network of suppliers/logistics/retail.','Bottlenecks ripple through output.','Resilience via buffers & dual sourcing.']
      },
      quiz:{q:'A “bottleneck” in a supply chain means…',choices:['Things move faster','A tight spot slows the whole line','Prices always fall'],answer:'A tight spot slows the whole line'}
    }
  ];

  /****************************************
   * 2) DOM builders (card + quiz + TTS)
   ****************************************/
  function createStoryCard(st){
    var art = document.createElement('article');
    art.className = 'p-5 bg-white rounded-2xl shadow';

    var html = ''+
      '<div class="flex items-start justify-between gap-3">'+
        '<div>'+
          '<h3 class="text-xl font-bold" id="title-'+st.id+'">'+st.title+'</h3>'+
          '<a class="text-xs text-indigo-600 underline" href="'+st.source.href+'" target="_blank" rel="noreferrer">'+st.source.label+'</a>'+
        '</div>'+
        '<div class="flex gap-2">'+
          '<button id="btn-tts-'+st.id+'" class="pop px-3 py-2 rounded-xl bg-emerald-600 text-white" title="Read aloud">🔊 Read aloud</button>'+
        '</div>'+
      '</div>'+
      '<div class="mt-4 grid grid-cols-3 gap-3">'+
        '<div class="comic-panel rounded-xl '+(st.colors[0]||'bg-slate-50')+' p-3" id="panel-'+st.id+'-1"></div>'+
        '<div class="comic-panel rounded-xl '+(st.colors[1]||'bg-slate-50')+' p-3" id="panel-'+st.id+'-2"></div>'+
        '<div class="comic-panel rounded-xl '+(st.colors[2]||'bg-slate-50')+' p-3" id="panel-'+st.id+'-3"></div>'+
      '</div>'+
      '<div class="mt-5 p-3 rounded-2xl bg-slate-50" id="quiz-'+st.id+'">'+
        '<h4 class="font-semibold">Quick Quiz 🧠</h4>'+
        '<div class="mt-2 space-y-2"></div>'+
        '<button class="mt-2 pop px-3 py-2 rounded-xl bg-indigo-600 text-white">Check answers</button>'+
        '<p class="mt-2 text-sm text-slate-700"></p>'+
      '</div>';

    art.innerHTML = html;

    // Methods
    function renderPanels(tier){
      var lines = (st.panels[tier] || st.panels['6_8'] || []);
      var p1 = $('#panel-'+st.id+'-1', art);
      var p2 = $('#panel-'+st.id+'-2', art);
      var p3 = $('#panel-'+st.id+'-3', art);
      if(p1) p1.textContent = lines[0] || '';
      if(p2) p2.textContent = lines[1] || '';
      if(p3) p3.textContent = lines[2] || '';
    }

    function attachTTS(){
      var btn = $('#btn-tts-'+st.id, art);
      if(!btn) return;
      btn.addEventListener('click', function(){
        var tier = getTier();
        var lines = (st.panels[tier] || st.panels['6_8'] || []);
        speak(st.title.replace(/\s*[\p{Emoji_Presentation}\p{Extended_Pictographic}].*$/u,'')+': '+lines.filter(Boolean).join('. '));
      });
    }

    function renderQuiz(){
      var box = $('#quiz-'+st.id+' .space-y-2', art);
      var btn = $('#quiz-'+st.id+' button', art);
      var out = $('#quiz-'+st.id+' p', art);
      if(!box || !btn || !out) return;
      // Single multiple-choice per card (kid-friendly)
      var name = 'q_'+st.id;
      var q = st.quiz.q;
      var choices = st.quiz.choices;
      box.innerHTML = '<p class="text-sm font-medium">'+q+'</p>'+
        choices.map(function(c){ return '<label class="text-sm block"><input type="radio" name="'+name+'" value="'+c.replace(/"/g,'&quot;')+'"> '+c+'</label>'; }).join('');
      btn.addEventListener('click', function(){
        var sel = $('input[name="'+name+'"]:checked', art);
        if(!sel){ out.textContent = 'Pick an option!'; out.className='mt-2 text-sm text-rose-600'; return; }
        var ok = (sel.value === st.quiz.answer);
        out.textContent = ok ? 'Nice! ✅' : 'Almost — correct: '+st.quiz.answer;
        out.className = 'mt-2 text-sm '+(ok?'text-emerald-700':'text-amber-700');
      });
    }

    return {
      node: art,
      renderPanels: renderPanels,
      attachTTS: attachTTS,
      renderQuiz: renderQuiz
    };
  }

  /****************************************
   * 3) Mount logic (idempotent)
   ****************************************/
  function findGrid(){
    // Try several robust selectors; pick the last grid in <main>
    var grids = $all('main section.grid');
    if (grids.length) return grids[grids.length-1];
    return $('main'); // fallback — still append, layout will stack
  }

  function ensureNav(){
    var nav = $('header nav, #nav-strip');
    if(!nav) return;
    // Remove Learn Deck if present
    var ld = nav.querySelector('a[href$="learn-deck.html"]');
    if(ld) ld.remove();
    // Ensure Mystery Missions exists once
    if(!nav.querySelector('[data-nav="mystery"]')){
      var a = document.createElement('a');
      a.href = 'mystery.html';
      a.className = 'pop px-3 py-2 rounded-xl bg-rose-100 whitespace-nowrap';
      a.textContent = '🕵️ Mystery Missions';
      a.setAttribute('data-nav','mystery');
      nav.appendChild(a);
    }
  }

  function mount(){
    // Idempotent guard: prevents duplicate cards if script runs twice
    if (window.__NP_EXTRAS_MOUNTED) return; 
    window.__NP_EXTRAS_MOUNTED = true;

    ensureNav();

    var grid = findGrid();
    if(!grid){ console.warn('[extras] grid not found'); return; }

    var tier = getTier();
    var registry = [];

    EXTRA_STORIES.forEach(function(st){
      // Skip if already present (e.g., due to a previous run)
      if ($('#title-'+st.id)) return;
      var card = createStoryCard(st);
      grid.appendChild(card.node);
      card.renderPanels(tier);
      card.attachTTS();
      card.renderQuiz();
      registry.push(card);
    });

    // Late fallback: if any panel still empty, fill it
    setTimeout(function(){
      var t = getTier();
      registry.forEach(function(card){ card.renderPanels(t); });
    }, 300);

    // Re-render on age button click or custom tierchange
    document.addEventListener('click', function(e){
      var b = e.target && e.target.closest && e.target.closest('.age-btn');
      if(!b) return;
      var t = b.dataset.tier || getTier();
      registry.forEach(function(card){ card.renderPanels(t); });
    });
    document.addEventListener('tierchange', function(ev){
      var t = (ev && ev.detail) || getTier();
      registry.forEach(function(card){ card.renderPanels(t); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
