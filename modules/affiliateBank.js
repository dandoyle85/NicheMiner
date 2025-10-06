// modules/affiliateBank.js
const KEY_AFF = 'nm_affiliate_bank_v1';

export function loadAffiliateBank(){
  try { return JSON.parse(localStorage.getItem(KEY_AFF) || '{"global":[],"byNiche":{}}'); }
  catch(e){ return { global:[], byNiche:{} }; }
}
export function saveAffiliateBank(bank){
  localStorage.setItem(KEY_AFF, JSON.stringify(bank));
}

export function addAffiliateOffer({ niche=null, name, url, commission=null, notes='' }){
  const bank = loadAffiliateBank();
  const rec = { name, url, commission, notes, at: Date.now() };
  if (niche){
    bank.byNiche[niche] = bank.byNiche[niche] || [];
    if (!bank.byNiche[niche].some(o => o.url === url)) bank.byNiche[niche].unshift(rec);
  } else {
    if (!bank.global.some(o => o.url === url)) bank.global.unshift(rec);
  }
  saveAffiliateBank(bank);
  return bank;
}

export function offersForNiche(niche){
  const bank = loadAffiliateBank();
  const a = (bank.byNiche[niche] || []).slice(0,5);
  const g = bank.global.slice(0,5);
  return [...a, ...g].slice(0,5);
}

export function injectAffiliateTokens(html, niche){
  const offers = offersForNiche(niche);
  let out = html;
  offers.forEach(o => {
    const token = new RegExp(`\\{\\{AFFILIATE:${o.name.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&')}\\}\\}`,'g');
    out = out.replace(token, `<a href="${o.url}" rel="sponsored nofollow">${o.name}</a>`);
  });
  return out;
}
