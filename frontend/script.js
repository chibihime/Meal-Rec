const BACKEND_URL = "http://127.0.0.1:8000";

async function getRecommendations() {

    const ingredients = document.getElementById("ingredients").value.trim();
    const resultsDiv  = document.getElementById("results");
    const loadingDiv  = document.getElementById("loading");

    if (!ingredients) {
        document.getElementById("ingredients").focus();
        return;
    }

    resultsDiv.innerHTML = "";
    loadingDiv.classList.remove("hidden");

    try {

        const response = await fetch(`${BACKEND_URL}/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients, top_k: 6 })
        });

        const data = await response.json();
        loadingDiv.classList.add("hidden");

        if (!data.recommendations || data.recommendations.length === 0) {
            resultsDiv.innerHTML = `
                <div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--muted);font-style:italic;">
                    No meals found for those ingredients.
                </div>`;
            return;
        }

        data.recommendations.forEach((meal, i) => {
            const score   = meal.score ?? meal.similarity ?? 0;
            const pct     = Math.round(score * 100);
            const name    = meal.name ?? meal.meal ?? meal.title ?? "Unknown";
            const card    = document.createElement("div");
            card.className = "meal-card";
            card.style.animationDelay = `${i * 0.07}s`;
            card.innerHTML = `
                <p class="meal-number">0${i + 1}</p>
                <p class="meal-name">${name}</p>
                <p class="meal-match">Match score — ${pct}%</p>
                <div class="match-bar-wrap">
                    <div class="match-bar" style="width: 0%"
                         data-width="${pct}%"></div>
                </div>`;
            resultsDiv.appendChild(card);
        });

        // Animate bars after paint
        requestAnimationFrame(() => {
            document.querySelectorAll(".match-bar").forEach(bar => {
                bar.style.width = bar.dataset.width;
            });
        });

    } catch (err) {
        loadingDiv.classList.add("hidden");
        resultsDiv.innerHTML = `
            <div style="grid-column:1/-1;padding:48px;text-align:center;
                        color:var(--danger);font-family:var(--font-mono);font-size:0.75rem;">
                Could not reach the server. Is the backend running?
            </div>`;
        console.error(err);
    }
}

// Submit on Cmd/Ctrl + Enter
document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") getRecommendations();
});
