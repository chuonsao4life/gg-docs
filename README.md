# Collaborative Workspace Platform

> A real-time collaborative workspace system inspired by Google Docs, Notion, and Trello.

---

## Introduction

This project is a fullstack web application that enables users to collaborate in real-time on documents, tasks, and communication within shared workspaces.

---

##  Features

### Authentication

* Register / Login / Logout
* JWT authentication
* Session management (refresh token)


### Workspace Management

* Create workspace
* Invite members via link/email
* Manage members
* Role-based access:

  * Owner
  * Editor
  * Viewer


### Real-time Collaborative Document

* Multi-user editing (Google Docs-like)
* Conflict-free editing (CRDT - Yjs)
* Cursor presence (see others typing)
* Auto-save system
* Version history & restore


### Communication

* Realtime chat
* Instant messaging via WebSocket


### Notification & Activity Log

* Activity tracking:

  * Document updates
  * Task changes
  * Member actions
* Notification system:

  * Task assignment
  * Mentions (@user)
  * Invitations


### Kanban Task Board

* Create tasks
* Assign users
* Drag & drop (Todo → Doing → Done)
* Task comments

---

## System Architecture

```
Frontend (React + Tiptap)
        ↓
WebSocket (Socket.IO + Yjs)
        ↓
Backend (NestJS)
        ↓
--------------------------
| PostgreSQL (Main DB)  |
--------------------------
        ↓
--------------------------
| Redis (Realtime)     |
--------------------------
```

---

## 🧰 Tech Stack

### Backend

* NestJS
* Prisma ORM

### Frontend

* React
* Tiptap Editor

### Database

* PostgreSQL
* Redis

### Realtime

* Socket.IO
* Yjs (CRDT)


## 🗄️ Data Strategy

### PostgreSQL

Stores:

* Users
* Workspaces
* Membership & roles
* Documents metadata
* Tasks
* Messages
* Activity logs
* Version snapshots
* Invitations


### Redis

Stores:

* Online users
* Cursor presence
* Socket mapping
* Temporary session data


### Yjs (CRDT)

Handles:

* Document sync
* Conflict resolution
* Update logs & snapshots


## Realtime Flow

1. User opens document
2. WebSocket connection established
3. Yjs syncs data
4. Changes broadcast to all users
5. Periodic snapshot saved to DB

---

## Installation

### 1. Clone project

```bash

```

### 2. Install dependencies

```bash
# Backend


# Frontend

```

### 3. Environment variables

Create `.env` in backend:

```env

```

---

### 4. Run migration

```bash

```

---

### 5. Start project

```bash
# Backend


# Frontend

```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── workspaces/
│   ├── documents/
│   ├── tasks/
│   ├── chat/
│   ├── activity/
│   └── websocket/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── editor/
│   ├── hooks/
│   └── services/
```

---

## Roles & Permissions

| Role   | Description  |
| ------ | ------------ |
| Owner  | Full control |
| Editor | Edit content |
| Viewer | Read-only    |

---


## Core Concepts

### CRDT (Yjs)

* Conflict-free editing
* Real-time sync
* Offline support

---

### WebSocket (Socket.IO)

* Real-time communication
* Chat + document sync

---

### Redis

* Presence tracking
* Performance optimization

---

## Future Improvements

* Full-text search
* File upload
* Dark mode UI
* Mobile responsive
* Export PDF
* Analytics dashboard

---

## Learning Outcomes

* Realtime system design
* CRDT implementation
* Backend architecture
* Role-based authorization
* Fullstack development

---


## License

This project is for educational purposes.
