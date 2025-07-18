document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.getElementById("loginContainer");
    const actionsContainer = document.getElementById("actionsContainer");
    const gamesContainer = document.getElementById("gamesContainer");
    const createGameContainer = document.getElementById("createGameContainer");
    const loginForm = document.getElementById("loginForm");
    const getGamesBtn = document.getElementById("getGamesBtn");
    const showCreateGameBtn = document.getElementById("showCreateGameBtn");
    const createGameForm = document.getElementById("createGameForm");
    const gamesList = document.getElementById("gamesList");
    const resultDiv = document.getElementById("result");
    const gameResultDiv = document.getElementById("gameResult");

    let token = null;

    // Connexion utilisateur
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                token = data.token;
                resultDiv.textContent = "Connexion réussie !";
                loginContainer.style.display = "none";
                actionsContainer.style.display = "block";
            } else {
                resultDiv.textContent = "Échec de la connexion.";
            }
        } catch (error) {
            resultDiv.textContent = "Erreur serveur.";
        }
    });

    // Afficher la liste des jeux
    getGamesBtn.addEventListener("click", async function () {
        gamesList.innerHTML = "";
        gamesContainer.style.display = "block";
        createGameContainer.style.display = "none";
        gameResultDiv.textContent = "";

        try {
            const response = await fetch("/api/games", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const games = await response.json();
                if (games.length === 0) {
                    gamesList.innerHTML = "<li>Aucun jeu trouve.</li>";
                } else {
                    games.forEach(game => {
                        const li = document.createElement("li");
                        li.textContent = `${game.title} (${game.genre}, ${game.platform}, ${new Date(game.releaseDate).toLocaleDateString()})`;
                        gamesList.appendChild(li);
                    });
                }
            } else {
                gamesList.innerHTML = "<li>Erreur lors de la récupération des jeux.</li>";
            }
        } catch (error) {
            gamesList.innerHTML = "<li>Erreur serveur.</li>";
        }
    });

    // Afficher le formulaire de création de jeu
    showCreateGameBtn.addEventListener("click", function () {
        gamesContainer.style.display = "none";
        createGameContainer.style.display = "block";
        gameResultDiv.textContent = "";
    });

    // Création d'un nouveau jeu
    createGameForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const game = {
            title: createGameForm.gameName.value,
            genre: createGameForm.gameGenre.value,
            platform: createGameForm.gamePlatform.value,
            releaseDate: createGameForm.gameReleaseDate.value
        };

        try {
            const response = await fetch("/api/games", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(game)
            });

            if (response.ok) {
                gameResultDiv.textContent = "Jeu créé avec succès !";
                createGameForm.reset();
            } else {
                gameResultDiv.textContent = "Erreur lors de la création du jeu.";
            }
        } catch (error) {
            gameResultDiv.textContent = "Erreur serveur.";
        }
    });
});