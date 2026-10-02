@echo off
title SmartQueue - Digital Queue Management System
set PATH=C:\Users\Student\AppData\Local\Programs\nodejs;%PATH%
cd /d "%~dp0"
echo Starting SmartQueue Server...
start "" "http://localhost:5000"
node server/server.js
pause
