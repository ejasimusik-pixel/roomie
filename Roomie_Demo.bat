@echo off
title Roomie Premium Demo
color 0D

echo ============================================================
echo.
echo         ✨ LEVANTANDO ROOMIE - DEMO CINEMATICA ✨
echo.
echo ============================================================
echo.
echo Iniciando el entorno frontend...
echo El navegador se abrira automaticamente en unos segundos.
echo.
echo (Para apagar el servidor al terminar, simplemente cierra esta ventana o presiona Ctrl+C)
echo.

:: Se asegura de ir al directorio donde esta el .bat y luego a frontend
cd /d "%~dp0frontend"
npm start

pause
