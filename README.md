# Collab Docs

A full-stack collaborative document application built with Next.js, Express, Prisma, and PostgreSQL. This repository currently includes authentication flows, the core database schema for documents and permissions, and the base client/server setup for future real-time editing features.

## 🏗️ Project Structure

```text
collab-doc-editor/
├── client/           # Next.js frontend application
│   └── src/app/      # App Router pages and layouts
├── server/           # Express API + Prisma ORM
│   ├── prisma/       # Prisma schema, migrations, and seed script
│   └── src/          # Routes, controllers, middleware, server entry
└── README.md         # Project setup and team workflow
```

## ✨ Current Scope

- User authentication: register, login, and forgot-password flow
- Express REST API with health check endpoint
- Prisma data models for users, documents, permissions, comments, and snapshots
- Next.js client with auth pages and dashboard-ready foundation

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL**
- **Git**

### Initial Setup

1. **Clone the repository**

```bash
git clone https://github.com/Ldieu0604/Nhom17-IT4409-20252.git
cd collab-doc-editor
```

2. **Install dependencies**

```bash
cd server
npm install

cd ../client
npm install
```

3. **Configure environment variables**

```bash
# Server
cd ../server
cp .env.example .env
```


```bash
# Server
cd ../client
cp .env.example .env.local
```

4. **Set up the database**

```bash
cd server

# Generate Prisma client
npm run prisma:generate

# Apply migrations
npm run prisma:migrate

# Seed sample data
npm run db:seed
```

5. **Start the backend**

```bash
cd server
npm run dev
```

The backend will start at `http://localhost:4000`

6. **Start the frontend**

```bash
cd client
npm run dev
```

The frontend will start at `http://localhost:3000`

### Useful Endpoints

- `GET /api/health` - Server health check
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/forgot-password` - Mock forgot password flow

## 👥 Team Development Guide

### Git Workflow

We use **Feature Branch Workflow** with the following branches:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches

### Creating a new feature

1. **Update your local develop branch**

```bash
git checkout develop
git pull origin develop
```

2. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

3. **Work on your feature**

```bash
git add .
git commit -m "feat: add your feature description"
```

4. **Push your branch**

```bash
git push origin feature/your-feature-name
```

5. **Create a Pull Request**
   - Go to GitHub
   - Create PR from your feature branch to `develop`
   - Assign reviewers
   - Wait for approval and merge

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/approval-workflow`)
- `fix/` - Bug fixes (e.g., `fix/pdf-export-error`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### Commit Message Convention

Format: `<type>: <description>`

Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Build process or auxiliary tool changes

Examples:

```bash
git commit -m "feat: add work order approval API"
git commit -m "fix: resolve PDF signature embedding issue"
git commit -m "docs: update API documentation"
```

## 📝 API Documentation

API routes are available under `/api`. Key endpoints:

| Method | Endpoint             | Description |
| ------ | -------------------- | ----------- |
| POST   | `/api/auth/login` | Đăng nhập   |
