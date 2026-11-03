# data-to-video — common tasks. Run `make help`.
# Newest Python 3.11+ on PATH (Pillow 13 and the patched urllib3/requests need 3.11).
PYTHON ?= $(shell for v in python3.14 python3.13 python3.12 python3.11 python3; do \
            command -v $$v >/dev/null 2>&1 && $$v -c 'import sys; sys.exit(sys.version_info < (3, 11))' \
            && { echo $$v; break; }; done)
VENV   := .venv
PY     := $(VENV)/bin/python
SLUG   ?= royal-enfield-classic-350-2024
LANG_  ?= en
SCALE  ?= 1

.PHONY: help setup demo demo-hi demo-silent test eval lint audit clean

help:
	@echo "make setup        Python venv + Remotion node modules"
	@echo "make demo         sample data -> pre-generated EN narration -> render -> MP4 (no credentials)"
	@echo "make demo-hi      same, Hindi narration"
	@echo "make demo-silent  any sample vehicle with silent narration: make demo-silent SLUG=ktm-250-duke"
	@echo "make test         offline unit tests"
	@echo "make eval         numeric guard eval: recall per mutation type, false-positive rate"
	@echo "make lint         ruff + TypeScript type-check"
	@echo "make audit        dependency audits (pip-audit, npm audit) + bandit"

setup:
	@test -n "$(PYTHON)" || { echo "Python 3.11 or newer is required"; exit 1; }
	$(PYTHON) -m venv $(VENV)
	$(PY) -m pip install --quiet --upgrade pip
	$(PY) -m pip install --quiet -r requirements-dev.txt
	cd remotion && npm ci --no-audit --no-fund

demo:
	$(PY) scripts/ownership_pipeline.py --slug $(SLUG) --lang $(LANG_) --tts prebaked --scale $(SCALE)

demo-hi:
	$(PY) scripts/ownership_pipeline.py --slug $(SLUG) --lang hi --tts prebaked --scale $(SCALE)

demo-silent:
	$(PY) scripts/ownership_pipeline.py --slug $(SLUG) --lang $(LANG_) --tts silent --scale $(SCALE)

test:
	$(PY) -m pytest -q

eval:
	$(PY) evals/numeric_guard/run.py --check

lint:
	$(VENV)/bin/ruff check .
	cd remotion && npx tsc --noEmit

audit:
	$(VENV)/bin/pip-audit -r requirements.txt -r requirements-tts.txt -r requirements-dev.txt
	$(VENV)/bin/bandit -q -c pyproject.toml -r scripts content_types
	cd remotion && npm audit --omit=dev --audit-level=high

clean:
	rm -rf output remotion/public/current-*.json remotion/public/vehicles
