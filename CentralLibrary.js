// ================================================================
// CentralLibrary
// Every game in your library, saved in the browser's localStorage
// so all three pages see the same games.
// ================================================================
class CentralLibrary {
    static STORAGE_KEY = 'gamecentral-games';

    constructor() {
        this.games = []; // list of Game
        this.loadGames();
    }

    // Reads the saved library and turns each saved game into a Game
    loadGames() {
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(CentralLibrary.STORAGE_KEY) || '[]');
            if (!Array.isArray(saved)) saved = [];
        } catch (err) {
            console.error('Could not read saved games:', err);
        }
        const needsIds = saved.some(g => !g.id); // games saved before IDs existed
        this.games.length = 0;
        saved.forEach(g => this.games.push(new Game(g)));
        if (needsIds) this.saveGames();
    }

    saveGames() {
        try {
            localStorage.setItem(CentralLibrary.STORAGE_KEY, JSON.stringify(this.games));
        } catch (err) {
            console.error('Could not save games:', err);
            alert('Could not save your library - browser storage may be full. Try removing a game.');
        }
    }

    // Adds games that aren't already in the library.
    // Returns how many were actually added.
    addGames(gameList) {
        let added = 0;
        gameList.forEach(game => {
            if (this.games.some(g => g.sameGame(game))) return; // already there
            this.games.push(game);
            added++;
        });
        if (added) this.saveGames();
        return added;
    }

    // The game with this ID, or null
    findGame(id) {
        return this.games.find(g => g.id === id) || null;
    }

    removeGame(index) {
        if (index < 0 || index >= this.games.length) return;
        this.games.splice(index, 1);
        this.saveGames();
    }
}
