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

A interface é uma aplicação React/Vite localizada em `frontend/`. Durante o
desenvolvimento, o Vite disponibiliza a aplicação em
`http://localhost:5173` e encaminha as requisições para `/api` no backend
Spring em `http://localhost:8080`.

### Configurando os metadados do Spotify

1. Crie uma aplicação no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Copie `.env.example` para `.env` e substitua os dois valores de exemplo. O
   arquivo `.env` é ignorado pelo Git e não deve ser commitado:

   ```powershell
   Copy-Item .env.example .env
   ```

   Como alternativa, defina as duas variáveis na mesma janela do PowerShell
   usada para iniciar o backend:

   ```powershell
   $env:SPOTIFY_CLIENT_ID = "your-client-id"
   $env:SPOTIFY_CLIENT_SECRET = "your-client-secret"
   ```

3. Inicie o Spring Boot a partir de `backend/album_boxd_api`.
4. Inicie o React a partir de `frontend` usando `npm install` e `npm run dev`.

A página React pesquisa o catálogo do Spotify por meio do endpoint Spring
`/api/albums`. O backend usa o fluxo de autenticação Client Credentials do
Spotify, portanto o client secret nunca chega ao navegador. Para gerar uma
build estática/de produção, execute `npm run build`; o Vite colocará os
arquivos gerados no diretório `src/main/resources/static` do Spring Boot.

A aplicação React inclui uma página `All albums` em `/#all-albums`, com busca no
Spotify, filtro por ano, ordenação por relevância/mais recentes/mais antigos e
um botão para carregar mais resultados. A API oferece paginação com `limit`
(1-10) e `offset`:

```text
/api/albums?query=year:2024&limit=10&offset=0
```

## Docker

O Docker Compose executa o PostgreSQL, a API Spring e o servidor de
desenvolvimento React:

```powershell
docker compose up --build
```

Se você usar o método com PowerShell, execute os dois comandos `$env:`
imediatamente antes de `docker compose up --build`, na mesma janela do
terminal. Se as variáveis não estiverem definidas, `/api/albums` retornará
`502` com uma mensagem de configuração sem chamar o Spotify.

Abra a aplicação React em `http://localhost:5173` ou a API em
`http://localhost:8080`. Para parar os serviços, use
`docker compose down`; adicione `-v` somente quando quiser apagar
intencionalmente o volume do PostgreSQL.

As credenciais do Spotify são passadas para o container da API em tempo de
execução. Elas não são armazenadas na imagem nem expostas ao container do
frontend.

A senha do PostgreSQL no Compose é atualmente `postgres` e deve ser usada
somente em desenvolvimento local. Altere-a antes de utilizar o banco fora de
um ambiente local.