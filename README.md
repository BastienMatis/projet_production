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
docker-compose build

- Run du container pour vérifier que l'image fonctionne :
docker compose-up

- Déploiement sur heroku
heroku login
heroku container:login
heroku stack:set container
heroku container:push web --app projet-production-hollygirls
heroku container:release web --app projet-production-hollygirls

- Avoir les logs en cas d'erreur
heroku logs --tail


