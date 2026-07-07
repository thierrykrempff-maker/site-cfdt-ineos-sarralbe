@echo off
setlocal

cd /d "%~dp0"

if not exist "reports" mkdir "reports"

set "PYTHON_EXE="
set "PYTHON_ARGS="
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  set "PYTHON_EXE=py"
  set "PYTHON_ARGS=-3"
)

if not defined PYTHON_EXE (
  where python >nul 2>nul
  if %ERRORLEVEL% EQU 0 set "PYTHON_EXE=python"
)

if not defined PYTHON_EXE (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" (
    set "PYTHON_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
  )
)

if not defined PYTHON_EXE (
  echo Python est introuvable.
  echo Installez Python 3 ou ajoutez-le au PATH, puis relancez ce fichier.
  if not defined NEXUS_NO_PAUSE pause
  exit /b 2
)

"%PYTHON_EXE%" %PYTHON_ARGS% "scripts\generate_nexus_report.py"
set "NEXUS_EXIT_CODE=%ERRORLEVEL%"

echo.
if exist "reports\latest-nexus-test-report.txt" (
  for /f "usebackq delims=" %%R in ("reports\latest-nexus-test-report.txt") do set "NEXUS_REPORT=%%R"
)
if defined NEXUS_REPORT echo Rapport genere : %NEXUS_REPORT%

if %NEXUS_EXIT_CODE% EQU 0 echo Synthese : OK
if %NEXUS_EXIT_CODE% EQU 1 echo Synthese : A corriger
if %NEXUS_EXIT_CODE% GEQ 2 echo Synthese : Bloquant

echo.
if not defined NEXUS_NO_PAUSE pause
exit /b %NEXUS_EXIT_CODE%
