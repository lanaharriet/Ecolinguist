python -m venv venv
.\venv\Scripts\python -m pip install --upgrade pip
.\venv\Scripts\pip install django djangorestframework psycopg2 python-dotenv django-cors-headers requests
.\venv\Scripts\django-admin startproject config backend

npx -y create-vite@latest frontend --template react
cd frontend
npm install
npm install tailwindcss @tailwindcss/vite react-router-dom axios lucide-react
cd ..

Write-Host "Setup Completed"
