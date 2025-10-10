// app-suggests-replacement.js
// Sample snippet to wire the no-API suggestions into your app.
// Replace or merge into your existing app.js where suggestion fetching occurs.

// Example selectors - adjust to match your DOM
const SUG_INPUT = document.querySelector('#niche-input');
const SUG_CONTAINER = document.querySelector('#suggestions-list');

function renderSuggestions(list) {
  if (!SUG_CONTAINER) return;
  SUG_CONTAINER.innerHTML = '';
  if (!list || list.length === 0) {
    SUG_CONTAINER.innerHTML = '<div class="nm-no-suggestions">No suggestions</div>';
    return;
  }
  const frag = document.createDocumentFragment();
  list.forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nm-suggestion-item';
    btn.textContent = s;
    btn.addEventListener('click', () => {
      if (SUG_INPUT) SUG_INPUT.value = s;
      // call your keyword loader here, e.g., loadKeywords(s)
      if (typeof loadKeywords === 'function') loadKeywords(s);
    });
    frag.appendChild(btn);
  });
  SUG_CONTAINER.appendChild(frag);
}

let debounceTimer = null;
if (SUG_INPUT) {
  SUG_INPUT.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const v = e.target.value;
    debounceTimer = setTimeout(async () => {
      const suggestions = await window.getSuggestionsNoAPI ? getSuggestionsNoAPI(v) : [];
      renderSuggestions(suggestions);
    }, 200);
  });
}
