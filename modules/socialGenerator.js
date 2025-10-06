// modules/socialGenerator.js

export function makeShorts({ niche, keyword }){
  const title = smartCap(`${keyword} in 30 Seconds (Quick Guide)`);
  const script = [
    `Hook: Struggling with ${keyword}?`,
    `Value: Here are 3 quick tips that actually work:`,
    `1) Tip A`,
    `2) Tip B`,
    `3) Tip C`,
    `CTA: Follow for more ${niche} wins!`
  ].join('\n');
  const hashtags = tagify([niche, keyword, 'shorts', 'tutorial', 'howto']);
  const srt = [
    '1',
    '00:00:00,000 --> 00:00:03,000',
    `Struggling with ${keyword}?`,
    '',
    '2',
    '00:00:03,000 --> 00:00:10,000',
    'Here are 3 quick tips that actually work.',
    '',
    '3',
    '00:00:10,000 --> 00:00:25,000',
    '1) Tip A  2) Tip B  3) Tip C — Follow for more!'
  ].join('\n');
  return { title, script, hashtags, srt };
}

export function makePins({ niche, keyword }){
  const q = encodeURIComponent(keyword);
  const images = [
    `https://source.unsplash.com/featured/800x1200?${q}`,
    `https://source.unsplash.com/featured/800x1200?${q},guide`,
    `https://source.unsplash.com/featured/800x1200?${q},tutorial`
  ];
  const pins = [
    {
      title: smartCap(`${keyword} — Quick Start Guide`),
      description: `Learn ${keyword} fast. Save this pin for later and level up your ${niche}.`,
      alt: `${keyword} step-by-step`
    },
    {
      title: smartCap(`Best Tools for ${keyword}`),
      description: `Top tools and tips for ${keyword}. Pin now, use later.`,
      alt: `Best tools for ${keyword}`
    },
    {
      title: smartCap(`${keyword}: Do’s & Don’ts`),
      description: `Avoid mistakes with our quick ${keyword} checklist.`,
      alt: `${keyword} checklist`
    }
  ];
  return { images, pins };
}

function smartCap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function tagify(arr){
  return [...new Set(arr.map(w => '#'+w.toLowerCase().replace(/[^a-z0-9]+/g,'')).filter(Boolean))].join(' ');
}
