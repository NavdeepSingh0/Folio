from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

def get_llm(model_name: str):
    return OllamaLLM(model=model_name)

def get_prompt_template(type_str: str) -> str:
    if type_str == "flashcards":
        return (
            "You are an expert study assistant. Generate exactly {quantity} question-answer flashcards from the following context.\n"
            "Difficulty: {difficulty}\n"
            "Language: {language}\n"
            "Format each flashcard EXACTLY like this:\n"
            "Q: [Question here]\n"
            "A: [Answer here]\n"
            "---\n\n"
            "Context:\n{context_text}\n\nFlashcards:"
        )
    elif type_str == "mcq":
        return (
            "You are an expert examiner. Generate exactly {quantity} Multiple Choice Questions (MCQs) from the following context.\n"
            "Difficulty: {difficulty}\n"
            "Language: {language}\n"
            "Each MCQ must have 4 options (A, B, C, D) and specify the correct answer at the end of the question block.\n\n"
            "Context:\n{context_text}\n\nMCQs:"
        )
    elif type_str == "short_q":
        return (
            "You are an expert examiner. Generate exactly {quantity} Short Answer Questions from the following context.\n"
            "Difficulty: {difficulty}\n"
            "Language: {language}\n"
            "Provide the answer immediately below each question.\n\n"
            "Context:\n{context_text}\n\nShort Questions:"
        )
    elif type_str == "long_q":
        return (
            "You are an expert examiner. Generate exactly {quantity} Long/Essay Questions from the following context.\n"
            "Difficulty: {difficulty}\n"
            "Language: {language}\n"
            "Provide a detailed grading rubric or suggested answer points below each question.\n\n"
            "Context:\n{context_text}\n\nLong Questions:"
        )
    elif type_str == "concepts":
        return (
            "You are an expert study assistant. Extract the top {quantity} key concepts and definitions from the following context.\n"
            "Language: {language}\n"
            "Format it as a clean Markdown list where the concept is bolded, followed by a {length} definition.\n\n"
            "Context:\n{context_text}\n\nKey Concepts:"
        )
    elif type_str == "formulas":
        return (
            "You are an expert study assistant. Extract any formulas, equations, or mathematical relationships from the following context.\n"
            "If there are none, reply with 'No formulas found in this context.'\n"
            "For each formula, provide:\n"
            "- **Formula:** (The formula)\n"
            "- **Variables:** (What they mean)\n"
            "- **Usage:** (When to use it)\n\n"
            "Context:\n{context_text}\n\nFormula Sheet:"
        )
    elif type_str == "mindmap":
        return (
            "You are an expert study assistant. Generate a Mindmap of the following context.\n"
            "Format: {length} (Use this to determine the style: 'Short' = Bullet Tree, 'Medium' = Indented Tree, 'Detailed' = Mermaid JS Markdown code block).\n"
            "Language: {language}\n"
            "IMPORTANT: Output ONLY markdown text. Do not output images. If Mermaid, wrap in ```mermaid blocks.\n\n"
            "Context:\n{context_text}\n\nMindmap:"
        )
    elif type_str == "revision":
        return (
            "You are an expert study assistant. Create a {difficulty} revision sheet based on the following context.\n"
            "Length: {length}. Language: {language}.\n"
            "If it's 'Quick Revision', focus only on core bullet points.\n"
            "If it's 'Exam Revision', include exam tips and common pitfalls.\n"
            "Format it beautifully using Markdown headings, lists, and bold text.\n\n"
            "Context:\n{context_text}\n\nRevision Sheet:"
        )
    elif type_str == "explain":
        return (
            "You are an expert tutor. Explain the following text.\n"
            "Style: {difficulty} (e.g., 'Explain like Beginner', 'Analogy', 'Step-by-Step').\n"
            "Length: {length}. Language: {language}.\n"
            "Keep it engaging and easy to understand.\n\n"
            "Text to explain:\n{context_text}\n\nExplanation:"
        )
    elif type_str == "custom":
        return (
            "You are an expert study assistant. Follow the user's custom instructions exactly.\n"
            "Custom Instructions: {custom_prompt}\n\n"
            "Context:\n{context_text}\n\nResponse:"
        )
    else:
        return "Please process this context: {context_text}"

def unified_generate_stream(
    type_str: str,
    difficulty: str,
    quantity: str,
    length: str,
    language: str,
    context_text: str,
    model_name: str = "qwen3",
    custom_prompt: str = None
):
    llm = get_llm(model_name)
    template = get_prompt_template(type_str)
    
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    for token in chain.stream({
        "difficulty": difficulty,
        "quantity": quantity,
        "length": length,
        "language": language,
        "context_text": context_text,
        "custom_prompt": custom_prompt or ""
    }):
        yield token
