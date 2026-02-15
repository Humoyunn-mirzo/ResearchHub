# ResearchHub

A research collaboration platform focusing on regional issues, bridging academia between Central Asian and European Union universities

## 🌍 Overview
This platform bridges academia by enabling:
- Professors to post research topics, details, and student requirements
- Students to apply and schedule interviews through the platform
- Rankings of universities and professors based on platform activity and engagement


## 🚀 Features
- Professor profiles & research topic listings
- Student profiles & application system
- Interview scheduling interface
- University & professor activity-based rankings
- Admin interface for moderation & stats


## 🧱 Tech Stack
- **Frontend**: React, Next.js, TailwindCSS
- **Backend**: Node.js (API routes), possibly integrated with a NoSQL/SQL DB


## 📁 Folder Structure
├── frontend/ # Frontend source code (pages, components, styles)
├── backend/ # Backend routes (API handlers, DB logic, auth)
├── .gitignore # Ignored files and folders for Git
└── README.md # Project documentation

## 📦 Usage

You can build and run the entire platform using Docker Compose.

> [!IMPORTANT]
> Make sure to run all Docker commands **from the root folder** of the project  
> (the folder containing `compose.yaml`).


### Requirements

- You must have Docker installed
- For windows users - you must use WSL2
- You must also create an `.env` file 

The `.env` file's contents must be like so:
```
DB_USER=admin
DB_PASSWORD=password
JWT_SECRET=SecretJwtKeyThatIsAtLeast32BytesLongInBase64

# For subpath deployment (e.g. usp.uz/api)
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_DATA_MODE=real
```
When running locally the user and password don't matter, but in production, a secret password will be used, which must not be leaked.
When deploying to production, the JWT secret must be generated using the following command:
```
openssl rand -base64 32
```


### Build, Run and Stop the project
This command builds updated images and starts all services in the background:

```
docker compose up -d --build
```

This command shuts down all the services running in the background:

```
docker compose down
```

### Subpath deployment (usp.uz)

When deploying behind nginx on a shared domain (e.g. usp.uz):

| Path | Service |
|------|---------|
| `usp.uz/` | ResearchHub frontend |
| `usp.uz/api/` | ResearchHub backend |
| `usp.uz/other-app/` | Another project (configure in nginx.conf) |

Set `NEXT_PUBLIC_API_URL=/api` in `.env` so the frontend uses the same-origin API path. To add your other project, edit `nginx/nginx.conf` and replace the `/other-app/` placeholder with a proxy to your app's container.

### Demo data

On first run, the database is seeded with 3 demo projects and a demo professor account:
- **Email:** demo@researchhub.local
- **Password:** password

Professors can create new projects; they appear for all users. Students see projects on the projects page and dashboard. Use the **Refresh** button to fetch the latest projects.
