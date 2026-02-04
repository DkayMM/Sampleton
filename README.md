# 🚀 Sampleton Stack (Django + React + PostgreSQL + Docker)

Plantilla base para proyectos Full Stack.

## 🛠️ Requisitos Previos
- Python 3.10+
- Node.js 18+
- Docker Desktop (Opcional para DB)

## 🐍 Backend (Django)
1. Entrar en la carpeta: `cd Backend`
2. Crear entorno: `python -m venv venv`
3. Activar: `venv\Scripts\activate` (Windows)
4. Instalar dependencias: `pip install -r requirements.txt`
5. Migrar DB: `python manage.py migrate`
6. Correr servidor: `python manage.py runserver`

## ⚛️ Frontend (React)
1. Entrar en la carpeta: `cd Frontend`
2. Instalar dependencias: `npm install`
3. Correr servidor: `npm run dev`

## 🐳 Docker (Base de Datos)
Para levantar PostgreSQL:
`docker-compose up -d`