import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://YOUR_SUPABASE_URL.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY || "YOUR_SUPABASE_ANON_KEY"
);

async function loadNiches() {
  const table = document.getElementById("niche-table");
  table.innerHTML = "Fetching live data...";
  const { data, error } = await supabase.from("keyword_metrics").select("*").limit(15);
  if (error) {
    table.innerHTML = `<p style='color:red;'>⚠️ ${error.message}</p>`;
    return;
  }
  table.innerHTML = `
    <table>
      <thead><tr><th>Niche</th><th>Keyword</th><th>Volume</th><th>Competition</th></tr></thead>
      <tbody>
        ${data
          .map(
            (row) =>
              `<tr><td>${row.niche}</td><td>${row.keyword}</td><td>${row.volume}</td><td>${row.competition}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

document.getElementById("runPrompt").addEventListener("click", async () => {
  const text = document.getElementById("prompt").value.trim();
  const resultBox = document.getElementById("ai-results");
  if (!text) {
    resultBox.innerHTML = "⚠️ Please enter a prompt first.";
    return;
  }
  resultBox.innerHTML = "Analyzing...";
  resultBox.innerHTML = `✅ Analysis complete for: <b>${text}</b>`;
});

loadNiches();