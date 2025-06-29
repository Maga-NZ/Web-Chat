# Messaging App with Django Channels, Redis & Docker

A lightweight real-time messaging app built with Django Channels, Redis, and Docker. This is an early-stage portfolio project focused on backend infrastructure and WebSocket communication.

---

## What’s Ready

- Django app containerized with Docker
- Redis channel layer for WebSocket message routing
- Working WebSocket connection with `Django Channels`
- Basic HTML + JavaScript frontend for sending messages
- Dynamic chat rooms with real-time messaging
- Clean project structure for future extension

---

## Stack

- Python 3.12
- Django 5.x
- Django Channels
- Redis
- Docker / docker-compose
- HTML + JavaScript frontend

---

## Getting Started

1. **Clone the project**
```bash
git clone https://github.com/Maga-NZ/messaging-app-infra.git
cd messaging-app-infra
```

2. **Build and run containers**
```bash
docker-compose up --build
```

3. **Open the app**
```
http://localhost:8000/
```

Enter a room name to join the chat.

---

## Project Structure

```bash
├── chat/
│   ├── consumers.py
│   ├── routing.py
│   ├── views.py
│   ├── models.py
│   └── templates/
├── messaging_app/
│   ├── settings.py
│   ├── asgi.py
│   └── urls.py
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## Planned Features

- Message storage in PostgreSQL
- User identity / authentication
- Hosting & CI/CD pipeline
- Admin panel / room stats

---

## Author

Created by [@Maga-NZ](https://github.com/Maga-NZ)

This project is part of my DevOps/Cloud Engineer & Fullstack learning journey.
