#!/usr/bin/env python3
"""CLI entry point for running the ConcreteVision API."""

import os
import logging

from app import app


def run():
    """Start the Flask development server."""
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    logging.getLogger("werkzeug").setLevel(logging.INFO)
    app.run(host=host, port=port)


if __name__ == "__main__":
    run()
