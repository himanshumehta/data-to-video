# data-to-video — common tasks. Run `make help`.
PYTHON ?= python3
VENV   := .venv
PY     := $(VENV)/bin/python
SLUG   ?= royal-enfield-classic-350-2024
LANG_  ?= en
SCALE  ?= 1

.PHONY: help setup demo demo-hi demo-silent test lint clean

help:
	@echo "make setup        Python venv + Remotion node modules"
	@echo "make demo         sample data -> pre-generated EN narration -> render -> MP4 (no credentials)"
	@echo "make demo-hi      same, Hindi narration"
	@echo "make demo-silent  any sample vehicle with silent narration: make demo-silent SLUG=ktm-250-duke"
	@echo "make test         offline unit tests"

setup:
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

lint:
	$(PY) -m compileall -q scripts content_types tests
	cd remotion && npx tsc --noEmit

clean:
	rm -rf output remotion/public/current-*.json remotion/public/vehicles
