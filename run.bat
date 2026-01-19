
@echo off
echo Starting Ledgerly Backend...
start /b node server.js
echo Starting Ledgerly Frontend...
start /b npm run dev
timeout /t 5 /nobreak > nul
start http://localhost:3000/
