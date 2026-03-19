# Student Learning Dashboard - Backend

FastAPI + MongoDB backend для Student Learning Dashboard

## Setup

### 1. Установить зависимости

```bash
pip install -r requirements.txt
```

### 2. Создать `.env` файл

```bash
cp .env.example .env
```

Заполните `.env` с вашими данными MongoDB:

```
MONGO_URL=mongodb+srv://db_user:<your_password>@cluster0.grd1rwb.mongodb.net/
MONGO_DB_NAME=student_learning_db
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

### 3. Запустить сервер

```bash
python main.py
```

Или с hot reload:

```bash
uvicorn main:app --reload
```

Сервер будет доступен на `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя
- `POST /api/auth/google` - Вход/регистрация через Google
- `GET /api/auth/me` - Получить текущего пользователя

### Courses
- `GET /api/courses/` - Получить все курсы пользователя
- `POST /api/courses/` - Создать новый курс
- `POST /api/courses/{course_id}/grade` - Добавить оценку
- `POST /api/courses/{course_id}/attendance` - Логировать посещаемость

### Code Review
- `POST /api/code-review/review` - Отправить код на рецензию
- `GET /api/code-review/history` - История рецензий

### GitHub
- `POST /api/github/link-repo` - Связать GitHub репозиторий
- `GET /api/github/repos` - Получить связанные репозитории
- `POST /api/github/sync/{repo_id}` - Синхронизировать коммиты

## Документация

После запуска сервера, перейдите на:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Структура проекта

```
Backend/
├── app/
│   ├── core/           # Конфигурация и подключение БД
│   ├── models/         # Pydantic модели
│   ├── routes/         # API маршруты
│   └── services/       # Бизнес логика
├── main.py            # Главное приложение FastAPI
├── requirements.txt   # Зависимости Python
└── README.md         # Этот файл
```

## Следующие шаги

1. **Интегрировать OpenAI API** для AI Code Review (в `app/services/code_review.py`)
2. **Добавить оутентификацию GitHub** (OAuth2)
3. **Настроить переменные окружения** с реальными ключами API
4. **Развернуть на сервер** (Heroku, Railway, etc.)
