FROM node:18
# Forcer le faite d'utiliser les miroirs français quand on utilise apt ...
# Attention, le chemin source est rélative à l'emplacement du fichier docker-compose
COPY ./docker/sources.list /etc/apt/sources.list 
COPY package*.json ./

# Créer l'utilisateur et son groupe, installer des paquets
RUN apt-get update \        
    && apt-get install -y sudo \
    && apt-get install -y less \
    && apt-get install -y mycli \
    && apt-get install -y tzdata \    
    && npm install -g typescript \
    && npm install -g ts-node 

# Fixer le fuseau horaire
ENV TZ Europe/Paris

# L'interprète par défaut
ENV SHELL /bin/bash

COPY . .

# Exposez le port sur lequel votre application écoute
EXPOSE 8000

# Le repertoire maison par défaut
WORKDIR /home/dev

RUN /bin/bash

# Démarrez l'application lorsque le conteneur démarre
CMD [ "npm", "server" ]