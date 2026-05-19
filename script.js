console.log("SCRIPT LOADED");

const BACKEND_URL = "https://gohan-backend.onrender.com";

async function getRecommendations() {
    const ingredientsInput = document.getElementById("ingredients");
    const resultsDiv       = document.getElementById("results");
    const loadingDiv       = document.getElementById("loading");
    const ingredients      = ingredientsInput.value.trim();

    if (!ingredients) { ingredientsInput.focus(); return; }

    resultsDiv.innerHTML = "";
    loadingDiv?.classList.remove("hidden");

    try {
        const response = await fetch(`${BACKEND_URL}/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ ingredients, top_k: 6 })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log(data);
        loadingDiv?.classList.add("hidden");

        if (!data.recipes || data.recipes.length === 0) {
            resultsDiv.innerHTML = `
                <div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--muted);font-style:italic;">
                    No meals found.
                </div>`;
            return;
        }

        data.recipes.forEach((meal, i) => {
            const score          = data.scores?.[i] ?? 0;
            const pct            = Math.round(score * 100);
            const name           = meal.Title ?? "Unknown";
            const image          = meal.Image_URL ?? "";
            const instructions   = meal.Instructions ?? "";
            const ingredientsText = meal.Ingredients ?? "";

            const card = document.createElement("div");
            card.className = "meal-card";
            card.style.animationDelay = `${i * 0.07}s`;

            card.innerHTML = `
                <img src="${image}" alt="${name}" class="meal-image">
                <p class="meal-name">${name}</p>
                <p class="meal-match">Match score — ${pct}%</p>
                <div class="match-bar-wrap">
                    <div class="match-bar" style="width:0%" data-width="${pct}%"></div>
                </div>
                <p class="meal-description">${instructions.substring(0, 120)}...</p>
            `;

            card.addEventListener("click", () => {
                openRecipeModal(name, image, ingredientsText, instructions);
            });

            resultsDiv.appendChild(card);
        });

        requestAnimationFrame(() => {
            document.querySelectorAll(".match-bar").forEach(bar => {
                bar.style.width = bar.dataset.width;
            });
        });

    } catch (err) {
        console.error(err);
        loadingDiv?.classList.add("hidden");
        resultsDiv.innerHTML = `
            <div style="grid-column:1/-1;padding:48px;text-align:center;color:red;font-family:monospace;font-size:0.75rem;">
                ${err.message}
            </div>`;
    }
}

// =====================================================
// HELPERS — parse the Python-list-string from backend
// =====================================================

/**
 * Turns  "['1/2 cup flour', '2 eggs', ...]"  into  ["1/2 cup flour", "2 eggs", …]
 * Falls back to splitting on commas if it doesn't look like a list literal.
 */
function parseIngredientsList(raw) {
    const s = raw.trim();

    // Looks like a Python list literal: ['a', 'b', ...]
    if (s.startsWith("[") && s.endsWith("]")) {
        try {
            // Replace single-quoted items with double-quoted so JSON.parse works
            const jsonLike = s
                .replace(/^'|'$/g, '"')               // outer quotes (rare)
                .replace(/'/g, '"');                   // all single → double
            return JSON.parse(jsonLike);
        } catch {
            // fallback: strip brackets, split on  ', '
            return s
                .slice(1, -1)
                .split(/,\s*'|',\s*/)
                .map(x => x.replace(/^['"\s]+|['"\s]+$/g, ""))
                .filter(Boolean);
        }
    }

    // Plain comma / newline separated text
    return s.split(/\n|,(?=\s)/).map(x => x.trim()).filter(Boolean);
}

/**
 * Splits instructions into numbered steps.
 * Handles:  "1. Do this. 2. Do that."  or  bare sentences.
 */
function parseInstructionSteps(raw) {
    const s = raw.trim();

    // Already has numbered steps like "1. … 2. …"
    const numbered = s.match(/\d+\.\s+.+?(?=\d+\.\s+|$)/gs);
    if (numbered && numbered.length > 1) {
        return numbered.map(step => step.replace(/^\d+\.\s*/, "").trim());
    }

    // Fall back: split on double-newlines, then single newlines
    const byNewline = s.split(/\n{2,}/).flatMap(p => p.split(/\n/)).map(x => x.trim()).filter(Boolean);
    return byNewline.length > 1 ? byNewline : [s];
}

// =====================================================
// MODAL
// =====================================================

function openRecipeModal(title, image, ingredientsRaw, instructionsRaw) {
    const existingModal = document.getElementById("recipe-modal");
    if (existingModal) existingModal.remove();

    // ── Parse data ──────────────────────────────────
    const ingredientsList = parseIngredientsList(ingredientsRaw);
    const steps           = parseInstructionSteps(instructionsRaw);

    // ── Build ingredient items HTML ──────────────────
    const ingredientsHTML = ingredientsList
        .map(item => `<li class="recipe-ingredient-item">${item}</li>`)
        .join("");

    // ── Build step items HTML ────────────────────────
    const stepsHTML = steps
        .map((step, i) => `
            <div class="recipe-step">
                <span class="recipe-step-num">${i + 1}</span>
                <p class="recipe-step-text">${step}</p>
            </div>`)
        .join("");

    // ── Assemble modal ───────────────────────────────
    const modal = document.createElement("div");
    modal.id = "recipe-modal";

    modal.innerHTML = `
        <div class="recipe-modal-overlay">
            <div class="recipe-modal-content">

                <button class="recipe-close-btn" aria-label="Close">×</button>

                <div class="recipe-hero">
                    <img src="${image}" alt="${title}" class="recipe-modal-image">
                    <div class="recipe-hero-gradient"></div>
                    <h2 class="recipe-modal-title">${title}</h2>
                </div>

                <div class="recipe-body">

                    <section class="recipe-section">
                        <h3 class="recipe-section-heading">
                            <span class="recipe-section-icon">🧂</span> Ingredients
                            <span class="recipe-ingredient-count">${ingredientsList.length} items</span>
                        </h3>
                        <ul class="recipe-ingredients-list">
                            ${ingredientsHTML}
                        </ul>
                    </section>

                    <section class="recipe-section">
                        <h3 class="recipe-section-heading">
                            <span class="recipe-section-icon">📋</span> Instructions
                            <span class="recipe-ingredient-count">${steps.length} steps</span>
                        </h3>
                        <div class="recipe-steps">
                            ${stepsHTML}
                        </div>
                    </section>

                </div>
            </div>
        </div>

        <style>
            /* ── Overlay ── */
            #recipe-modal {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .recipe-modal-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.65);
                backdrop-filter: blur(6px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                animation: overlayIn 0.25s ease;
            }

            @keyframes overlayIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }

            /* ── Card ── */
            .recipe-modal-content {
                position: relative;
                background: var(--card, #1a1a1a);
                border-radius: 20px;
                width: 100%;
                max-width: 640px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 32px 80px rgba(0,0,0,0.55);
                animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            @keyframes modalIn {
                from { opacity: 0; transform: translateY(24px) scale(0.96); }
                to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }

            /* ── Close button ── */
            .recipe-close-btn {
                position: absolute;
                top: 14px;
                right: 14px;
                z-index: 10;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: rgba(0,0,0,0.45);
                color: #fff;
                font-size: 1.4rem;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.15s, transform 0.15s;
            }
            .recipe-close-btn:hover {
                background: rgba(0,0,0,0.75);
                transform: scale(1.1);
            }

            /* ── Hero image ── */
            .recipe-hero {
                position: relative;
                height: 220px;
                flex-shrink: 0;
                overflow: hidden;
            }
            .recipe-modal-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .recipe-hero-gradient {
                position: absolute;
                inset: 0;
                background: linear-gradient(
                    to bottom,
                    transparent 30%,
                    rgba(0,0,0,0.78) 100%
                );
            }
            .recipe-modal-title {
                position: absolute;
                bottom: 16px;
                left: 20px;
                right: 52px;
                margin: 0;
                font-size: clamp(1.1rem, 4vw, 1.5rem);
                font-weight: 700;
                color: #fff;
                line-height: 1.2;
                text-shadow: 0 2px 8px rgba(0,0,0,0.6);
            }

            /* ── Scrollable body ── */
            .recipe-body {
                overflow-y: auto;
                padding: 24px 24px 32px;
                display: flex;
                flex-direction: column;
                gap: 28px;
            }

            /* ── Section headers ── */
            .recipe-section-heading {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.8rem;
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: var(--muted, #888);
                margin: 0 0 14px 0;
                padding-bottom: 10px;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
            }
            .recipe-section-icon { font-size: 1rem; }
            .recipe-ingredient-count {
                margin-left: auto;
                font-size: 0.7rem;
                font-weight: 500;
                color: var(--muted, #666);
                background: var(--surface, rgba(255,255,255,0.06));
                padding: 2px 8px;
                border-radius: 20px;
            }

            /* ── Ingredients list ── */
            .recipe-ingredients-list {
                list-style: none;
                margin: 0;
                padding: 0;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 8px;
            }
            .recipe-ingredient-item {
                font-size: 0.88rem;
                color: var(--text, #e8e8e8);
                padding: 8px 12px;
                background: var(--surface, rgba(255,255,255,0.05));
                border-radius: 8px;
                line-height: 1.4;
                border-left: 3px solid var(--accent, #e8824a);
            }

            /* ── Steps ── */
            .recipe-steps {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }
            .recipe-step {
                display: flex;
                gap: 14px;
                align-items: flex-start;
            }
            .recipe-step-num {
                flex-shrink: 0;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: var(--accent, #e8824a);
                color: #fff;
                font-size: 0.75rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 1px;
            }
            .recipe-step-text {
                margin: 0;
                font-size: 0.9rem;
                line-height: 1.65;
                color: var(--text, #ddd);
            }
        </style>
    `;

    document.body.appendChild(modal);

    // Close button
    modal.querySelector(".recipe-close-btn").addEventListener("click", () => modal.remove());

    // Close on backdrop click
    modal.querySelector(".recipe-modal-overlay").addEventListener("click", e => {
        if (e.target.classList.contains("recipe-modal-overlay")) modal.remove();
    });

    // Close on Escape
    const onKeyDown = e => { if (e.key === "Escape") { modal.remove(); document.removeEventListener("keydown", onKeyDown); } };
    document.addEventListener("keydown", onKeyDown);
}

// =====================================================
// CMD/CTRL + ENTER
// =====================================================

document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") getRecommendations();
});

window.getRecommendations = getRecommendations;