
from flask import Flask
import importlib
import logging
from typing import Optional


if __name__ == "__main__":
    # Allow running directly for quick development.
    app = create_app()
    # Bind to 127.0.0.1:5000 by default; debug True for local development.
    app.run(host="127.0.0.1", port=5000, debug=True)
