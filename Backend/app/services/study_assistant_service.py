from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

def get_llm(model_name: str):
    return OllamaLLM(model=model_name)

def generate_flashcards_stream(text: str, model_name: str = "llama3.2"):
    llm = get_llm(model_name)
    prompt = PromptTemplate.from_template(
        "You are an expert study assistant. Generate question-answer flashcards from the following notes.\n"
        "Format each flashcard exactly like this:\n"
        "Q: [Question here]\n"
        "A: [Answer here]\n"
        "---\n\n"
        "Notes:\n{text}\n\nFlashcards:"
    )
    chain = prompt | llm
    for token in chain.stream({"text": text}):
        yield token

def generate_questions_stream(text: str, difficulty: str = "Medium", model_name: str = "llama3.2"):
    llm = get_llm(model_name)
    prompt = PromptTemplate.from_template(
        "You are an expert examiner. Generate practice questions from the following notes.\n"
        "Difficulty level: {difficulty}.\n"
        "Include a mix of:\n"
        "- Multiple Choice Questions (with options A, B, C, D)\n"
        "- Short Answer Questions\n"
        "- Long Answer / Essay Questions\n\n"
        "Provide the answers at the very end.\n\n"
        "Notes:\n{text}\n\nPractice Questions:"
    )
    chain = prompt | llm
    for token in chain.stream({"text": text, "difficulty": difficulty}):
        yield token

def generate_summary_stream(text: str, duration: str = "5-minute", model_name: str = "llama3.2"):
    llm = get_llm(model_name)
    prompt = PromptTemplate.from_template(
        "You are an expert study assistant. Create a {duration} revision summary of the following notes.\n"
        "If it's a 5-minute revision, focus only on the absolute core points.\n"
        "If it's a 15-minute revision, include more context and sub-points.\n"
        "If it's a one-page revision sheet, format it densely but neatly with bullet points and bold terms.\n\n"
        "Notes:\n{text}\n\nRevision Summary:"
    )
    chain = prompt | llm
    for token in chain.stream({"text": text, "duration": duration}):
        yield token

def generate_keywords_stream(text: str, model_name: str = "llama3.2"):
    llm = get_llm(model_name)
    prompt = PromptTemplate.from_template(
        "You are an expert study assistant. Extract the top 10 key concepts, definitions, and keywords from the following notes.\n"
        "Format it as a clean Markdown list where the keyword/concept is bolded, followed by its definition.\n\n"
        "Notes:\n{text}\n\nKey Concepts & Definitions:"
    )
    chain = prompt | llm
    for token in chain.stream({"text": text}):
        yield token

def generate_formula_sheet_stream(text: str, model_name: str = "llama3.2"):
    llm = get_llm(model_name)
    prompt = PromptTemplate.from_template(
        "You are an expert study assistant. Extract any formulas, equations, or mathematical relationships from the following notes.\n"
        "If there are no formulas, simply reply with 'No formulas found in these notes.'\n"
        "If there are formulas, generate a Formula Summary with the following structure for each formula:\n"
        "- **Formula:** (The formula itself)\n"
        "- **Variables:** (List of variables and what they stand for)\n"
        "- **Meaning / Usage:** (When and why to use this formula)\n\n"
        "Notes:\n{text}\n\nFormula Sheet:"
    )
    chain = prompt | llm
    for token in chain.stream({"text": text}):
        yield token

def explain_simpler_stream(text: str, model_name: str = "llama3.2"):
    llm = get_llm(model_name)
    prompt = PromptTemplate.from_template(
        "You are an expert tutor. Explain the following text simply, as if I am learning it for the very first time.\n"
        "Use analogies if helpful, and avoid overly complex jargon. Keep it engaging and easy to understand.\n\n"
        "Text to explain:\n{text}\n\nSimple Explanation:"
    )
    chain = prompt | llm
    for token in chain.stream({"text": text}):
        yield token
