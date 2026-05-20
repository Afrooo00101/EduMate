import os
import sys
from pathlib import Path

sys.dont_write_bytecode = True
os.environ.setdefault("PYTHONDONTWRITEBYTECODE", "1")

# Load .env explicitly so uvicorn reload subprocess inherits env vars
_env_path = Path(__file__).resolve().parent / ".env"
if _env_path.exists():
    with open(_env_path, encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _key, _, _val = _line.partition("=")
                os.environ.setdefault(_key.strip(), _val.strip())

import uvicorn
from app.config import get_settings

if __name__ == '__main__':
    get_settings.cache_clear()
    settings = get_settings()
    print(f"DEBUG: Using database URL: {settings.database_url}")
    uvicorn.run('app.main:app', host='127.0.0.1', port=8001, reload=True)



# Test URLs:
# Root: http://127.0.0.1:8001/
# Health: http://127.0.0.1:8001/health
# Swagger docs: http://127.0.0.1:8001/docs
