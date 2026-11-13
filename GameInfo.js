// ================================================================
// GameInfo
// Looks up your games on Wikidata (wikidata.org, the free database
// behind Wikipedia) and keeps what it finds for each game:
//   genres - "Roguelike", "Action role-playing"… (shown on every page)
//   modes  - "single-player", "multiplayer", "cooperative"…
// GameFilter uses both for the mood and time filters.
//
// No API key or sign-up needed. Steam games are matched by their Steam
// app ID (exact); Epic and Battle.net games by their English name.
// All games that need looking up are sent in one request (in batches
// of 40), and what's found is saved in the browser under its own key,
// so each game is only looked up once and works offline afterwards.
// ================================================================
class GameInfo {
    static ENDPOINT = 'https://query.wikidata.org/sparql';
    static STORAGE_KEY = 'gamecentral-wikidata'; // { gameID: { genres: [...], modes: [...], wikidataId } }
    static BATCH_SIZE = 40;
    static VIDEO_GAME = 'Q7889'; // Wikidata's "video game"

    // options.library  - CentralLibrary
    // options.statusEl - optional message line ("Looking up games… 3 of 12")
    constructor(options) {
        this.library = options.library;
        this.statusEl = options.statusEl || null;
        this.running = null;   // the lookup in progress, if any
        this.lastError = null; // why the last lookup stopped, e.g. offline
    }

    setStatus(text) {
        if (this.statusEl) this.statusEl.textContent = text;
    }

    // ================================================================
    // What's saved for each game
    // ================================================================
    static loadCache() {
        try {
            const saved = JSON.parse(localStorage.getItem(GameInfo.STORAGE_KEY) || '{}');
            return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
        } catch (e) {
            return {};
        }
    }

    // Re-reads before writing, so another open tab's lookups aren't lost
    static saveEntries(entries) {
        try {
            const cache = GameInfo.loadCache();
            Object.keys(entries).forEach(id => { cache[id] = entries[id]; });
            localStorage.setItem(GameInfo.STORAGE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.error('Could not save game info:', e);
        }
    }

    entryFor(game) {
        return GameInfo.loadCache()[game.id] || null;
    }

    // Genre names as Wikidata has them, e.g. ['roguelike', 'action role-playing game'],
    // or null if the game hasn't been looked up yet ([] = not found)
    genresFor(game) {
        const entry = this.entryFor(game);
        return entry && Array.isArray(entry.genres) ? entry.genres : null;
    }

    // Lower-case genres and game modes together, for GameFilter's keyword
    // matching, e.g. ['roguelike', 'single-player video game']. null = not looked up.
    keywordsFor(game) {
        const entry = this.entryFor(game);
        if (!entry || !Array.isArray(entry.genres)) return null;
        return entry.genres.concat(entry.modes || []).map(s => s.toLowerCase());
    }

    // "action role-playing game" -> "Action role-playing"
    static prettyGenre(name) {
        const short = String(name).replace(/\s+(video\s+)?game$/i, '').trim() || String(name);
        return short.charAt(0).toUpperCase() + short.slice(1);
    }

    // Genres to show on a page, e.g. "Roguelike, Action role-playing" ('' if unknown)
    genreLabel(game, max) {
        return (this.genresFor(game) || []).slice(0, max || 2).map(GameInfo.prettyGenre).join(', ');
    }

    // What to show where a game's genre goes: its genres, or why there aren't any
    genreStatus(game, max) {
        const genres = this.genresFor(game);
        if (genres && genres.length) return this.genreLabel(game, max || 3);
        if (genres) return (this.entryFor(game) || {}).wikidataId ? 'No genre listed on Wikidata' : 'Not found on Wikidata';
        if (this.running) return 'Looking up…';
        if (this.lastError) return this.lastError;
        return 'Unknown';
    }

    gamesNeedingLookup() {
        return this.library.games.filter(g => this.genresFor(g) === null);
    }

    // ================================================================
    // Looking games up on Wikidata
    // ================================================================

    // Looks up every game that needs it, showing progress in the status line.
    // Resolves to { done, total, error } (or null if there was nothing to do).
    // Calling it again while it's running returns the same lookup.
    lookUpMissingGames() {
        if (this.running) return this.running;
        const todo = this.gamesNeedingLookup();
        if (!todo.length) return Promise.resolve(null);

        this.setStatus('Looking up ' + todo.length + ' game(s) on Wikidata…');
        this.running = this.lookUpAll(todo)
            .then(result => { this.lastError = result.error; this.setStatus(result.error || ''); return result; })
            .finally(() => { this.running = null; });
        return this.running;
    }

    async lookUpAll(todo) {
        const result = { done: 0, total: todo.length, error: null };
        for (let i = 0; i < todo.length; i += GameInfo.BATCH_SIZE) {
            const batch = todo.slice(i, i + GameInfo.BATCH_SIZE);
            try {
                GameInfo.saveEntries(await this.fetchBatch(batch));
            } catch (err) {
                console.error('Wikidata lookup failed:', err);
                result.error = err.message;
                break; // offline or Wikidata is busy: try again next time a page opens
            }
            result.done += batch.length;
            this.setStatus('Looking up games… ' + result.done + ' of ' + result.total);
        }
        return result;
    }

    // Text inside a SPARQL "…" string
    static quote(text) {
        return '"' + String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ') + '"';
    }

    // One query for a batch of games. Every game is matched by its English
    // name; Steam games are also matched by Steam app ID (Wikidata's P1733),
    // which wins when both match.
    static buildQuery(games) {
        const steamRows = games
            .filter(g => g.platform === 'Steam' && /^\d+$/.test(String(g.launchId || '').trim()))
            .map(g => '(' + GameInfo.quote(g.id) + ' ' + GameInfo.quote(String(g.launchId).trim()) + ')');
        const titleRows = games
            .filter(g => g.title)
            .map(g => '(' + GameInfo.quote(g.id) + ' ' + GameInfo.quote(g.title) + '@en)');

        const parts = [];
        if (steamRows.length) {
            parts.push('{ VALUES (?key ?steam) { ' + steamRows.join(' ') + ' } ?item wdt:P1733 ?steam . BIND("steam" AS ?how) }');
        }
        if (titleRows.length) {
            parts.push('{ VALUES (?key ?title) { ' + titleRows.join(' ') + ' } ?item rdfs:label ?title ; wdt:P31 wd:' + GameInfo.VIDEO_GAME + ' . BIND("title" AS ?how) }');
        }
        return 'SELECT ?key ?how ?item ?genreLabel ?modeLabel WHERE { ' +
            parts.join(' UNION ') +
            ' OPTIONAL { ?item wdt:P136 ?genre . }' +   // genre
            ' OPTIONAL { ?item wdt:P404 ?mode . }' +    // game mode
            ' SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }';
    }

    async fetchBatch(games) {
        let res;
        try {
            res = await fetch(GameInfo.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'application/sparql-results+json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'format=json&query=' + encodeURIComponent(GameInfo.buildQuery(games))
            });
        } catch (e) {
            throw new Error('Couldn\'t reach Wikidata. Check your internet connection.');
        }
        if (res.status === 429) throw new Error('Wikidata is busy. Try again in a minute.');
        if (!res.ok) throw new Error('Wikidata answered ' + res.status + '. Try again later.');

        const data = await res.json();
        return GameInfo.entriesFromRows(games, (data.results && data.results.bindings) || []);
    }

    // Turns Wikidata's rows into one saved entry per game. When a name
    // matches several games (e.g. two games called "Doom"), the Steam ID
    // match is used if there is one, otherwise the match with the most info.
    static entriesFromRows(games, rows) {
        const found = {}; // gameID -> { itemID -> { how, genres:Set, modes:Set } }
        rows.forEach(r => {
            const key = r.key && r.key.value;
            const item = r.item && r.item.value;
            if (!key || !item) return;
            const items = found[key] || (found[key] = {});
            const it = items[item] || (items[item] = { how: r.how.value, genres: new Set(), modes: new Set() });
            if (r.how.value === 'steam') it.how = 'steam';
            // Unlabelled values come back as a "Q123" ID: skip those
            if (r.genreLabel && !/^Q\d+$/.test(r.genreLabel.value)) it.genres.add(r.genreLabel.value);
            if (r.modeLabel && !/^Q\d+$/.test(r.modeLabel.value)) it.modes.add(r.modeLabel.value);
        });

        const entries = {};
        games.forEach(g => {
            const items = Object.keys(found[g.id] || {}).map(id => Object.assign({ id: id }, found[g.id][id]));
            items.sort((a, b) => (b.how === 'steam') - (a.how === 'steam') ||
                                 (b.genres.size + b.modes.size) - (a.genres.size + a.modes.size));
            const best = items[0];
            entries[g.id] = best
                ? { genres: Array.from(best.genres), modes: Array.from(best.modes), wikidataId: best.id.split('/').pop() }
                : { genres: [], modes: [], wikidataId: null }; // not on Wikidata: don't ask again
        });
        return entries;
    }
}