import re
from typing import List
from app.models.document_profile import (
    ExtractedDocument,
    ExtractedSlide,
    SlideType,
    ClassifiedSlide,
    DocumentProfile,
    PlannerInput
)

def detect_image_heavy(slide: ExtractedSlide) -> bool:
    """Detects if a slide is heavily visual and lacks text."""
    # A slide is image heavy if it has "[Figure: Image" and very little actual text
    text_length = len(re.sub(r'\[Figure: Image[^\]]*\]', '', slide.text).strip())
    has_image = "[Figure: Image" in slide.text
    return has_image and text_length < 50

def classify_slide(slide: ExtractedSlide) -> tuple[SlideType, float]:
    text_lower = slide.text.lower()
    
    # 1. Quizzes
    if re.search(r'\b(quiz|question|q\d+|self test)\b', text_lower):
        return SlideType.QUIZ, 0.95
        
    # 2. Administrative
    if re.search(r'\b(agenda|admin|schedule|office hours|syllabus)\b', text_lower):
        return SlideType.ADMINISTRATIVE, 0.9
        
    # 3. Reference
    if re.search(r'\b(references|bibliography|works cited|further reading)\b', text_lower):
        return SlideType.REFERENCE, 0.95
        
    # 4. Learning Objective
    if re.search(r'\b(learning objectives?|goals|outcomes)\b', text_lower):
        return SlideType.LEARNING_OBJECTIVE, 0.9
        
    # 5. Summary
    if re.search(r'\b(summary|conclusion|recap|in summary)\b', text_lower):
        return SlideType.SUMMARY, 0.9
        
    # 6. Comparison
    if re.search(r'\b(vs|versus|comparison|differences between)\b', text_lower) or "|" in slide.text:
        return SlideType.COMPARISON, 0.8
        
    # 7. Example
    if re.search(r'\b(example|for instance|suppose|consider)\b', text_lower):
        return SlideType.EXAMPLE, 0.8
        
    # 8. Image Heavy
    if detect_image_heavy(slide):
        return SlideType.IMAGE_HEAVY, 0.95
        
    # Default to Content
    return SlideType.CONTENT, 0.7

def extract_exam_hints(slides: List[ClassifiedSlide]) -> List[str]:
    hints = []
    for s in slides:
        if s.slide_type in (SlideType.QUIZ, SlideType.SUMMARY):
            # Clean up boilerplate
            lines = [line.strip() for line in s.text.split('\n') if line.strip() and not line.startswith('[Figure')]
            hints.extend([line for line in lines if len(line) > 10])
    return hints

def compute_document_profile(slides: List[ClassifiedSlide]) -> DocumentProfile:
    total = len(slides)
    counts = {t: 0 for t in SlideType}
    for s in slides:
        counts[s.slide_type] += 1
        
    educational = counts[SlideType.CONTENT] + counts[SlideType.EXAMPLE] + counts[SlideType.COMPARISON]
    density = educational / total if total > 0 else 0.0
    
    return DocumentProfile(
        total_slides=total,
        educational_slides=educational,
        quiz_slides=counts[SlideType.QUIZ],
        image_heavy_slides=counts[SlideType.IMAGE_HEAVY],
        administrative_slides=counts[SlideType.ADMINISTRATIVE],
        educational_density=density
    )

def build_planner_input(extracted_doc: ExtractedDocument) -> PlannerInput:
    classified_slides = []
    for s in extracted_doc.slides:
        slide_type, confidence = classify_slide(s)
        image_heavy = detect_image_heavy(s)
        
        classified_slides.append(ClassifiedSlide(
            slide_number=s.slide_number,
            slide_type=slide_type,
            text=s.text,
            confidence=confidence,
            image_heavy=image_heavy
        ))
        
    profile = compute_document_profile(classified_slides)
    hints = extract_exam_hints(classified_slides)
    
    # Filter out pure noise for the planner (but keep contexts like LEARNING_OBJECTIVE)
    noise_types = {SlideType.ADMINISTRATIVE, SlideType.REFERENCE, SlideType.RESOURCE, SlideType.QUIZ, SlideType.SUMMARY, SlideType.IMAGE_HEAVY}
    filtered = [s for s in classified_slides if s.slide_type not in noise_types]
    
    # If the document is mostly noise, just pass everything as CONTENT as a fallback
    if len(filtered) < (len(classified_slides) * 0.2):
        filtered = classified_slides
        
    return PlannerInput(
        filtered_slides=filtered,
        exam_focus_hints=hints[:15], # cap the number of hints to avoid overwhelming context
        document_profile=profile
    )
