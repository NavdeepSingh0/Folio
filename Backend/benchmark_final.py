import time
import sys
import json
import uuid
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.services.generation_engine import LegacyGenerationEngine
from app.models.folio import TopicOutline, ConceptOutline, LearningObject

MOCK_TEXT = """
Object-Oriented Programming (OOP) in C++
Object-Oriented Programming is a paradigm that organizes software design around data, or objects, rather than functions and logic. 
In C++, the four main pillars of OOP are:
1. Encapsulation: The bundling of data and the methods that operate on that data into a single unit, called a class. This hides the internal state of the object.
2. Inheritance: A mechanism where a new class derives properties and characteristics from an existing class. It promotes code reusability.
3. Polymorphism: The ability of different objects to respond in their own way to the same function call. This is typically achieved through virtual functions and method overriding.
4. Abstraction: Hiding the complex implementation details and showing only the essential features of the object.
"""

def generate_variant_a(topic_text, outline, model_name="qwen3"):
    """Variant A: Loop over each concept individually."""
    llm = OllamaLLM(model=model_name, format="json")
    prompt = """
You are an expert educator. Read the TOPIC TEXT.
I need you to extract the educational content specifically for the concept: "{concept_title}".
Return ONLY a valid JSON object matching the exact schema below.

SCHEMA:
{{
  "title": "The concept title",
  "definition": "A precise, one-sentence definition",
  "explanation": "A clear, structured explanation",
  "example": "A concrete example (or null)",
  "exam_tip": "A specific tip for exams (or null)"
}}

TOPIC TEXT:
{text}
"""
    template = PromptTemplate.from_template(prompt)
    chain = template | llm
    
    learning_objects = []
    for concept in outline.concepts:
        try:
            response = chain.invoke({"text": topic_text, "concept_title": concept.title})
            clean_json = response.strip()
            if clean_json.startswith("```json"): clean_json = clean_json[7:]
            if clean_json.endswith("```"): clean_json = clean_json[:-3]
            data = json.loads(clean_json.strip())
            learning_objects.append(data)
        except Exception as e:
            pass
    return learning_objects

def generate_variant_b(topic_text, outline, model_name="qwen3"):
    """Variant B: One single array response."""
    llm = OllamaLLM(model=model_name, format="json")
    concept_titles = [c.title for c in outline.concepts]
    prompt = """
You are an expert educator. Read the TOPIC TEXT.
I need you to extract the educational content specifically for the following concepts:
{concept_titles}

Return ONLY a valid JSON array of objects matching the exact schema below. Do NOT output any conversational text.

SCHEMA (Array of objects):
[
  {{
    "title": "The exact concept title",
    "definition": "A precise, one-sentence definition",
    "explanation": "A clear, structured explanation",
    "example": "A concrete example (or null)",
    "exam_tip": "A specific tip for exams (or null)"
  }}
]

TOPIC TEXT:
{text}
"""
    template = PromptTemplate.from_template(prompt)
    chain = template | llm
    
    try:
        response = chain.invoke({
            "text": topic_text, 
            "concept_titles": ", ".join(concept_titles)
        })
        clean_json = response.strip()
        start_idx = clean_json.find('[')
        end_idx = clean_json.rfind(']')
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
        data_list = json.loads(clean_json.strip())
        return data_list if isinstance(data_list, list) else [data_list]
    except Exception as e:
        return []

def warmup_gpu():
    print("==================================================")
    print("Warming up GPU Memory (Loading Qwen3)...")
    print("==================================================")
    llm = OllamaLLM(model="qwen3")
    llm.invoke("Say the word 'Warmup'")
    print("GPU is warm. Beginning Benchmark.\n")

if __name__ == "__main__":
    warmup_gpu()
    
    # 1. Legacy
    print("\n" + "="*50)
    print("Running Legacy Engine...")
    print("="*50)
    legacy_start = time.time()
    legacy_engine = LegacyGenerationEngine()
    legacy_out = ""
    try:
        for chunk in legacy_engine.generate(MOCK_TEXT, "university_notes", None, "qwen3"):
            legacy_out += chunk
    except: pass
    legacy_time = time.time() - legacy_start
    print(f"[Legacy Engine Completed in {legacy_time:.2f} seconds]")

    # Mock Outline for Variants
    outline = TopicOutline(
        topic="OOP in C++",
        exam_focus="High",
        concepts=[
            ConceptOutline(title="Encapsulation", slides=[1]),
            ConceptOutline(title="Inheritance", slides=[2]),
            ConceptOutline(title="Polymorphism", slides=[3]),
            ConceptOutline(title="Abstraction", slides=[4])
        ]
    )

    # 2. Variant A (N Calls)
    print("\n" + "="*50)
    print("Running Two-Pass Variant A (1 call per concept)...")
    print("="*50)
    a_start = time.time()
    out_a = generate_variant_a(MOCK_TEXT, outline)
    a_time = time.time() - a_start
    print(f"[Variant A Completed in {a_time:.2f} seconds]")

    # 3. Variant B (1 Call)
    print("\n" + "="*50)
    print("Running Two-Pass Variant B (1 array call)...")
    print("="*50)
    b_start = time.time()
    out_b = generate_variant_b(MOCK_TEXT, outline)
    b_time = time.time() - b_start
    print(f"[Variant B Completed in {b_time:.2f} seconds]")

    print("\n\n" + "="*50)
    print("FINAL BENCHMARK SUMMARY (GPU WARM)")
    print("="*50)
    print(f"Legacy Engine Time: {legacy_time:.2f}s | Output Chars: {len(legacy_out)}")
    print(f"Variant A Time:     {a_time:.2f}s | Parsed Objects: {len(out_a)}")
    print(f"Variant B Time:     {b_time:.2f}s | Parsed Objects: {len(out_b)}")
    
    print("\n\n=== LEGACY OUTPUT ===")
    print(legacy_out)
    
    print("\n\n=== VARIANT A OUTPUT ===")
    print(json.dumps(out_a, indent=2))
    
    print("\n\n=== VARIANT B OUTPUT ===")
    print(json.dumps(out_b, indent=2))
