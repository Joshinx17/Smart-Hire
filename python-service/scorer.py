# python-service/scorer.py
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Loaded once at startup — not per request
_model = SentenceTransformer("all-MiniLM-L6-v2")


def compute_score(resume_text: str, job_description: str) -> dict:
    """
    Embeds resume and job description using SBERT,
    then returns cosine similarity as a 0–100 score.
    """
    if not resume_text.strip() or not job_description.strip():
        raise ValueError("Both resume_text and job_description must be non-empty.")

    embeddings = _model.encode(
        [resume_text, job_description],
        convert_to_numpy=True,
        normalize_embeddings=True,   # L2 norm → dot product == cosine similarity
    )

    resume_vec = embeddings[0].reshape(1, -1)
    jd_vec = embeddings[1].reshape(1, -1)

    similarity = cosine_similarity(resume_vec, jd_vec)[0][0]
    score = round(float(similarity) * 100, 2)   # 0.0 – 100.0

    return {
        "score": score,
        "label": _label(score),
        "similarity_raw": float(similarity),
    }


def _label(score: float) -> str:
    if score >= 75:
        return "Strong Match"
    elif score >= 50:
        return "Good Match"
    elif score >= 30:
        return "Partial Match"
    else:
        return "Weak Match"