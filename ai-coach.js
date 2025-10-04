export function initCoach(){
  const el = document.getElementById('coachContent');
  if (!el) return;
  el.innerHTML = `<div class="point">Pick a niche on the Niches tab, then click "Open AI Coach" for 3 quick wins.</div>`;
}
export function coachFromNiches(niches){
  if (!niches?.length) return ['No niches yet. Hit Refresh.'];
  const t=niches[0];
  return [
    `Today’s Hot Pick: <b>${t.niche}</b> (Score ${t.score}).`,
    `Buyer intent: <b>${t.buyerIntent}</b>. Competition: ${t.competition}.`,
    `Next: Drill down and pick 3 low-competition keywords.`
  ];
}
export function coachFromKeywords(list){
  const picks=(list||[]).slice(0,3).map(x=>`• ${x.keyword}`).join('<br/>');
  return ['3 easiest wins:', picks || 'Add more via GPT Assist.'];
}
