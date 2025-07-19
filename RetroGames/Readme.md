# RetroGames

RetroGames est une application web permettant de gérer une collection de jeux vidéo. Elle repose sur une API REST développée en .NET 8 et une interface utilisateur en JavaScript.

## Fonctionnalités

- Authentification utilisateur (JWT)
- Consultation, création, modification et suppression de jeux
- Interface web simple et intuitive
- Gestion des erreurs et des messages côté client

## Prérequis

- .NET 8 SDK
- Visual Studio
- Un navigateur web 
- Persistance des données : Base InMemory

## Installation

1. **Cloner le projet :**

## Pour lancer l'application 

https://localhost:<port>/index.html

## Pour accéder à la docummentation Swagger 

https://localhost:<port>/swagger

## Identifiants de connexion (test)

- **Nom d’utilisateur : **test
- **Mot de passe : **test123

## Configuration du secret JWT

Pour des raisons de sécurité, la clé secrète utilisée pour signer les tokens JWT n’est pas présente dans le fichier `appsettings.json` .

Avant de lancer l’application, créez un fichier `appsettings.Local.json` à la racine du projet avec le contenu suivant :

```json
  "Jwt": {
    "Key": "votre token",
    "Issuer": "http://localhost:<port>",
    "Audience": "http://localhost:<port>"
  }
```