// modules/queueActions.js
// Minimal patch module to avoid rewriting your main.js entirely.
// After you render the queue, call attachQueueActions().

import { titleIdeas } from './blogAdvisor.js';
import { makeOutline, makeSEO, makeHTMLDraft } from './blogBuilder.js';
import { offersForNiche, addAffiliateOffer } from './affiliateBank.js';
import { makeShorts, makePins } from './socialGenerator.js';
import { loadQueue } from './storage.js';

export function attachQueueActions(){
  const box = document.querySelector('#queueList');
  if (!box) return;

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const host = btn.closest('.niche-item');
    const titleEl = host?.querySelector('.niche-title');
    const metaEl = host?.querySelector('.niche-meta');
    if (!titleEl || !metaEl) return;

    const keyword = titleEl.textContent.trim();
    const niche = (metaEl.textContent.replace(/^from:\s*/,'')).trim();

    // find queue item
    const q = loadQueue();
    const item = q.find(x => x.keyword === keyword && x.niche === niche) || { keyword, niche, score: 60, intent: 'Informational' };

    const out = host.querySelector('[data-out]') || (()=>{
      const ns = document.createElement('div'); ns.className='kwd-titles'; ns.setAttribute('data-out','');
      host.appendChild(ns); return ns;
    })();

    const act = btn.dataset.act;

    if (act === 'genBlog'){
      const outline = makeOutline(item);
      const seo = makeSEO(item);
      const offers = offersForNiche(item.niche);
      const html = makeHTMLDraft({ niche:item.niche, keyword:item.keyword, outline, seo, affiliateTokenNames: offers.map(o=>o.name) });
      out.innerHTML = `<strong>HTML draft (copy to CMS):</strong><pre style="white-space:pre-wrap;overflow:auto;max-height:240px;border:1px solid #1f2a35;padding:.6rem">${escapeHTML(html)}</pre>`;
    }

    if (act === 'genShorts'){
      const s = makeShorts(item);
      out.innerHTML = `
        <strong>YouTube Shorts:</strong>
        <p><em>Title</em>: ${escapeHTML(s.title)}<br/><em>Hashtags</em>: ${escapeHTML(s.hashtags)}</p>
        <strong>Script</strong><pre style="white-space:pre-wrap;overflow:auto;max-height:200px;border:1px solid #1f2a35;padding:.6rem">${escapeHTML(s.script)}</pre>
        <strong>Captions (.srt)</strong><pre style="white-space:pre-wrap;overflow:auto;max-height:200px;border:1px solid #1f2a35;padding:.6rem">${escapeHTML(s.srt)}</pre>
      `;
    }

    if (act === 'genPins'){
      const p = makePins(item);
      out.innerHTML = `
        <strong>Pinterest Pins (3):</strong>
        <div style="display:grid;gap:.6rem">
          ${p.pins.map((pin, i)=>`
            <div>
              <div><em>Title</em>: ${escapeHTML(pin.title)}</div>
              <div><em>Description</em>: ${escapeHTML(pin.description)}</div>
              <div><em>Alt</em>: ${escapeHTML(pin.alt)}</div>
              <div><em>Image</em>: <a href="${p.images[i]}" target="_blank">${p.images[i]}</a></div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (act === 'addAff'){
      const name = prompt('Offer name (e.g., DroneDeploy Trial)');
      const url = name ? prompt('Signup/affiliate URL') : null;
      if (name && url){
        addAffiliateOffer({ niche:item.niche, name, url });
        alert('Affiliate saved for this niche.');
      }
    }
  });
}

function escapeHTML(s){ return String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
