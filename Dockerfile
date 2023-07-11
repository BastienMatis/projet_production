# Utilisez l'image officielle Node.js en tant qu'image de base
FROM node:18

# Forcer l'utilisation des miroirs français
COPY ./docker/sources.list /etc/apt/sources.list

# Créer l'utilisateur et son groupe, installer des paquets
RUN apt-get update \
    && apt-get install -y sudo \
    && apt-get install -y less \
    && apt-get install -y mycli \
    && apt-get install -y tzdata

# Installer TypeScript et ts-node globalement
RUN npm install -g typescript \
    && npm install -g ts-node

# Fixer le fuseau horaire
ENV TZ Europe/Paris

# L'interprète par défaut
ENV SHELL /bin/bash

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez le package.json et le package-lock.json dans le conteneur
COPY package*.json ./

# Installez les dépendances de l'application
RUN npm install --production

# Variables d'enviro
ENV $(cat .env | grep -v ^# | xargs -0)

# Copiez tout le reste de l'application dans le conteneur
COPY . .

# Exposez le port sur lequel votre application écoute
EXPOSE 8000

# Démarrez l'application lorsque le conteneur démarre
CMD [ "npm", "start" ]
