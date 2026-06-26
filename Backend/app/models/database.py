import sqlite3
import os
import uuid
from datetime import datetime

DB_PATH = "data/studyforge.db"

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Collections
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Units
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS units (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            collection_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE
        )
    ''')
    
    # Chapters
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chapters (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            unit_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(unit_id) REFERENCES units(id) ON DELETE CASCADE
        )
    ''')
    
    # Projects
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            source_filename TEXT NOT NULL,
            study_style TEXT NOT NULL,
            model TEXT NOT NULL,
            chapter_id TEXT,
            created_at TEXT NOT NULL,
            last_modified TEXT NOT NULL,
            markdown_path TEXT NOT NULL,
            word_count INTEGER DEFAULT 0,
            FOREIGN KEY(chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
        )
    ''')
    
    # Add new columns if they don't exist
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN pages INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
        
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN chunks INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
        
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN generation_time REAL DEFAULT 0.0")
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()

# CRUD for Collections
def create_collection(name: str) -> dict:
    cid = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO collections (id, name, created_at) VALUES (?, ?, ?)', (cid, name, created_at))
    conn.commit()
    conn.close()
    return {"id": cid, "name": name, "created_at": created_at}

def get_collections() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM collections ORDER BY created_at ASC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def rename_collection(cid: str, new_name: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE collections SET name = ? WHERE id = ?', (new_name, cid))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_collection(cid: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Find all units in collection
    cursor.execute('SELECT id FROM units WHERE collection_id = ?', (cid,))
    unit_rows = cursor.fetchall()
    unit_ids = [row[0] for row in unit_rows]
    
    # Move projects to ungrouped (chapter_id = NULL) for all affected chapters
    for uid in unit_ids:
        cursor.execute('SELECT id FROM chapters WHERE unit_id = ?', (uid,))
        chapter_rows = cursor.fetchall()
        for c_row in chapter_rows:
            cursor.execute('UPDATE projects SET chapter_id = NULL WHERE chapter_id = ?', (c_row[0],))
        cursor.execute('DELETE FROM chapters WHERE unit_id = ?', (uid,))
        
    cursor.execute('DELETE FROM units WHERE collection_id = ?', (cid,))
    cursor.execute('DELETE FROM collections WHERE id = ?', (cid,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

# CRUD for Units
def create_unit(name: str, collection_id: str) -> dict:
    uid = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO units (id, name, collection_id, created_at) VALUES (?, ?, ?, ?)', (uid, name, collection_id, created_at))
    conn.commit()
    conn.close()
    return {"id": uid, "name": name, "collection_id": collection_id, "created_at": created_at}

def get_units() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM units ORDER BY created_at ASC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def rename_unit(uid: str, new_name: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE units SET name = ? WHERE id = ?', (new_name, uid))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def move_unit(uid: str, collection_id: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE units SET collection_id = ? WHERE id = ?', (collection_id, uid))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_unit(uid: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM chapters WHERE unit_id = ?', (uid,))
    chapter_rows = cursor.fetchall()
    for c_row in chapter_rows:
        cursor.execute('UPDATE projects SET chapter_id = NULL WHERE chapter_id = ?', (c_row[0],))
        
    cursor.execute('DELETE FROM chapters WHERE unit_id = ?', (uid,))
    cursor.execute('DELETE FROM units WHERE id = ?', (uid,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

# CRUD for Chapters
def create_chapter(name: str, unit_id: str) -> dict:
    cid = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO chapters (id, name, unit_id, created_at) VALUES (?, ?, ?, ?)', (cid, name, unit_id, created_at))
    conn.commit()
    conn.close()
    return {"id": cid, "name": name, "unit_id": unit_id, "created_at": created_at}

def get_chapters() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM chapters ORDER BY created_at ASC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def rename_chapter(cid: str, new_name: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE chapters SET name = ? WHERE id = ?', (new_name, cid))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def move_chapter(cid: str, unit_id: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE chapters SET unit_id = ? WHERE id = ?', (unit_id, cid))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_chapter(cid: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE projects SET chapter_id = NULL WHERE chapter_id = ?', (cid,))
    cursor.execute('DELETE FROM chapters WHERE id = ?', (cid,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

# Projects
def save_project(title: str, source_filename: str, study_style: str, model: str, markdown_content: str, chapter_id: str = None, pages: int = 0, chunks: int = 0, generation_time: float = 0.0) -> dict:
    os.makedirs("output", exist_ok=True)
    project_id = str(uuid.uuid4())
    markdown_path = f"output/{project_id}.md"
    
    with open(markdown_path, "w", encoding="utf-8") as f:
        f.write(markdown_content)
        
    created_at = datetime.utcnow().isoformat()
    word_count = len(markdown_content.split())
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO projects (id, title, source_filename, study_style, model, chapter_id, created_at, last_modified, markdown_path, word_count, pages, chunks, generation_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (project_id, title, source_filename, study_style, model, chapter_id, created_at, created_at, markdown_path, word_count, pages, chunks, generation_time))
    
    conn.commit()
    conn.close()
    
    return {
        "id": project_id,
        "title": title,
        "source_filename": source_filename,
        "study_style": study_style,
        "model": model,
        "chapter_id": chapter_id,
        "created_at": created_at,
        "last_modified": created_at,
        "markdown_path": markdown_path,
        "word_count": word_count,
        "pages": pages,
        "chunks": chunks,
        "generation_time": generation_time
    }

def get_projects() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM projects ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_project(project_id: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM projects WHERE id = ?', (project_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    project = dict(row)
    try:
        with open(project["markdown_path"], "r", encoding="utf-8") as f:
            project["markdown_content"] = f.read()
    except FileNotFoundError:
        project["markdown_content"] = "Error: Markdown file not found on disk."
    return project

def update_project(project_id: str, title: str = None, markdown_content: str = None) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if markdown_content is not None:
        cursor.execute('SELECT markdown_path FROM projects WHERE id = ?', (project_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return False
        
        markdown_path = row[0]
        with open(markdown_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
            
        word_count = len(markdown_content.split())
        last_modified = datetime.utcnow().isoformat()
        
        if title is not None:
            cursor.execute('UPDATE projects SET title = ?, last_modified = ?, word_count = ? WHERE id = ?', 
                           (title, last_modified, word_count, project_id))
        else:
            cursor.execute('UPDATE projects SET last_modified = ?, word_count = ? WHERE id = ?', 
                           (last_modified, word_count, project_id))
    else:
        if title is not None:
            cursor.execute('UPDATE projects SET title = ? WHERE id = ?', (title, project_id))
            
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def move_project(project_id: str, chapter_id: str) -> bool:
    if not chapter_id or chapter_id == "null":
        chapter_id = None
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE projects SET chapter_id = ? WHERE id = ?', (chapter_id, project_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_project(project_id: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT markdown_path FROM projects WHERE id = ?', (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
        
    markdown_path = row[0]
    if os.path.exists(markdown_path):
        os.remove(markdown_path)
        
    cursor.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()
    return True
