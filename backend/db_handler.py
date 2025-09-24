import sqlite3

conn = sqlite3.connect('metadata.db')
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS text_chunks (
    id INTEGER PRIMARY KEY,        -- FAISS ID
    file_path TEXT,
    page INTEGER,
    chunk_text TEXT,
    char_start INTEGER,
    char_end INTEGER
)
''')

c.execute('''
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY,        -- FAISS ID
    file_path TEXT,
    page INTEGER,
    image_index INTEGER,
    ocr_text TEXT
)
''')

conn.commit()

def insert_text_chunk(id, file_path, page, chunk_text, char_start, char_end):
    c.execute('''
    INSERT INTO text_chunks (id, file_path, page, chunk_text, char_start, char_end)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (id, file_path, page, chunk_text, char_start, char_end))
    conn.commit()
def insert_image(id, file_path, page, image_index, ocr_text):
    c.execute('''
    INSERT INTO images (id, file_path, page, image_index, ocr_text)
    VALUES (?, ?, ?, ?, ?)
    ''', (id, file_path, page, image_index, ocr_text))
    conn.commit()

def get_metadata_by_faiss_id(faiss_id):
    
    c.execute("SELECT * FROM text_chunks WHERE id=?", (faiss_id,))
    result = c.fetchone()
    if result:
        return {"type": "text", **dict(zip([c[0] for c in c.description], result))}

    c.execute("SELECT * FROM images WHERE id=?", (faiss_id,))
    result = c.fetchone()
    if result:
        return {"type": "image", **dict(zip([col[0] for col in c.description], result))}
    return None

def get_next_id():
    c.execute("SELECT MAX(id) FROM text_chunks")
    max_text_id = c.fetchone()[0] or 0
    c.execute("SELECT MAX(id) FROM images")
    max_image_id = c.fetchone()[0] or 0
    next_id = max(max_text_id, max_image_id) + 1
    return next_id

def close_connection():
    conn.close()