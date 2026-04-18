# python-service/main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_resume
from scorer import compute_score
import uvicorn

app = FastAPI(title="SmartHire Resume Scorer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/score")
async def score_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    allowed_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }

    if resume.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {resume.content_type}. Upload PDF or DOCX.",
        )

    file_bytes = await resume.read()

    try:
        resume_text = parse_resume(file_bytes, resume.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not resume_text:
        raise HTTPException(status_code=422, detail="Could not extract text from resume.")

    # ── DEBUG LOGS ──────────────────────────────────────────
    print("\n" + "="*60)
    print("📄 RESUME TEXT EXTRACTED:")
    print("-"*60)
    print(resume_text[:2000])  # first 2000 chars
    print(f"\n[Total resume length: {len(resume_text)} chars]")
    print("="*60)

    print("\n" + "="*60)
    print("📋 JOB DESCRIPTION RECEIVED:")
    print("-"*60)
    print(job_description[:2000])  # first 2000 chars
    print(f"\n[Total JD length: {len(job_description)} chars]")
    print("="*60 + "\n")
    # ────────────────────────────────────────────────────────

    try:
        result = compute_score(resume_text, job_description)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ── SCORE LOG ───────────────────────────────────────────
    print(f"✅ SCORE: {result['score']} | LABEL: {result['label']}")
    print("="*60 + "\n")
    # ────────────────────────────────────────────────────────

    return {
        "filename": resume.filename,
        **result,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)