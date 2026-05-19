console.log("SCRIPT LOADED");

const BACKEND_URL = "https://gohan-backend.onrender.com";

async function getRecommendations() {

    console.log("BUTTON CLICKED");

    const ingredientsInput =
        document.getElementById("ingredients");

    const resultsDiv =
        document.getElementById("results");

    const loadingDiv =
        document.getElementById("loading");

    if (!ingredientsInput) {
        console.error("ingredients input missing");
        return;
    }

    const ingredients =
        ingredientsInput.value.trim();

    console.log("Ingredients:", ingredients);

    if (!ingredients) {
        alert("Enter ingredients");
        return;
    }

    resultsDiv.innerHTML = "Loading...";
    loadingDiv?.classList.remove("hidden");

    try {

        console.log("Sending request...");

        const response = await fetch(
            "https://gohan-backend.onrender.com/recommend",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    ingredients: ingredients,
                    top_k: 6
                })
            }
        );

        console.log("Response received:", response);

        const text = await response.text();

        console.log("RAW RESPONSE:", text);

        const data = JSON.parse(text);

        console.log("PARSED DATA:", data);

        loadingDiv?.classList.add("hidden");

        resultsDiv.innerHTML = "";

        if (!data.recipes) {

            resultsDiv.innerHTML =
                "<p>No recipes returned</p>";

            return;
        }

        data.recipes.forEach((recipe, i) => {

            const div =
                document.createElement("div");

            div.className = "meal-card";

            div.innerHTML = `
                <h2>${recipe.Title}</h2>

                <img
                    src="${recipe.Image_URL}"
                    width="250"
                >

                <p>
                    ${recipe.Instructions.substring(0, 120)}...
                </p>
            `;

            resultsDiv.appendChild(div);
        });

    } catch (err) {

        console.error("FULL ERROR:", err);

        loadingDiv?.classList.add("hidden");

        resultsDiv.innerHTML = `
            <pre style="color:red;">
${err.stack}
            </pre>
        `;
    }
}

window.getRecommendations =
    getRecommendations;