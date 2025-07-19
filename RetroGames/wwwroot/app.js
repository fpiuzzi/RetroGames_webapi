let jwtToken = null;

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const resultDiv = document.getElementById("result");
    if (response.ok) {
        const data = await response.json();
        jwtToken = data.token;
        resultDiv.textContent = "Connexion réussie !";
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("actionsContainer").style.display = "block";
        loadFilterMenus();
    } else {
        resultDiv.textContent = "Identifiants invalides.";
    }
});

document.getElementById("getGamesBtn").addEventListener("click", function () {
    fetchGames();
});

document.getElementById("showCreateGameBtn").addEventListener("click", function () {
    document.getElementById("createGameContainer").style.display = "block";
    document.getElementById("gamesContainer").style.display = "none";
    document.getElementById("createGameForm").reset();
    delete document.getElementById("createGameForm").dataset.editId;
    document.getElementById("gameResult").textContent = "";
});

// Ouvre la modal de recherche
document.getElementById("showSearchBarBtn").addEventListener("click", function () {
    document.getElementById("searchModal").style.display = "flex";
    document.getElementById("searchTitle").value = "";
    document.getElementById("searchResultMsg").textContent = "";
    document.getElementById("searchTitle").focus();
});

// Ferme la modal de recherche
document.getElementById("closeSearchModal").addEventListener("click", function () {
    document.getElementById("searchModal").style.display = "none";
});

// Fermer la modal avec la touche Echap
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        document.getElementById("searchModal").style.display = "none";
    }
});

// Recherche de jeu
document.getElementById('searchGameBtn').addEventListener('click', async function () {
    const title = document.getElementById('searchTitle').value;
    const resultMsg = document.getElementById('searchResultMsg');
    resultMsg.textContent = "";
    if (!title.trim()) {
        resultMsg.textContent = "Veuillez entrer un nom de jeu.";
        return;
    }
    const response = await fetch(`/api/games/search?title=${encodeURIComponent(title)}`);
    if (response.ok) {
        const games = await response.json();
        const gamesList = document.getElementById('gamesList');
        gamesList.innerHTML = '';
        if (games.length === 0) {
            gamesList.innerHTML = '<li>Aucun jeu trouvé.</li>';
            resultMsg.textContent = "Aucun jeu trouvé.";
        } else {
            games.forEach(game => {
                const li = document.createElement('li');
                let dateStr = "";
                if (game.releaseDate) {
                    dateStr = new Date(game.releaseDate).toLocaleDateString();
                }
                li.textContent = `${game.title} | ${game.genre} | ${game.platform} | ${dateStr}`;
                // Bouton Modifier
                const editBtn = document.createElement("button");
                editBtn.textContent = "Modifier";
                editBtn.style.backgroundColor = "orange";
                editBtn.style.color = "white";
                editBtn.style.marginLeft = "10px";
                editBtn.onclick = () => showEditForm(game);
                // Bouton Supprimer
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.style.backgroundColor = "red";
                deleteBtn.style.color = "white";
                deleteBtn.style.marginLeft = "5px";
                deleteBtn.onclick = () => deleteGame(game.id);
                li.appendChild(editBtn);
                li.appendChild(deleteBtn);
                gamesList.appendChild(li);
            });
            resultMsg.textContent = `${games.length} jeu(x) trouvé(s).`;
        }
        document.getElementById('gamesContainer').style.display = 'block';
        document.getElementById("searchModal").style.display = "none";
    } else {
        resultMsg.textContent = "Erreur serveur lors de la recherche.";
    }
});

document.getElementById("createGameForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const title = document.getElementById("gameName").value;
    const genre = document.getElementById("gameGenre").value;
    const platform = document.getElementById("gamePlatform").value;
    const releaseDate = document.getElementById("gameReleaseDate").value;
    const editId = document.getElementById("createGameForm").dataset.editId;

    const body = { title, genre, platform };
    if (releaseDate) body.releaseDate = releaseDate;

    const resultDiv = document.getElementById("gameResult");

    if (editId) {
        // Modification (PUT)
        body.id = parseInt(editId);
        const response = await fetch(`/api/games/${editId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(jwtToken && { "Authorization": "Bearer " + jwtToken })
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            resultDiv.textContent = "Jeu modifié avec succès !";
            document.getElementById("createGameForm").reset();
            delete document.getElementById("createGameForm").dataset.editId;
            fetchGames();
            loadFilterMenus();
        } else if (response.status === 400 || response.status === 404) {
            const error = await response.json();
            const messages = Object.values(error.errors || error)
                .flat()
                .join("\n");
            resultDiv.textContent = messages || "Erreur lors de la modification du jeu.";
        } else {
            resultDiv.textContent = "Erreur lors de la modification du jeu.";
        }
    } else {
        // Création (POST)
        const response = await fetch("/api/games", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(jwtToken && { "Authorization": "Bearer " + jwtToken })
            },
            body: JSON.stringify(body)
        });

        if (response.status === 201) {
            resultDiv.textContent = "Jeu créé avec succès !";
            document.getElementById("createGameForm").reset();
            fetchGames();
            loadFilterMenus();
        } else if (response.status === 400) {
            const error = await response.json();
            const messages = Object.values(error.errors || error)
                .flat()
                .join("\n");
            resultDiv.textContent = messages || "Erreur lors de la création du jeu.";
        } else {
            resultDiv.textContent = "Erreur lors de la création du jeu.";
        }
    }
});

async function fetchGames(query = "") {
    const response = await fetch("/api/games" + query, {
        headers: jwtToken ? { "Authorization": "Bearer " + jwtToken } : {}
    });
    if (response.ok) {
        const games = await response.json();
        displayGames(games);
        document.getElementById("gamesContainer").style.display = "block";
        document.getElementById("createGameContainer").style.display = "none";
    }
}

function displayGames(games) {
    const list = document.getElementById("gamesList");
    list.innerHTML = "";
    if (games.length === 0) {
        list.innerHTML = "<li>Aucun jeu trouvé.</li>";
        return;
    }
    games.forEach(game => {
        const li = document.createElement("li");
        let dateStr = "";
        if (game.releaseDate) {
            dateStr = new Date(game.releaseDate).toLocaleDateString();
        } else {
            dateStr = "";
        }
        li.textContent = `${game.title} | ${game.genre} | ${game.platform} | ${dateStr} `;

        // Bouton Modifier (orange)
        const editBtn = document.createElement("button");
        editBtn.textContent = "Modifier";
        editBtn.style.backgroundColor = "orange";
        editBtn.style.color = "white";
        editBtn.style.marginLeft = "10px";
        editBtn.onclick = () => showEditForm(game);

        // Bouton Supprimer (rouge)
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Supprimer";
        deleteBtn.style.backgroundColor = "red";
        deleteBtn.style.color = "white";
        deleteBtn.style.marginLeft = "5px";
        deleteBtn.onclick = () => deleteGame(game.id);

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        list.appendChild(li);
    });
}

// Affiche le formulaire de modification pré-rempli
function showEditForm(game) {
    document.getElementById("createGameContainer").style.display = "block";
    document.getElementById("gamesContainer").style.display = "none";
    document.getElementById("gameName").value = game.title;
    document.getElementById("gameGenre").value = game.genre;
    document.getElementById("gamePlatform").value = game.platform;
    document.getElementById("gameReleaseDate").value = game.releaseDate ? game.releaseDate.substring(0, 10) : "";
    document.getElementById("createGameForm").dataset.editId = game.id;
    document.getElementById("gameResult").textContent = "Modification du jeu en cours...";
}

// Suppression d'un jeu
async function deleteGame(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce jeu ?")) return;
    const response = await fetch(`/api/games/${id}`, {
        method: "DELETE",
        headers: jwtToken ? { "Authorization": "Bearer " + jwtToken } : {}
    });
    if (response.ok) {
        fetchGames();
        loadFilterMenus();
    } else {
        alert("Erreur lors de la suppression du jeu.");
    }
}

async function loadFilterMenus() {
    // Récupère tous les jeux pour extraire les valeurs uniques
    const response = await fetch("/api/games", {
        headers: jwtToken ? { "Authorization": "Bearer " + jwtToken } : {}
    });
    if (!response.ok) return;
    const games = await response.json();

    const platforms = [...new Set(games.map(g => g.platform))];
    const genres = [...new Set(games.map(g => g.genre))];

    const filterDiv = document.getElementById("filterButtons");
    filterDiv.innerHTML = "<h3>Filtrer :</h3>";

    // Menu déroulant plateforme
    const selectPlatform = document.createElement("select");
    selectPlatform.id = "selectPlatform";
    const optionAllPlatform = document.createElement("option");
    optionAllPlatform.value = "";
    optionAllPlatform.textContent = "-- Toutes les consoles --";
    selectPlatform.appendChild(optionAllPlatform);
    platforms.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        selectPlatform.appendChild(opt);
    });
    selectPlatform.onchange = function () {
        const value = selectPlatform.value;
        if (value) {
            fetchGames(`/filter?platform=${encodeURIComponent(value)}`);
        } else {
            fetchGames();
        }
    };
    filterDiv.appendChild(selectPlatform);

    // Menu déroulant genre
    const selectGenre = document.createElement("select");
    selectGenre.id = "selectGenre";
    const optionAllGenre = document.createElement("option");
    optionAllGenre.value = "";
    optionAllGenre.textContent = "-- Tous les genres --";
    selectGenre.appendChild(optionAllGenre);
    genres.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        selectGenre.appendChild(opt);
    });
    selectGenre.onchange = function () {
        const value = selectGenre.value;
        if (value) {
            fetchGames(`/filter?genre=${encodeURIComponent(value)}`);
        } else {
            fetchGames();
        }
    };
    filterDiv.appendChild(selectGenre);
}