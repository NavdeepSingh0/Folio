from app.services.gemini_service import generate_text_stream

async def generate_revision_sheet(context: str, model: str):
    prompt = (
        "You are an expert tutor. Based ONLY on the provided context, create a concise, highly readable revision sheet. "
        "Summarize the key takeaways, core arguments, and critical details. Do not include external knowledge.\n\n"
        "CONTEXT:\n{context}\n\n"
        "REVISION SHEET:"
    ).format(context=context)
    for chunk in generate_text_stream(prompt, model_name=model, temperature=0.3, max_output_tokens=1024):
        yield chunk

async def generate_mind_map(context: str, model: str):
    prompt = (
        "You are an expert tutor. Create a hierarchical markdown mind map (using nested bullet points) "
        "that breaks down the provided context into its logical structure and sub-topics. "
        "Use ONLY the provided context.\n\n"
        "CONTEXT:\n{context}\n\n"
        "MIND MAP:"
    ).format(context=context)
    for chunk in generate_text_stream(prompt, model_name=model, temperature=0.3, max_output_tokens=1024):
        yield chunk

async def generate_cheat_sheet(context: str, model: str):
    prompt = (
        "You are an expert tutor. Create a one-page cheat sheet from the provided context. "
        "Include only definitions, keywords, and formulas (if applicable). No long explanations.\n\n"
        "CONTEXT:\n{context}\n\n"
        "CHEAT SHEET:"
    ).format(context=context)
    for chunk in generate_text_stream(prompt, model_name=model, temperature=0.3, max_output_tokens=1024):
        yield chunk

async def generate_expected_questions(context: str, model: str):
    prompt = (
        "You are an expert tutor. Based ONLY on the provided context, generate a set of expected exam questions. "
        "Categorize them into:\n"
        "- 2 Marks (Short answer)\n"
        "- 5 Marks (Medium answer)\n"
        "- Long Answer (Detailed essay)\n\n"
        "CONTEXT:\n{context}\n\n"
        "EXPECTED QUESTIONS:"
    ).format(context=context)
    for chunk in generate_text_stream(prompt, model_name=model, temperature=0.3, max_output_tokens=1024):
        yield chunk

async def generate_last_minute_revision(context: str, model: str):
    prompt = (
        "You are an expert tutor. Compress the provided context into a 'Last Minute Revision' guide. "
        "It must be maximum two markdown pages long, readable within 10 minutes, and designed for quick mobile reading. "
        "Use bullet points, bold text for emphasis, and keep sentences very short.\n\n"
        "CONTEXT:\n{context}\n\n"
        "LAST MINUTE REVISION:"
    ).format(context=context)
    for chunk in generate_text_stream(prompt, model_name=model, temperature=0.3, max_output_tokens=1024):
        yield chunk
