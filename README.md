<div align="center">

<img src="images/car.jpg" alt="USC Racing FSAE car #109 on track" width="100%">

# Formula SAE Dashboard

**Forms, LDX injection, and live telemetry for the race team, in one system.**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2018-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

Formula SAE Dashboard gives subteams their own role-scoped forms, keeps a full
audit trail of every update, injects the latest configuration values into MoTeC
`.ldx` files, and streams live telemetry into a browser dashboard. It runs as a
FastAPI backend and a Next.js frontend, with SQLite for persistence.

## What it does

- **Role-based access** for admin and subteam users, with up to two roles each
- **YAML-driven forms** that prefill current values and log every field change
- **Automatic LDX injection** into new `.ldx` files, with a recorded audit of
  exactly what was written and where
- **Self-healing LDX** that re-checks tracked files and restores injected values
  removed by a later MoTeC rewrite
- **Live telemetry dashboard** with line, gauge, and numeric widgets
- **Flexible telemetry inputs** across simulated, serial modem, and UDP
  broadcast sources, switchable from the admin UI
- **Admin control center** for users, sensors, telemetry config, audit history,
  and LDX file management

## Stack

| Layer | Tech |
| --- | --- |
| Backend | FastAPI, SQLModel, SQLite, WebSockets |
| Frontend | Next.js 14 App Router, React 18, Tailwind CSS, shadcn/ui, SWR, Recharts |
| Deployment | Docker Compose |
| Telemetry | Simulated generator, Digi Bee SX serial bridge, passive UDP listener |

## Quick start

With Docker:

```bash
cp .env.example .env          # set ADMIN_*, JWT_SECRET, NEXT_PUBLIC_API_URL
mkdir -p ldx
docker compose up --build -d
```

Then open the dashboard at `http://localhost:3000`.

Running the backend and frontend directly instead? See
[**DOCS.md → Local Development**](DOCS.md#local-development).

## Documentation

Full setup, deployment, configuration, and operations live in
**[DOCS.md](DOCS.md)**:

- [System Overview](DOCS.md#system-overview) and [Roles](DOCS.md#roles)
- [Local Development](DOCS.md#local-development) and [Docker Deployment](DOCS.md#docker-deployment)
- [Environment Variables](DOCS.md#environment-variables)
- [Form Schema](DOCS.md#form-schema)
- [Admin Workflow](DOCS.md#admin-workflow), [LDX Lifecycle](DOCS.md#ldx-lifecycle), and [Telemetry Operations](DOCS.md#telemetry-operations)
- [Troubleshooting](DOCS.md#troubleshooting) and [Repository Layout](DOCS.md#repository-layout)

<div align="center">
<sub>USC Racing &middot; Fight On!</sub>
</div>
