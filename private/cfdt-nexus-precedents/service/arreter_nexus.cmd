@echo off
rem Arrete le service local du module Precedents (port 8791 par defaut).
set "P=%NEXUS_PORT%"
if not defined P set "P=8791"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "127.0.0.1:%P%" ^| findstr LISTENING') do taskkill /PID %%a /F
