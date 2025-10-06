import { logInfo, logOk, logErr, clearLog } from './modules/logger.js';
import { createSupabase } from './modules/supabaseClient.js';
import { fetchSerpKeywords } from './modules/serpFetcher.js';
import { fetchTrends } from './modules/trendFetcher.js';
import { initCoach } from './modules/aiCoach.js';

const $=(s)=>document.querySelector(s);
const statusEl=$('#status');
const tbody=document.querySelector('#nicheTable tbody');

async function getEnv(){try{const r=await fetch('/api/env');if(r.ok){return await r.json();}}catch(e){}return{SUPABASE_URL:window.CONFIG?.SUPABASE_URL||'',SUPABASE_KEY:window.CONFIG?.SUPABASE_ANON_KEY||'',SERP_API_KEY:window.CONFIG?.SERP_API_KEY||''};}

function scoreItem(it){const vol=+it.volume||1;const eng=+it.engagement||1;const trendBoost=it.trend==='up'?1.2:it.trend==='flat'?1.0:0.8;const comp=(typeof it.compIndex==='number')?(1-it.compIndex):0.5;return Math.round(10*(0.45*vol+0.35*eng+0.20)*trendBoost*(0.5+comp/2));}
function renderRows(rows){if(!rows.length){tbody.innerHTML=`<tr><td colspan='5' class='muted'>No results. Open Debug (⚙️) for details.</td></tr>`;return;}tbody.innerHTML=rows.slice(0,15).map((r,i)=>`<tr><td>${i+1}</td><td>${r.topic}</td><td>${r.score}</td><td>${r.intent||'—'}</td><td>${r.trend||'—'}</td></tr>`).join('');}

async function run(){clearLog();statusEl.textContent='Initializing...';const env=await getEnv();let supabase=null;try{supabase=createSupabase(env.SUPABASE_URL,env.SUPABASE_KEY);logOk('Supabase','Client initialized');}catch(e){logErr('Supabase','Init failed: '+e.message);}const serpKey=env.SERP_API_KEY||'';if(serpKey){logInfo('SERP','Testing connection…');}else{logInfo('SERP','No key set. Using Trends fallback.');}
statusEl.textContent='Collecting live signals…';const out=[];if(serpKey){try{const serp=await fetchSerpKeywords('drone mapping',serpKey);serp.forEach(x=>out.push(x));logOk('SERP',`Fetched ${serp.length} items`);}catch(e){logErr('SERP',e.message);}}
try{const trends=await fetchTrends();trends.forEach(x=>out.push(x));logOk('Trends',`Fetched ${trends.length} items`);}catch(e){logErr('Trends',e.message);}const seen=new Set();const ranked=out.map(it=>({...it,score:scoreItem(it)})).filter(it=>{const k=(it.topic||'').toLowerCase();if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>b.score-a.score).slice(0,15);renderRows(ranked);statusEl.textContent=`Done • ${ranked.length} niches`;}

$('#refresh').addEventListener('click',run);initCoach({openBtn:'#coachOpen',closeBtn:'#coachClose',drawer:'#coachDrawer'});
const dbg=$('#debugDrawer');$('#debugOpen').addEventListener('click',()=>{dbg.classList.toggle('hidden');dbg.setAttribute('aria-hidden',dbg.classList.contains('hidden')?'true':'false');});$('#debugClose').addEventListener('click',()=>{dbg.classList.add('hidden');dbg.setAttribute('aria-hidden','true');});
run();