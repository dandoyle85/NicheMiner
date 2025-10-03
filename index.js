import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const tableBody = document.querySelector("#leaderboard-body");
const refreshBtn = document.querySelector("#refreshBtn");

// Fetch data from Supabase
async function loadLeaderboard() {
  const { data, error } = await supabase.from("sites").select("*");

  if (error) {
    console.error("❌ Error fetching sites:", error.message);
    return;
  }

  tableBody.innerHTML = "";

  data.forEach((site) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${site.name}</td>
      <td>$${site.revenue.toLocaleString()}</td>
      <td>${site.status}</td>
    `;
    tableBody.appendChild(row);
  });
}

refreshBtn.addEventListener("click", () => {
  loadLeaderboard();
});

loadLeaderboard();
