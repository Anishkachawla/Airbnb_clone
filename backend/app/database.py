"""SQLAlchemy engine/session setup and a FastAPI dependency that yields one session per request."""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL

# check_same_thread=False: FastAPI runs sync endpoints in a thread pool, so a connection
# may be used from a different thread than the one that created it.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


@event.listens_for(engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_conn, _record):
    # SQLite ignores FOREIGN KEY constraints (and ON DELETE CASCADE) unless this is set per connection
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
