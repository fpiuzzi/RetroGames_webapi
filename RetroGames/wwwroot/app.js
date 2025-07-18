let jwtToken = null;

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const resultDiv = document.getElementById('result');

    resultDiv.textContent = "Connexion en cours...";

    try {
        const response = await fetch('/api/Auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            jwtToken = data.token;

            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('gamesContainer').style.display = 'block';

            await loadGames();
        } else if (response.status === 401) {
            resultDiv.textContent = "Identifiants invalides.";
            resultDiv.style.color = "red";
        } else {
            const error = await response.json();
            resultDiv.textContent = "Erreur : " + (error.title || "Une erreur est survenue.");
            resultDiv.style.color = "red";
        }
    } catch (err) {
        resultDiv.textContent = "Erreur de connexion au serveur.";
        resultDiv.style.color = "red";
    }
});

async function loadGames() {
    const gamesList = document.getElementById('gamesList');
    gamesList.innerHTML = "Chargement...";
    try {
        const response = await fetch('/api/Games', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });
        if (response.ok) {
            const games = await response.json();
            gamesList.innerHTML = '';
            games.forEach(game => {
                const li = document.createElement('li');
                li.textContent = game.name || game.title || JSON.stringify(game);
                gamesList.appendChild(li);
            });
        } else {
            gamesList.textContent = "Impossible de récupérer la liste des jeux.";
        }
    } catch {
        gamesList.textContent = "Erreur de connexion à l'API.";
    }
}

document.getElementById('createGameForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const gameName = document.getElementById('gameName').value;
    const gameResult = document.getElementById('gameResult');
    gameResult.textContent = "Création en cours...";

    try {
        const response = await fetch('/api/Games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            },
            body: JSON.stringify({ name: gameName })
        });

        if (response.ok) {
            gameResult.textContent = "Jeu créé avec succès !";
            gameResult.style.color = "green";
            document.getElementById('gameName').value = '';
            await loadGames();
        } else {
            const error = await response.json();
            gameResult.textContent = "Erreur : " + (error.title || "Impossible de créer le jeu.");
            gameResult.style.color = "red";
        }
    } catch {
        gameResult.textContent = "Erreur de connexion à l'API.";
        gameResult.style.color = "red";
    }
});