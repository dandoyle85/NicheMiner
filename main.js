// ✅ NicheMiner main client — Cloudflare Pages compatible
import { supabase } from "./supabase.js";

// Check env injection
console.log("ENV Vars →", import.meta.env);

const app = document.querySelector("#app");
app.innerHTML = `<h2>🔥 Top 15 Profitable Niches (Live)</h2>
<p>Loading niches...</p>`;

// Example: Fetch live data from Supabase table “sites”
async function loadSites() {
  try {
    const { data, error } = await supabase.from("sites").select("*").order("revenue", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      app.innerHTML = `<h2>🔥 Top 15 Profitable Niches (Live)</h2><p>No data found in Supabase.</p>`;
      return;
    }

    const list = data
      .map(
        (site, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${site.name}</td>
          <td>$${site.revenue}</td>
          <td>${site.status}</td>
        </tr>`
      )
      .join("");

    app.innerHTML = `
      <h2>🔥 Top 15 Profitable Niches (Live)</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Site</th><th>Revenue</th><th>Status</th></tr>
        </thead>
        <tbody>${list}</tbody>
      </table>
    `;
  } catch (err) {
    console.error("⚠️ Supabase fetch failed:", err);
    app.innerHTML = `<p style="color:red">Error fetching live data. Check browser console for details.</p>`;
  }
}

// Trigger load on start
loadSites();
