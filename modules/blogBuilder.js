// modules/blogBuilder.js
import { titleIdeas } from './blogAdvisor.js';
import { injectAffiliateTokens } from './affiliateBank.js';

export function makeOutline({ niche, keyword, intent }){
  const h1 = capitalize(keyword);
  const sections = intent === 'Commercial'
    ? [
        'What Is It & Who Is It For',
        'Key Benefits & Use Cases',
        'How to Choose the Right Option',
        'Comparison: Top 3 (Pros/Cons)',
        'Pricing & FAQs',
        'Final Verdict'
      ]
    : [
        'Why It Matters',
        'Step-by-Step Instructions',
        'Tools & Resources',
        'Common Mistakes',
        'Pro Tips & Next Steps'
      ];
  return { h1, sections };
}

export function makeSEO({ niche, keyword }){
  const title = `${capitalize(keyword)}: Complete ${capitalize(niche)} Guide (2025)`;
  const meta = `Learn ${keyword} for ${niche}. Practical steps, tools, and comparisons.`;
  const slug = slugify(`${keyword}`);
  return { title, meta, slug };
}

export function makeInternalLinks(seedKeyword){
  const rel = [
    `Beginner guide to ${seedKeyword}`,
    `${seedKeyword} mistakes to avoid`,
    `${seedKeyword} tools compared`,
    `${seedKeyword} pricing explained`,
    `${seedKeyword} case studies`
  ];
  return rel.map(slugify);
}

export function makeHTMLDraft({ niche, keyword, outline, seo, affiliateTokenNames=[] }){
  const ideas = titleIdeas(keyword);
  const affLine = affiliateTokenNames.length
    ? `<p>Recommended: ${affiliateTokenNames.map(n=>`{{AFFILIATE:${n}}}`).join(' · ')}</p>`
    : '';

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>${escapeHTML(seo.title)}</title>
<meta name="description" content="${escapeHTML(seo.meta)}">
<link rel="canonical" href="/blog/${seo.slug}/" />
</head><body>
<article>
  <h1>${escapeHTML(outline.h1)}</h1>
  <p class="lede">${escapeHTML(seo.meta)}</p>
  ${affLine}
  ${outline.sections.map(s=>`
    <section>
      <h2>${escapeHTML(s)}</h2>
      <p><!-- intro paragraph --></p>
      <h3>Key Points</h3>
      <ul>
        <li><!-- point 1 --></li>
        <li><!-- point 2 --></li>
        <li><!-- point 3 --></li>
      </ul>
    </section>
  `).join('')}
  <section>
    <h2>Next Steps</h2>
    <ul>
      ${ideas.map(t=>`<li>${escapeHTML(t)}</li>`).join('')}
    </ul>
  </section>
</article>
<nav class="related">
  <strong>Related:</strong>
  <ul>
    ${makeInternalLinks(keyword).map(s=>`<li><a href="/blog/${s}/">${s.replace(/-/g,' ')}</a></li>`).join('')}
  </ul>
</nav>
</body></html>`;

  return injectAffiliateTokens(html, niche);
}

// helpers
function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function escapeHTML(s){ return String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
