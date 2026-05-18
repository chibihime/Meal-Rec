import pandas as pd
import numpy as np
import os
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD

from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture

from sklearn.metrics import silhouette_score

# -----------------------------
# LOAD DATA
# -----------------------------

BASE_DIR = os.path.dirname(__file__)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "data.csv"
)

df = pd.read_csv(DATA_PATH)

df.fillna("", inplace=True)

# -----------------------------
# TF-IDF FEATURES
# -----------------------------

vectorizer = TfidfVectorizer(
    stop_words='english',
    max_features=5000
)

ingredient_matrix = vectorizer.fit_transform(
    df["Cleaned_Ingredients"]
)

# -----------------------------
# DIMENSIONALITY REDUCTION
# -----------------------------

svd = TruncatedSVD(
    n_components=100,
    random_state=42
)

reduced_matrix = svd.fit_transform(
    ingredient_matrix
)

# -----------------------------
# MODELS
# -----------------------------

models = {
    "kmeans": KMeans(
        n_clusters=10,
        random_state=42
    ),

    "gmm": GaussianMixture(
        n_components=10,
        random_state=42
    )
}

best_score = -1
best_model = None
best_name = None

print("\nTRAINING MODELS...\n")

for name, model in models.items():

    clusters = model.fit_predict(
        reduced_matrix
    )

    score = silhouette_score(
        reduced_matrix,
        clusters
    )

    print(f"{name}: {score:.4f}")

    if score > best_score:
        best_score = score
        best_model = model
        best_name = name

print(f"\nBEST MODEL: {best_name}")

# -----------------------------
# SAVE CLUSTERS
# -----------------------------

df["Cluster"] = best_model.fit_predict(
    reduced_matrix
)

# -----------------------------
# SAVE MODELS
# -----------------------------

MODELS_DIR = os.path.join(
    BASE_DIR,
    "models"
)

os.makedirs(MODELS_DIR, exist_ok=True)

joblib.dump(
    best_model,
    os.path.join(MODELS_DIR, "cluster_model.pkl")
)

joblib.dump(
    vectorizer,
    os.path.join(MODELS_DIR, "vectorizer.pkl")
)

joblib.dump(
    svd,
    os.path.join(MODELS_DIR, "svd.pkl")
)

joblib.dump(
    df,
    os.path.join(MODELS_DIR, "clustered_data.pkl")
)

print("\nMODELS SAVED.")