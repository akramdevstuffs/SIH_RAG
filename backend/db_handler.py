import sqlite3
from pathlib import Path

DB_PATH = "metadata.db"

_conn = None
_cursor = None

def get_db():
    "Ensure a single connection to the database."
    global _conn, _cursor
    if _conn is None:
        db_exists = Path(DB_PATH).exists()
        _conn = sqlite3.connect(DB_PATH, check_same_thread=False) # Allow usage in multiple threads
        _cursor = _conn.cursor() 
        if not db_exists:
            init_schema()
    return _conn, _cursor

def init_schema():
    conn, c = get_db()
    # Create tables if they don't exist
    c.execute('''
    CREATE TABLE IF NOT EXISTS files (
        file_id INTEGER PRIMARY KEY,
        file_name TEXT,
        file_path TEXT UNIQUE
    )
    ''')
    c.execute('''
    CREATE TABLE IF NOT EXISTS text_chunks (
        id INTEGER PRIMARY KEY,        -- FAISS ID
        file_id INTEGER,
        page INTEGER,
        chunk_text TEXT,
        char_start INTEGER,
        char_end INTEGER,
        FOREIGN KEY(file_id) REFERENCES files(file_id)
        )
    ''')
    c.execute('''
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY,        -- FAISS ID
        file_id INTEGER,
        page INTEGER,
        image_index INTEGER,
        ocr_text TEXT,
        FOREIGN KEY(file_id) REFERENCES files(file_id)
    )
    ''')
    conn.commit()


# - -  - -- - - --  Insert Operations --- - - -- - 

def insert_file(file_name, file_path):
    conn, c = get_db()
    c.execute('''
    INSERT OR IGNORE INTO files (file_name, file_path)
    VALUES (?, ?)
    ''', (file_name, file_path))
    conn.commit()
    c.execute('SELECT file_id FROM files WHERE file_path=?', (file_path,))
    return c.fetchone()[0]

def change_file_path(old_path, new_path):
    conn, c = get_db()
    c.execute('''
    UPDATE files
    SET file_path=?
    WHERE file_path=?
    ''', (new_path, old_path))
    conn.commit()

def insert_text_chunk(id, file_id, page, chunk_text, char_start, char_end):
    conn, c = get_db()
    c.execute('''
    INSERT INTO text_chunks (id, file_id, page, chunk_text, char_start, char_end)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (id, file_id, page, chunk_text, char_start, char_end))
    conn.commit()
def insert_image(id, file_id, page, image_index, ocr_text):
    conn, c = get_db()
    c.execute('''
    INSERT INTO images (id, file_id, page, image_index, ocr_text)
    VALUES (?, ?, ?, ?, ?)
    ''', (id, file_id, page, image_index, ocr_text))
    conn.commit()

# - -  - -- - - --  Query Operations --- - - -- -

def get_metadata_by_faiss_id(faiss_id):
    conn, c = get_db()
    c.execute("SELECT * FROM text_chunks WHERE id=?", (faiss_id,))
    result = c.fetchone()
    if result:
        # Update file_id to file_name, file_path 
        file_id = result[1]
        c.execute("SELECT file_name, file_path FROM files WHERE file_id=?", (file_id,))
        file_info = c.fetchone()
        metadata = {
            "type": "text_chunk",
            "faiss_id": result[0],
            "file_id": file_id,
            "file_name": file_info[0] if file_info else None,
            "file_path": file_info[1] if file_info else None,
            "page": result[2],
            "chunk_text": result[3],
            "char_start": result[4],
            "char_end": result[5]
        }
        return metadata

    c.execute("SELECT * FROM images WHERE id=?", (faiss_id,))
    result = c.fetchone()
    if result:
        file_id = result[1]
        c.execute("SELECT file_name, file_path FROM files WHERE file_id=?", (file_id,))
        file_info = c.fetchone()
        metadata = {
            "type": "image",
            "faiss_id": result[0],
            "file_id": file_id,
            "file_name": file_info[0] if file_info else None,
            "file_path": file_info[1] if file_info else None,
            "page": result[2],
            "image_index": result[3],
            "ocr_text": result[4]
        }
        return metadata
    return None

def get_next_id():
    conn, c = get_db()
    c.execute("SELECT MAX(id) FROM text_chunks")
    max_text_id = c.fetchone()[0] or 0
    c.execute("SELECT MAX(id) FROM images")
    max_image_id = c.fetchone()[0] or 0
    next_id = max(max_text_id, max_image_id) + 1
    return next_id

def close_connection():
    global _conn, _cursor
    if _conn:
        _conn.close()
        _conn = None
        _cursor = None
        print("Database connection closed.")
    else:
        print("No database connection to close.")