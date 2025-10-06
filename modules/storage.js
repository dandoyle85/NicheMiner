// modules/storage.js
const KEY_QUEUE = 'nm_queue_v1';
export function loadQueue(){
  try { return JSON.parse(localStorage.getItem(KEY_QUEUE)||'[]'); } catch(e){ return []; }
}
export function saveQueue(list){
  localStorage.setItem(KEY_QUEUE, JSON.stringify(list.slice(0,200)));
}
export function enqueue(item){
  const list = loadQueue();
  const id = (item.niche+'|'+item.keyword).toLowerCase();
  if (!list.some(x => (x.niche+'|'+x.keyword).toLowerCase()===id)){
    list.unshift({...item, at: Date.now()});
    saveQueue(list);
  }
  return list;
}
