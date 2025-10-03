// src/pages/niches.js
import { drilldownNiche } from "../lib/live-sources.js";
import { renderSparkline } from "../components/sparkline.js";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("drilldownBtn");
  const output = document.getElementById("nicheResults");

  if (!btn) return;

  btn.addEventListener("click", async () => {
    const siteName = document.querySelector("#selectedSite")?.innerText;
    if (!siteName) {
      output.innerHTML = "<p>Please select a site to drill down.</p>";
      return;
    }

    output.innerHTML = `
      <div class="loader"></div>
      <p class="loading-text">Fetching live keywords…</p>
    `;

    const results = await drilldownNiche(siteName);

    if (!results.length) {
      output.innerHTML = "<p>No keyword data found.</p>";
      return;
    }

    output.innerHTML = `
      <div class="fade-in">
        <table class="keyword-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Volume</th>
              <th>Competition</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            ${results
              .map(
                (r, i) => `
              <tr>
                <td>${r.keyword}</td>
                <td>${r.volume}</td>
                <td>${r.competition}</td>
                <td><canvas id="spark-${i}" width="100" height="30"></canvas></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <button id="sendToCoach">Send to AI Coach</button>
      </div>
    `;

    // Render sparklines
    results.forEach((r, i) => {
      const canvas = document.getElementById(`spark-${i}`);
      if (canvas && r.trendHistory) {
        renderSparkline(canvas, r.trendHistory);
      }
    });

    // Send results to AI Coach panel
    document.getElementById("sendToCoach")?.addEventListener("click", () => {
      const coachBox = document.getElementById("aiPromptBox");
      if (coachBox) {
        coachBox.value = `Analyze these keywords:\n${JSON.stringify(results, null, 2)}`;
      }
    });
  });
});