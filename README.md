# Album Social

Rede social para avaliações de álbuns musicais.

## Tecnologias

- React
- Spring Boot
- PostgreSQL
- Docker

## Status

Em desenvolvimento.

## Frontend

The UI is a React/Vite application in `frontend/`. During development, Vite
serves the page at `http://localhost:5173` and proxies `/api` requests to the
Spring backend at `http://localhost:8080`.

To connect Spotify metadata:

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Copy `.env.example` to `.env` and replace both placeholder values. The `.env`
   file is ignored by Git and must not be committed:

   ```powershell
   Copy-Item .env.example .env
   ```

   Or set both variables in the same PowerShell window used to start the
   backend:

   ```powershell
   $env:SPOTIFY_CLIENT_ID = "your-client-id"
   $env:SPOTIFY_CLIENT_SECRET = "your-client-secret"
   ```

3. Start Spring Boot from `backend/album_boxd_api`.
4. Start React from `frontend` with `npm install` and `npm run dev`.

The React page searches Spotify through the Spring `/api/albums` endpoint.
The backend uses Spotify's Client Credentials flow, so the client secret never
reaches the browser. For a production/static build, run `npm run build`; Vite
outputs the bundle to Spring Boot's `src/main/resources/static` directory.

The React app includes an `All albums` page at `/#all-albums` with Spotify
search, year filtering, relevance/newest/oldest sorting, and a load-more
control. The API supports pagination with `limit` (1-10) and `offset`:

```text
/api/albums?query=year:2024&limit=10&offset=0
```

## Docker

Docker Compose runs PostgreSQL, the Spring API, and the React development server:

```powershell
docker compose up --build
```

If you use the PowerShell method, run those two `$env:` commands immediately
before `docker compose up --build` in the same terminal. If the variables are
missing, `/api/albums` returns `502` with a configuration message instead of
calling Spotify.

Open the React app at `http://localhost:5173` or the API at
`http://localhost:8080`. Stop the stack with `docker compose down`; add
`-v` only when you intentionally want to delete the PostgreSQL volume.

The Spotify credentials are passed into the API container at runtime and are
not stored in the image or exposed to the frontend container.

The Compose PostgreSQL password is currently `postgres` for local development
only. Change it before using the database outside a local development
environment.