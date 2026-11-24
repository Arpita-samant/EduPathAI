import io
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import Tuple
from pypdf import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        with io.BytesIO(file_bytes) as bio:
            with zipfile.ZipFile(bio) as zf:
                xml_content = zf.read("word/document.xml")
                root = ET.fromstring(xml_content)
                # WordprocessingML text nodes end with '}t'
                texts = [node.text for node in root.iter() if node.tag.endswith("}t") and node.text]
                return " ".join(texts).strip()
    except Exception as e:
        return f"Error extracting DOCX: {str(e)}"

def extract_text_from_file(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    """Returns (extracted_text, file_type)"""
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes), "pdf"
    elif lower_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes), "docx"
    elif lower_name.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore").strip(), "txt"
    else:
        raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")
