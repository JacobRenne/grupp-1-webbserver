# Movie API Project

Ett komplett REST API för att hantera filmer, skådespelare, regissörer och genrer.

## Innehåll
- CRUD-operationer för:
  - Movies
  - Actors
  - Directors
  - Genres
- Stöd för relationer:
  - Varje film kan ha flera skådespelare och flera genrer.
  - Varje film har en (1) regissör.
- Testfärdiga Insomnia API-anrop (importfil bifogad)

---

## Tekniker
- Node.js + Express
- MySQL
- Insomnia (testklient)

## Projektstruktur

```bash
/db.js            # MySQL-anslutning
/controllers/     # CRUD-logik för varje resurs (movies, actors, genres, directors)
/routes/          # API-endpoints
/app.js           # Startpunkt för servern
```

## Installation

Klona repot
1. HTTPS
(https://github.com/JacobRenne/grupp-1-webbserver.git)

2. SSH
(git@github.com:JacobRenne/grupp-1-webbserver.git)

Installera beroenden:

1. Skapa package.json fil
```bash
npm init
```

2. Starta servern:
```bash
node app.js
```

3. Installera Express (lokalt i den mapp du har filerna)
```bash
npm install express
```

4. Installera MySQL
```bash
npm install mysql2
```

5. Installera cors (När man använder Vue Vite då man startar upp en lokal webbserver på ett annat port-nummer behöver man ha stöd för cors-request)
(https://expressjs.com/en/resources/middleware/cors.html)
```bash
npm install cors
```

6. Servern körs på:
```bash
http://localhost:3000
```

## 🛠️ Setup av databas

1. Gå till `database/`-mappen.
2. Byt namn på `movieDb-setup.txt` till `movieDb-setup.sql`.
3. Importera sedan med:

```bash
mysql -u root -p < database/movieDb-setup.sql


- Kör `database.sql` för att skapa och fylla databasen.
- Öppna MySQL och kör följande för att skapa databasen:
```sql
SOURCE /sök/till/database.sql
```

> OBS: Säkerställ att MySQL-databasen heter **movieDb**

## Testa API

1. 🔄 Importera `movie-api-project - full crud i insomnia` i Insomnia
2. Kör färdiga anrop för GET, POST, PUT, DELETE

## API Endpoints

### Movies
- `GET /api/movies` - Hämta alla filmer (med genres och skådespelare)
- `GET /api/movies/:id` - Hämta film efter ID
- `POST /api/movies` - Skapa en film
- `PUT /api/movies/:id` - Uppdatera film
- `DELETE /api/movies/:id` - Radera film

### Genres
- `GET /api/genres`
- `GET /api/genres/:id`
- `POST /api/genres`
- `PUT /api/genres/:id`
- `DELETE /api/genres/:id`

### Actors
- `GET /api/actors`
- `GET /api/actors/:id`
- `POST /api/actors`
- `PUT /api/actors/:id`
- `DELETE /api/actors/:id`

### Directors
- `GET /api/directors`
- `GET /api/directors/:id`
- `POST /api/directors`
- `PUT /api/directors/:id`
- `DELETE /api/directors/:id`

## Exempel på en film (GET /api/movies)

```json
[
  {
    "movieId": 1,
    "title": "Inception",
    "releaseYear": 2010,
    "directorName": "Christopher Nolan",
    "genres": ["Action", "Drama"],
    "actors": ["Leonardo DiCaprio"]
  }
]
```

## Författare
- Projekt skapat av Grupp 1, IT - Högskolan

---

