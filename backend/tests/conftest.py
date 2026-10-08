import os
import tempfile

# Point the app at a throwaway database before it's imported
_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["UPLOAD_DIR"] = f"{_tmp}/uploads"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

GUEST = {"X-User-Id": "6"}   # Aarav (seeded guest)
HOST = {"X-User-Id": "1"}    # Priya (seeded superhost)
OTHER_HOST = {"X-User-Id": "2"}


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:  # context manager runs startup -> creates tables and seeds
        yield c
