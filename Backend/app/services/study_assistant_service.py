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

import re

def parse_markdown_to_flashcards(text: str) -> str:
    cards = []
    
    # Title
    title_match = re.search(r'^##\s+(.+)$', text, re.MULTILINE)
    topic_title = title_match.group(1).strip() if title_match else "Topic"
    
    # Definition
    def_match = re.search(r'\*\*Definition:\*\*\s*(.+)', text)
    if def_match:
        cards.append(f"Q: What is {topic_title}?\nA: {def_match.group(1).strip()}\n---")
        
    # Algorithm Steps
    algo_match = re.search(r'\*\*Algorithm Steps:\*\*\n((?:\d+\..*\n?)+)', text)
    if algo_match:
        cards.append(f"Q: What are the steps for {topic_title}?\nA: {algo_match.group(1).strip()}\n---")
        
    # Memory Trick
    mem_match = re.search(r'\>\s*\*\*Memory Trick:\*\*\s*(.+)', text)
    if mem_match:
        cards.append(f"Q: How can you remember {topic_title}?\nA: {mem_match.group(1).strip()}\n---")
        
    # Common Mistakes
    mistake_match = re.search(r'\>\s*\*\*Common Mistake:\*\*\s*(.+)', text)
    if mistake_match:
        cards.append(f"Q: What is a common mistake regarding {topic_title}?\nA: {mistake_match.group(1).strip()}\n---")
        
    # Exam Tip
    exam_match = re.search(r'\>\s*\*\*Exam Focus:\*\*\s*(.+)', text)
    if exam_match:
        cards.append(f"Q: What is an important exam tip for {topic_title}?\nA: {exam_match.group(1).strip()}\n---")
        
    return "\n\n".join(cards) if cards else None

def parse_markdown_to_mcqs(text: str) -> str:
    mcqs = []
    title_match = re.search(r'^##\s+(.+)$', text, re.MULTILINE)
    topic_title = title_match.group(1).strip() if title_match else "Topic"
    
    # Just generate one basic MCQ based on definition for speed
    def_match = re.search(r'\*\*Definition:\*\*\s*(.+)', text)
    if def_match:
        ans = def_match.group(1).strip()
        mcqs.append(f"1. What is the definition of {topic_title}?\nA) {ans}\nB) Incorrect option 1\nC) Incorrect option 2\nD) Incorrect option 3\n\nCorrect Answer: A")
        
    mistake_match = re.search(r'\>\s*\*\*Common Mistake:\*\*\s*(.+)', text)
    if mistake_match:
        ans = mistake_match.group(1).strip()
        mcqs.append(f"2. Which of the following is a common mistake regarding {topic_title}?\nA) Incorrect option\nB) {ans}\nC) Incorrect option\nD) Incorrect option\n\nCorrect Answer: B")

    return "\n\n".join(mcqs) if mcqs else None

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
    # Intercept for INSTANT deterministic output if the context matches our generated Markdown!
    if type_str == "flashcards":
        instant_cards = parse_markdown_to_flashcards(context_text)
        if instant_cards:
            yield instant_cards
            return
            
    if type_str == "mcq":
        instant_mcqs = parse_markdown_to_mcqs(context_text)
        if instant_mcqs:
            yield instant_mcqs
            return

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
