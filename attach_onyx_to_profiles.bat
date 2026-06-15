@echo off
setlocal
cd /d "%~dp0"
echo Attaching Onyx to dino-nerdzone.html and squishy-cottage.html...
py -3 tools\attach_onyx.py .
if errorlevel 1 (
  python tools\attach_onyx.py .
)
echo.
echo Done. If target files were found, backups end in .onyx-bak.html
pause
