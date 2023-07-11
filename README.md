# projet_production

### Installation et lancement :

```bash
npm i
```

```bash
npm run build
```

```bash
npm run start
```

## Déploiement de l'application

Assurez-vous d'avoir un .env complet avec les bonnes données.

- Build du container :
docker build --env-file .env -t projet_production .

- Run du container pour vérifier que l'image fonctionne :
docker run -d -p 8000:8000 projet_production

- Initialiser un nouveau repo Git à la racine
git init

- Déploiement sur heroku
heroku login
[heroku create projet_production]
git push heroku master



