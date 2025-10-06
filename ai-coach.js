const coach = document.getElementById('coachDrawer');
document.getElementById('openCoach')?.addEventListener('click', () => coach.classList.add('open'));
document.getElementById('closeCoach')?.addEventListener('click', () => coach.classList.remove('open'));

const PROMPT = `Act as a niche-research strategist for AdSense + affiliate.
Return a Markdown table:
| Niche | Score (0-100) | Intent (Low/Med/High) | Trend (↑/→/↓)
Only include monetizable niches with consistent demand. Use recency and CPC in your scoring.`;

document.getElementById('copyPrompt')?.addEventListener('click', async () => {
  await navigator.clipboard.writeText(PROMPT);
  alert('Prompt copied! Paste into ChatGPT Pro, then import the table here.');
});

document.getElementById('importTable')?.addEventListener('click', () => {
  const raw = document.getElementById('gptPaste').value.trim();
  if (!raw) return alert('Paste a Markdown table first.');

  const lines = raw.split('\n').filter(l => /\|/.test(l)).slice(2);
  const rows = lines.map(l => l.split('|').map(s => s.trim())).map(cols => ({
    niche: cols[1] || '',
    score: Number((cols[2] || '0').replace(/[^\d.]/g,'')) || 0,
    intent: cols[3] || '',
    trend: cols[4] || '',
    source: 'GPT'
  })).filter(r => r.niche);

  if (typeof window.__addGPTNiches === 'function') {
    window.__addGPTNiches(rows);
  }
});