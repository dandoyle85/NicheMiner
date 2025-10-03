// empire.js — Phase 8.2.1
import { supabase, mockMode, mockSites } from './src/lib/supabase.js';

export async function getSites(){
  const tbody=document.querySelector("#empireTable tbody");
  tbody.innerHTML="";
  if(mockMode){
    console.log("⚠️ Empire using MOCK sites");
    mockSites.forEach(s=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${s.name}</td><td>${s.revenue}</td><td>${s.status}</td>`;
      tbody.appendChild(tr);
    });
  } else {
    try{
      const { data, error } = await supabase.from("sites").select("*");
      if (error) throw error;
      data.forEach(s=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${s.name}</td><td>${s.daily_rev || 0}</td><td>${s.status || "OK"}</td>`;
        tbody.appendChild(tr);
      });
    }catch(e){ console.error("Supabase sites error", e); }
  }
}

window.addEventListener("DOMContentLoaded",getSites);
