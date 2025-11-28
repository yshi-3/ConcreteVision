# Repository Guidelines

ConcreteVision pairs a Flask-based Stable Diffusion API with a static frontend for prompt-driven concrete visualization. Use this guide to stay consistent and productive.

## Project Structure & Module Organization
- `app.py`: Flask entry point hosting `ImageGenerator` backed by the DreamShaper pipeline. Break out shared utilities into `api/` modules if the backend grows.
- `index.html`, `index.js`, `HeaderVideo.js`, `Scroll.js`, `video.js`: landing page and prompt UI logic. Consolidate reusable scripts under `js/` when adding new interactions.
- Assets (`tp1.png`, `tp2 (2).jpg`, `vidu-...mp4`) live in the root today; migrate new media to an `assets/` directory for clarity.
- `requirements.txt` defines the Python runtime. Keep local environments (`venv/`) and cached weights out of version control.

## Build, Test, and Development Commands
- `pip install -r requirements.txt`: install GPU/CPU dependencies for Stable Diffusion.
- `python app.py`: start the Flask API on `http://localhost:5000`.
- `python -m http.server 8000`: serve the static frontend locally (open `/index.html`).
- ``curl -X POST http://localhost:5000/generate -H 'Content-Type: application/json' -d '{"prompt":"brutalist tower"}'``: quick API smoke test.

## Coding Style & Naming Conventions
- Python: follow PEP 8, 4-space indents, and docstrings for public functions. Reuse the module-level `logger` for observability.
- JavaScript: keep the current 4-space indentation, camelCase functions (`generateImage`) and DOM IDs (`loadingIndicator`), and prefer async/await for network calls.
- HTML/CSS: minimize inline styles; move shared styles or animations into dedicated stylesheets as components evolve.

## Testing Guidelines
- Add backend tests with `pytest` under `tests/`; mock the diffusion pipeline so CI does not download large models.
- Cover `/generate` with request tests that assert status codes and base64 payload shape.
- Document manual frontend verification steps in PRs until automated browser tests are introduced.

## Commit & Pull Request Guidelines
- History shows short imperative titles (`fix`, `Add files via upload`); keep that tone but add context (e.g., `Improve prompt validation`).
- Group related changes per commit; isolate heavy asset or model updates with clear reasoning.
- PRs should state motivation, include screenshots or GIFs for UI changes, link issues or specs, and call out GPU/runtime prerequisites for reviewers.

## Environment & Security Notes
- Keep Hugging Face tokens, CUDA flags, and other secrets in `.env` files excluded by `.gitignore`.
- Update `requirements.txt` when adjusting `diffusers`, `torch`, or Flask versions, and flag compatibility considerations in review.
