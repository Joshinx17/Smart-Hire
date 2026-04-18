# python-service/parser.py
import io
from pdfminer.high_level import extract_text as pdf_extract
from docx import Document


def parse_resume(file_bytes: bytes, filename: str) -> str:
    """
    Accepts raw file bytes and filename.
    Returns extracted plain text from PDF or DOCX.
    """
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "pdf":
        return _parse_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return _parse_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")


def _parse_pdf(file_bytes: bytes) -> str:
    with io.BytesIO(file_bytes) as f:
        text = pdf_extract(f)
    return text.strip()


def _parse_docx(file_bytes: bytes) -> str:
    with io.BytesIO(file_bytes) as f:
        doc = Document(f)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)