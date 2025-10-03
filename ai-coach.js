export function initCoach(){
  const el = document.getElementById('coachContent');
  if (el) el.innerHTML = `<div class="point">Open the Niches tab to see today’s opportunities.</div>`;
}

export function coachFromNiches(niches){
  if (!niches || !niches.length) return [
    'No niches found. Try a different seed or check the debug console.'
  ];
  const top = niches[0];
  const msg1 = `Today’s Hot Pick: <b>${top.niche}</b> (Score ${top.score}).`;
  const msg2 = `Buyer intent: <b>${top.buyerIntent}</b> — Sources: ${top.sources?top.sources.join(', '):'n/a'}.`;
  const msg3 = `Next step: Drill down and pick 3 low-competition keywords to publish this week.`;
  return [msg1,msg2,msg3];
}

export function coachFromKeywords(items){
  const low = (items||[]).filter(it => (it.competition||'low').toLowerCase().includes('low')).slice(0,3);
  const picks = low.length ? low : (items||[]).slice(0,3);
  const list = picks.map(p => `• ${p.keyword}`).join('<br/>');
  const msg1 = `3 easiest wins:`;
  const msg2 = list || 'Add more data (GPT Assist) for better picks.';
  return [msg1,msg2];
}
