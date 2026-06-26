from app.models.database import get_projects, get_project, get_chapters, get_units

def resolve_context(scope_type: str, scope_id: str = None, custom_ids: list[str] = None) -> str:
    """
    Returns a single concatenated string of markdown content from the resolved scope.
    scope_type can be: "file", "chapter", "unit", "collection", "custom"
    """
    all_projects = get_projects()
    matched_projects = []

    if scope_type == "file":
        if scope_id:
            proj = get_project(scope_id)
            if proj and proj.get("markdown_content"):
                matched_projects.append(proj)
    elif scope_type == "custom":
        if custom_ids:
            for pid in custom_ids:
                proj = get_project(pid)
                if proj and proj.get("markdown_content"):
                    matched_projects.append(proj)
    else:
        # For hierarchical scopes, we need to trace down to the chapters
        chapters = get_chapters()
        units = get_units()
        
        valid_chapter_ids = set()
        
        if scope_type == "chapter":
            valid_chapter_ids.add(scope_id)
        elif scope_type == "unit":
            for c in chapters:
                if c["unit_id"] == scope_id:
                    valid_chapter_ids.add(c["id"])
        elif scope_type == "collection":
            # find all units in this collection
            valid_unit_ids = {u["id"] for u in units if u["collection_id"] == scope_id}
            for c in chapters:
                if c["unit_id"] in valid_unit_ids:
                    valid_chapter_ids.add(c["id"])
                    
        for proj in all_projects:
            if proj.get("chapter_id") in valid_chapter_ids:
                full_proj = get_project(proj["id"])
                if full_proj and full_proj.get("markdown_content"):
                    matched_projects.append(full_proj)
                    
    if not matched_projects:
        return "No context found."
        
    context_parts = []
    for p in matched_projects:
        context_parts.append(f"--- Document: {p['title']} ---\n{p['markdown_content']}\n")
        
    return "\n".join(context_parts)
