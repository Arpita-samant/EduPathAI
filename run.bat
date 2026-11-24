@echo off
echo ========================================================
echo   EduPath AI - Personalized Career Guidance Platform
echo ========================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "EduPath AI Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting React + Vite Frontend on http://localhost:5173 ...
start "EduPath AI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Services launched!
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================================
