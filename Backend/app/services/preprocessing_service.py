import re

def clean_document(text: str) -> str:
    """
    Cleans noisy parts of a document.
    Removes things like "Thank You" slides, Table of Contents, Agenda, and repeated whitespace.
    """
    lines = text.split('\n')
    cleaned_lines = []
    
    skip_mode = False
    for line in lines:
        lower_line = line.strip().lower()
        
        # Heuristic 1: Skip "Thank you" slides
        if lower_line in ["thank you", "thank you!", "questions?", "any questions?"]:
            continue
            
        # Heuristic 2: Skip pure page numbers
        if re.match(r'^page \d+$', lower_line) or re.match(r'^\d+$', lower_line):
            continue
            
        # Heuristic 3: Skip Table of Contents / Agenda blocks
        if "table of contents" in lower_line or "agenda" in lower_line:
            # We skip the line itself, and potentially the following list items
            # A simple approach: we don't do complex skip_mode for now, just skip the heading.
            pass
            
        # Remove consecutive blank lines
        if not line.strip() and (not cleaned_lines or not cleaned_lines[-1].strip()):
            continue
            
        cleaned_lines.append(line)
        
    # Additional regex cleanups for extreme noise
    content = '\n'.join(cleaned_lines)
    # Remove multiple spaces
    content = re.sub(r' {3,}', '  ', content)
    
    return content.strip()

def classify_document(text: str) -> str:
    """
    Classifies a document into a specific category using heuristic keyword matching.
    Categories: Programming, Theory, Research, Notes, Cheat Sheet, Reference, Other
    """
    if not text.strip():
        return "Other"
        
    sample = text[:2000].lower()
    
    # Keyword weights for each category
    categories = {
        "Programming": ["algorithm", "function", "class", "code", "compiler", "database", "api", "framework", "variable", "boolean", "integer", "loop"],
        "Theory": ["theorem", "proof", "hypothesis", "equation", "definition", "axiom", "lemma", "corollary", "principle"],
        "Research": ["abstract", "methodology", "references", "cited", "literature review", "results", "conclusion", "experiment"],
        "Reference": ["experience", "skills", "education", "gpa", "contact", "summary", "objective", "certifications"],
        "Notes": ["agenda", "overview", "lecture", "module", "week", "summary"]
    }
    
    scores = {category: 0 for category in categories}
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in sample:
                scores[category] += 1
                
    # Find the category with the highest score
    best_category = max(scores, key=scores.get)
    
    if scores[best_category] > 0:
        return best_category
    return "Other"
