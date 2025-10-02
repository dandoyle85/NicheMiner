// supabase-client.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = window.SUPABASE_URL || "https://YOURPROJECT.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "YOUR-ANON-KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveKeywords(list){
  if (!list || !list.length) return;
  try {
    const { data, error } = await supabase.from("keywords").insert(list);
    if (error) throw error;
    console.log("Saved to Supabase", data);
  } catch (e){ console.error("Supabase error", e); }
}

export async function getSites(){
  try{
    const { data, error } = await supabase.from("sites").select("*");
    if (error) throw error;
    const tbody=document.querySelector("#empireTable tbody");
    tbody.innerHTML="";
    data.forEach(s=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${s.name}</td><td>${s.revenue||0}</td><td>${s.status||"OK"}</td>`;
      tbody.appendChild(tr);
    });
  }catch(e){ console.error("Supabase sites error", e); }
}

window.addEventListener("DOMContentLoaded",getSites);
