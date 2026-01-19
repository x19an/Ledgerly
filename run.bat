
@echo off
start /b npm run dev
timeout /t 5 /nobreak > nul
start http://localhost:3000/
