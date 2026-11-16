import psycopg2
from psycopg2 import pool
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)
load_dotenv()

# Create connection pool
connection_pool = None

def init_db_pool():
    global connection_pool
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 20,
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        print("✅ Database connection pool created successfully")
    except Exception as e:
        print(f"❌ Error creating connection pool: {e}")
        raise e

def get_db_connection():
    """Get a connection from the pool"""
    if connection_pool:
        return connection_pool.getconn()
    raise Exception("Connection pool not initialized")

def release_db_connection(conn):
    """Return connection to the pool"""
    if connection_pool:
        connection_pool.putconn(conn)

def close_db_pool():
    """Close all connections in the pool"""
    if connection_pool:
        connection_pool.closeall()
        print("✅ Database connection pool closed")

# Context manager for database connections
class DatabaseConnection:
    def __enter__(self):
        self.conn = get_db_connection()
        self.cursor = self.conn.cursor()
        return self.cursor
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.conn.rollback()
        else:
            self.conn.commit()
        self.cursor.close()
        release_db_connection(self.conn)
