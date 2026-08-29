let model = null;
let view = 'overview';
let selectedAsset = null;

const api = async (url, options = {}) => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));

const toast = message => {
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<b>✓</b>${escapeHtml(message)}`;
  document.body.append(node);
  setTimeout(() => node.remove(), 3400);
};

const metric = (icon, label, value, detail, tone) => 
  `<article class="metric ${tone}"><span>${icon}</span><div><small>${label}</small><b>${value}</b><em>${detail}</em></div></article>`;

const nav = () => `
  <aside>
    <div class="brand"><i><u></u><u></u><u></u></i>NETRA <strong>BLOCK</strong></div>
    <p>OPERATIONS</p>
    ${[['overview','⌂','Overview'],['planner','⌁','Block planner'],['assets','▣','Assets'],['reports','▤','Reports']].map(([id,icon,label])=>
      `<button class="nav ${view===id?'active':''}" data-view="${id}"><span>${icon}</span>${label}</button>`
    ).join('')}
    <footer>
      <span>AK</span>
      <div><b>Aditya Kumar</b><small>Control supervisor</small></div>
    </footer>
  </aside>`;

const header = (title, subhead) => `
  <header>
    <div>
      <p>SUNDAY, 30 AUGUST</p>
      <h1>${title}</h1>
      <small>${subhead}</small>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <button class="secondary" data-action="reset" title="Reset Demo Data">↺ Reset</button>
      <button class="bell" data-action="notify">♢</button>
      <button class="primary" data-view="planner">✦ Plan maintenance</button>
    </div>
  </header>`;

const demand = () => `
  <div class="demand">
    ${[34,50,44,80,67,55,92,72,45,58,36,28].map((n,i)=>`<i class="${i===6?'peak':''}" style="height:${n}%"></i>`).join('')}
  </div>
  <div class="axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
  <small class="note">● Lowest impact window begins at 01:30</small>`;

function overview(){
  const { metrics, assets } = model;
  const attention = assets.find(a => a.status !== 'Ready') || assets[1];
  return `
    ${header('Good morning, Aditya', 'Your corridor is stable. Here’s the operational picture.')}
    <section class="hero">
      <img src="/static/assets/railway-hero.png" alt="Modern train at sunrise">
      <div class="shade"></div>
      <div class="hero-copy">
        <label>● LIVE CONTROL ROOM</label>
        <h2>Keep the corridor<br>moving, intelligently.</h2>
        <p>AI identifies the lowest-impact maintenance windows before they become disruptions.</p>
        <button data-view="planner">Open today’s plan →</button>
      </div>
      <div class="network">
        <small>NETWORK HEALTH</small>
        <b>${metrics.availability}%</b>
        <span>${metrics.failed_assets ? '1 asset needs attention' : 'All key routes normal'}</span>
      </div>
    </section>
    <section class="metrics">
      ${metric('⌁','Fleet availability',metrics.availability+'%','↑ 1.2% this week','blue')}
      ${metric('◷','Blocks due today','0'+metrics.blocks_due,'1 starts in 4h 20m','amber')}
      ${metric('✓','Trains protected',metrics.protected_trains,'On-time target maintained','green')}
    </section>
    <section class="grids">
      <article class="card">
        <div class="card-head">
          <div><p>AI RECOMMENDATION</p><h3>Best maintenance window</h3></div>
          <label class="okay">98% confidence</label>
        </div>
        <div class="recommend">
          <div><b>01:30</b><span>tonight</span></div>
          <section>
            <h4>WAP-7 30765 · Traction inspection</h4>
            <p>Low demand, full reserve cover, no timetable conflicts.</p>
            <small>2h 30m block</small> <small>Delhi–Mumbai</small>
          </section>
          <button data-view="planner">→</button>
        </div>
        <a data-view="planner">Review all recommendations →</a>
      </article>
      <article class="card demand-card">
        <div class="card-head">
          <div><p>OPERATING RHYTHM</p><h3>Demand today</h3></div>
          <button>24 hours⌄</button>
        </div>
        ${demand()}
      </article>
    </section>
    <div class="section-title">
      <div><p>FLEET WATCH</p><h3>Requires your attention</h3></div>
      <a data-view="assets">View fleet →</a>
    </div>
    <article class="attention">
      <i>⚡</i>
      <div>
        <label>${attention.status === 'Failure reported' ? 'INCIDENT OPEN' : 'MAINTENANCE DUE'}</label>
        <h4>${escapeHtml(attention.id)}</h4>
        <p>${attention.status === 'Failure reported' ? 'Traction system exception · Reserve unit suggested' : 'Brake integrity check due today · Mumbai Central'}</p>
      </div>
      <section>
        <button class="secondary" data-failure="${attention.id}">
          ${attention.status === 'Failure reported' ? 'Re-trigger failure' : 'Simulate failure'}
        </button>
        <button class="primary" data-view="assets" data-select="${attention.id}">View details</button>
      </section>
    </article>`;
}

function planner(){
  const { metrics, plan } = model;
  return `
    ${header('AI Block Planner', 'Western corridor · Live operational simulation')}
    <article class="summary">
      <div>
        <p>${plan.status === 'replanned' ? 'PLAN UPDATED JUST NOW' : 'WEEK 35 · WESTERN CORRIDOR'}</p>
        <h2>${plan.status === 'replanned' ? 'A resilient route back to normal.' : 'Maintenance, without the ripple effect.'}</h2>
        <span>Schedule work when traffic is light and reserve capacity is ready.</span>
      </div>
      <div>
        <small>EST. AVAILABILITY</small>
        <b>${metrics.availability}%</b>
        <span>${plan.status === 'replanned' ? 'Protected' : 'Ready to optimize'}</span>
      </div>
    </article>
    ${metrics.failed_assets ? `
      <article class="incident">
        <b>!</b>
        <div>
          <strong>Capacity exception detected</strong>
          <p>An asset is unavailable. Replan now to preserve tomorrow’s morning peak.</p>
        </div>
        <button data-action="replan">Replan now →</button>
      </article>` : ''}
    <article class="card schedule">
      <div class="card-head">
        <div><p>RECOMMENDED SEQUENCE</p><h3>Tonight’s block plan</h3></div>
        <label class="okay">● Optimized</label>
      </div>
      <div class="timeline-head">
        <span>ASSET / WORK</span><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span>
      </div>
      ${plan.blocks.map(block => `
        <div class="block">
          <div><b>${block.asset}</b><span>${block.work}</span></div>
          <section><i class="${block.tone}" style="left:${block.left}%;width:${block.width}%">${block.time}</i></section>
        </div>
      `).join('')}
    </article>
    <section class="grids">
      <article class="card reserve">
        <p>RESERVE CAPACITY</p>
        <h3>Every route remains covered</h3>
        <div>Delhi–Mumbai <span><i style="width:88%"></i></span><b>2 units</b></div>
        <div>Mumbai Central <span><i style="width:72%"></i></span><b>1 unit</b></div>
      </article>
      <article class="card">
        <p>WHAT IF?</p>
        <h3>Test a disruption</h3>
        <small>See how the planner responds when a unit is removed from service.</small><br>
        <button class="secondary fail" data-failure="WAP-7 30765">⚠ Simulate asset failure</button>
      </article>
    </section>`;
}

function assets(){
  const { assets } = model;
  const asset = assets.find(a => a.id === selectedAsset) || assets[0];
  return `
    ${header('Fleet availability', 'Western corridor · Live operational simulation')}
    <section class="asset-grid">
      <article class="card list">
        <div class="card-head">
          <div><p>${assets.length} TRACKED ASSETS</p><h3>Fleet status</h3></div>
          <button>Filter⌄</button>
        </div>
        ${assets.map(a => `
          <button class="asset ${selectedAsset === a.id ? 'selected' : ''}" data-asset="${a.id}">
            <i class="${a.tone}">⚡</i>
            <div><b>${a.id}</b><span>${a.type} · ${a.line}</span></div>
            <label class="${a.tone}">${a.status}</label>
            <em>›</em>
          </button>
        `).join('')}
      </article>
      <article class="card detail">
        ${asset ? `
          <i class="large ${asset.tone}">⚡</i>
          <label class="${asset.tone}">${asset.status}</label>
          <p>ASSET DETAIL</p>
          <h2>${asset.id}</h2>
          <span>${asset.type} · ${asset.line}</span>
          <section class="health">
            <div><small>HEALTH SCORE</small><b>${asset.health}<em>/100</em></b></div>
            <i style="--health:${asset.health * 3.6}deg">${asset.health}%</i>
          </section>
          <div class="pair">
            <span>Next work<b>${asset.due}</b></span>
            <span>Availability<b>${asset.status === 'Ready' ? 'In service' : 'Attention'}</b></span>
          </div>
          <button class="primary full" data-failure="${asset.id}">⚠ Simulate failure</button>
        ` : `
          <div class="empty">
            <b>▣</b>
            <h3>Select an asset</h3>
            <p>Open an asset to inspect health, availability and maintenance options.</p>
          </div>
        `}
      </article>
    </section>`;
}

function reports(){
  const { metrics } = model;
  return `
    ${header('Operations reports', 'Western corridor · Live operational simulation')}
    <section class="metrics">
      ${metric('✓','On-time performance','98.3%','↑ 0.8% vs. last month','green')}
      ${metric('⌁','Availability',metrics.availability+'%','↑ 2.1% vs. last month','blue')}
      ${metric('◷','Hours recovered','41h','AI-led maintenance planning','amber')}
    </section>
    <article class="report">
      <div>
        <p>AUGUST PERFORMANCE</p>
        <h2>Operationally calmer.<br>Measurably stronger.</h2>
        <span>AI planning shifted 76% of maintenance into lower-demand intervals this month.</span><br>
        <button class="primary" data-action="download">↓ Download report</button>
      </div>
      <section>
        ${[48,62,51,74,68,89,83].map((n,i)=>`<i style="height:${n}%">${i===6?'Today':''}</i>`).join('')}
      </section>
    </article>`;
}

function render(){
  document.getElementById('app').innerHTML = `
    ${nav()}
    <main>${view === 'overview' ? overview() : view === 'planner' ? planner() : view === 'assets' ? assets() : reports()}</main>
    <nav class="mobile">
      ${[['overview','⌂','Overview'],['planner','⌁','Planner'],['assets','▣','Assets'],['reports','▤','Reports']].map(([id,icon,text])=>
        `<button class="${view===id?'active':''}" data-view="${id}"><b>${icon}</b>${text}</button>`
      ).join('')}
    </nav>`;
  listeners();
}

function listeners(){
  document.querySelectorAll('[data-view]').forEach(n => n.onclick = () => {
    view = n.dataset.view;
    if (n.dataset.select) selectedAsset = n.dataset.select;
    render();
  });
  
  document.querySelectorAll('[data-asset]').forEach(n => n.onclick = () => {
    selectedAsset = n.dataset.asset;
    render();
  });
  
  document.querySelectorAll('[data-failure]').forEach(n => n.onclick = async () => {
    try {
      const res = await api(`/api/assets/${encodeURIComponent(n.dataset.failure)}/simulate-failure`, { method: 'POST' });
      model = await api('/api/dashboard');
      view = 'assets';
      selectedAsset = n.dataset.failure;
      render();
      toast(res.message);
    } catch(e) {
      toast(e.message);
    }
  });
  
  document.querySelectorAll('[data-action="replan"]').forEach(n => n.onclick = async () => {
    try {
      const res = await api('/api/plan/replan', { method: 'POST' });
      model = await api('/api/dashboard');
      view = 'planner';
      render();
      toast(res.message || 'Plan replanned successfully');
    } catch(e) {
      toast(e.message);
    }
  });

  document.querySelectorAll('[data-action="reset"]').forEach(n => n.onclick = async () => {
    try {
      const res = await api('/api/reset', { method: 'POST' });
      model = await api('/api/dashboard');
      selectedAsset = null;
      render();
      toast(res.message);
    } catch(e) {
      toast(e.message);
    }
  });
  
  document.querySelectorAll('[data-action="notify"]').forEach(n => n.onclick = () => toast('No unacknowledged critical alerts.'));
  document.querySelectorAll('[data-action="download"]').forEach(n => n.onclick = () => toast('Monthly operations report prepared for download.'));
}

api('/api/dashboard')
  .then(data => { model = data; render(); })
  .catch(error => {
    document.getElementById('app').innerHTML = `
      <main style="padding:40px;">
        <h1>Unable to load NETRA BLOCK</h1>
        <p>${escapeHtml(error.message)}</p>
      </main>`;
  });
