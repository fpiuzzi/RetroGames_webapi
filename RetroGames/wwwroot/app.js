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
                    gamesList.innerHTML = "<li>Aucun jeu trouvé.</li>";
                } else {
                    games.forEach(game => {
                        const li = document.createElement("li");
                        li.style.display = "flex";
                        li.style.flexDirection = "column";
                        li.style.alignItems = "stretch";
                        li.style.gap = "5px";

                        // Ligne principale : infos + boutons
                        const rowDiv = document.createElement("div");
                        rowDiv.style.display = "flex";
                        rowDiv.style.alignItems = "center";
                        rowDiv.style.justifyContent = "space-between";
                        rowDiv.style.gap = "10px";

                        const infoDiv = document.createElement("div");
                        infoDiv.innerHTML = `<strong>${game.title}</strong> (${game.genre}, ${game.platform}, ${new Date(game.releaseDate).toLocaleDateString()})`;

                        const btnDiv = document.createElement("div");
                        btnDiv.style.display = "flex";
                        btnDiv.style.gap = "5px";

                        const editBtn = document.createElement("button");
                        editBtn.textContent = "Modifier";
                        editBtn.className = "editBtn";
                        editBtn.addEventListener("click", function () {
                            showEditForm(game, li);
                        });

                        const deleteBtn = document.createElement("button");
                        deleteBtn.textContent = "Supprimer";
                        deleteBtn.className = "deleteBtn";
                        deleteBtn.addEventListener("click", async function () {
                            if (confirm("Voulez-vous vraiment supprimer ce jeu ?")) {
                                await deleteGame(game.id, li);
                            }
                        });

                        btnDiv.appendChild(editBtn);
                        btnDiv.appendChild(deleteBtn);

                        rowDiv.appendChild(infoDiv);
                        rowDiv.appendChild(btnDiv);

                        li.appendChild(rowDiv);

                        // Formulaire de modification caché (sous le jeu)
                        const editFormContainer = document.createElement("div");
                        editFormContainer.className = "editFormContainer";
                        editFormContainer.style.display = "none";
                        li.appendChild(editFormContainer);

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

            const message = await response.text();
            gameResultDiv.textContent = message;
            if (response.ok) {
                createGameForm.reset();
            }
        } catch (error) {
            gameResultDiv.textContent = "Erreur serveur.";
        }
    });

    // Supprimer un jeu
    async function deleteGame(id, li) {
        try {
            const response = await fetch(`/api/games/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const message = await response.text();
            if (response.ok) {
                li.remove();
                gameResultDiv.textContent = message;
            } else {
                gameResultDiv.textContent = message;
            }
        } catch (error) {
            gameResultDiv.textContent = "Erreur serveur.";
        }
    }

    // Afficher le formulaire de modification en dessous du jeu
    function showEditForm(game, li) {
        const container = li.querySelector(".editFormContainer");
        container.innerHTML = `
            <form class="editGameForm" style="margin-top:10px;">
                <label>Nom du jeu :</label>
                <input type="text" name="title" value="${game.title}" required />
                <label>Genre :</label>
                <input type="text" name="genre" value="${game.genre}" required />
                <label>Plateforme :</label>
                <input type="text" name="platform" value="${game.platform}" required />
                <label>Date de sortie :</label>
                <input type="date" name="releaseDate" value="${game.releaseDate.split('T')[0]}" required />
                <button type="submit">Enregistrer</button>
                <button type="button" class="cancelEditBtn">Annuler</button>
            </form>
        `;
        container.style.display = "block";
        container.style.width = "100%";
        container.style.marginLeft = "0";
        container.style.marginTop = "10px";

        const editForm = container.querySelector(".editGameForm");
        const cancelBtn = container.querySelector(".cancelEditBtn");
        cancelBtn.addEventListener("click", function () {
            container.style.display = "none";
        });
        editForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const updatedGame = {
                id: game.id,
                title: editForm.title.value,
                genre: editForm.genre.value,
                platform: editForm.platform.value,
                releaseDate: editForm.releaseDate.value
            };
            try {
                const response = await fetch(`/api/games/${game.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedGame)
                });
                const message = await response.text();
                if (response.ok) {
                    // Met à jour l'affichage du jeu
                    const infoDiv = li.querySelector("div");
                    infoDiv.innerHTML = `<strong>${updatedGame.title}</strong> (${updatedGame.genre}, ${updatedGame.platform}, ${new Date(updatedGame.releaseDate).toLocaleDateString()})`;
                    container.style.display = "none";
                    gameResultDiv.textContent = message;
                } else {
                    gameResultDiv.textContent = message;
                }
            } catch (error) {
                gameResultDiv.textContent = "Erreur serveur.";
            }
        });
    }
});