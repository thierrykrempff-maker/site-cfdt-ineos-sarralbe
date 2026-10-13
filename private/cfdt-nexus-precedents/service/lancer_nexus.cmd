@echo off
rem Lance le service local du module Precedents (127.0.0.1 uniquement) et ouvre la page.
rem Variables facultatives : NEXUS_PV_INDEX, NEXUS_PORT, NEXUS_ALLOWED_ORIGINS (voir server.py).
start "" /min pythonw -I "%~dp0server.py" --open
