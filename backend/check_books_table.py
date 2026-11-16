import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    port=os.getenv('DB_PORT'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)

cursor = conn.cursor()

# Get books table structure
print("📚 Books table structure:")
cursor.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name='books'
    ORDER BY ordinal_position
""")

columns = cursor.fetchall()
for col in columns:
    length = f"({col[2]})" if col[2] else ""
    print(f"  {col[0]}: {col[1]}{length}")

# Get sample data
print("\n📖 Sample book data (first row):")
cursor.execute("SELECT * FROM books LIMIT 1")
book = cursor.fetchone()
if book:
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='books' ORDER BY ordinal_position")
    col_names = [c[0] for c in cursor.fetchall()]
    
    for i, col_name in enumerate(col_names):
        print(f"  {col_name}: {book[i]}")

# Get users table structure
print("\n👤 Users table structure:")
cursor.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name='users'
    ORDER BY ordinal_position
""")

columns = cursor.fetchall()
for col in columns:
    length = f"({col[2]})" if col[2] else ""
    print(f"  {col[0]}: {col[1]}{length}")

cursor.close()
conn.close()
