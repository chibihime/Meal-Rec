from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import pandas as pd
import numpy as np
import os
import joblib

from sklearn.metrics.pairwise import cosine_similarity

# =====================================================
# PATHS
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODELS_DIR = os.path.join(BASE_DIR, "models")

DATA_DIR = os.path.join(BASE_DIR, "data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")

# =====================================================
# LOAD MODELS
# =====================================================

try:

    cluster_model = joblib.load(
        os.path.join(MODELS_DIR, "cluster_model.pkl")
    )

    vectorizer = joblib.load(
        os.path.join(MODELS_DIR, "vectorizer.pkl")
    )

    svd = joblib.load(
        os.path.join(MODELS_DIR, "svd.pkl")
    )

    df = joblib.load(
        os.path.join(MODELS_DIR, "clustered_data.pkl")
    )

    print("✅ Models loaded successfully")

except Exception as e:

    print(f"❌ Error loading models: {e}")
    raise e

# =====================================================
# FASTAPI
# =====================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chibihime.github.io",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# STATIC FILES
# =====================================================

if os.path.exists(IMAGES_DIR):

    app.mount(
        "/images",
        StaticFiles(directory=IMAGES_DIR),
        name="images"
    )

    print(f"✅ Serving images from: {IMAGES_DIR}")

else:

    print(f"⚠️ Images directory not found: {IMAGES_DIR}")

# =====================================================
# REQUEST MODEL
# =====================================================

class QueryRequest(BaseModel):
    ingredients: str
    top_k: int = 5

# =====================================================
# HELPERS
# =====================================================

BASE_URL = "https://gohan-backend.onrender.com"

def build_image_url(name):

    possible_extensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]

    for ext in possible_extensions:

        image_path = os.path.join(
            IMAGES_DIR,
            f"{name}{ext}"
        )

        if os.path.exists(image_path):

            return (
                f"{BASE_URL}/images/"
                f"{name}{ext}"
            )

    return ""

# =====================================================
# ROUTES
# =====================================================

@app.get("/")
def home():

    return {
        "message": "Meal Recommendation API Running"
    }

@app.post("/recommend")
def recommend(req: QueryRequest):

    # =========================================
    # USER VECTOR
    # =========================================

    user_vec = vectorizer.transform(
        [req.ingredients]
    )

    user_vec = svd.transform(user_vec)

    # =========================================
    # PREDICT CLUSTER
    # =========================================

    cluster_id = cluster_model.predict(
        user_vec
    )[0]

    # =========================================
    # FILTER RECIPES
    # =========================================

    cluster_df = df[
        df["Cluster"] == cluster_id
    ]

    # =========================================
    # RECIPE VECTORS
    # =========================================

    recipe_vectors = vectorizer.transform(
        cluster_df["Cleaned_Ingredients"]
    )

    recipe_vectors = svd.transform(
        recipe_vectors
    )

    # =========================================
    # COSINE SIMILARITY
    # =========================================

    similarities = cosine_similarity(
        user_vec,
        recipe_vectors
    )[0]

    # =========================================
    # TOP RESULTS
    # =========================================

    top_idx = np.argsort(
        similarities
    )[-req.top_k:][::-1]

    results = cluster_df.iloc[
        top_idx
    ].copy()

    # =========================================
    # IMAGE URLS
    # =========================================

    results["Image_URL"] = results[
        "Image_Name"
    ].apply(build_image_url)

    # =========================================
    # RESPONSE
    # =========================================

    return {

        "cluster": int(cluster_id),

        "recipes": results.to_dict(
            orient="records"
        ),

        "scores": similarities[
            top_idx
        ].tolist()
    }