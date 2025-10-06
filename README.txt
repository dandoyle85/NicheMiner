NicheMiner Phase 13 (MODULAR) — Blog + YouTube + Pinterest + Affiliate

Drop the /modules/*.js files into your existing repo.

Minimal patch to main.js (2 lines):
-------------------------------------------------
import { attachQueueActions } from './modules/queueActions.js';

// after your initial renderQueue() call:
attachQueueActions();
-------------------------------------------------

Queue UI: ensure each queue item renders a container with [data-out] or this module will create one.
Buttons expected in each queue item (by data-act attribute):
- <button data-act="genBlog">Generate Blog</button>
- <button data-act="genShorts">Generate Shorts</button>
- <button data-act="genPins">Generate Pins</button>
- <button data-act="addAff">Add Affiliate</button>

Affiliate tokens:
Use {{AFFILIATE:OfferName}} inside generated HTML to auto-inject links based on your saved offers.
