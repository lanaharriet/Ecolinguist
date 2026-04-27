Write-Host "Starting EcoLinguist Backend..."
Start-Process powershell -ArgumentList "-NoExit -Command cd backend; .\..\venv\Scripts\python manage.py runserver"

Write-Host "Starting EcoLinguist Frontend..."
Start-Process powershell -ArgumentList "-NoExit -Command cd frontend; npm run dev"

Write-Host "Both servers started in new windows!"
