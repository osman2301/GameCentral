// ================================================================
// GameFilter
// Runs the "Pick something for me" filters:
//   I'm feeling…             (mood)
//   How much time do I have? (≤ 15 min / 30 min / 1 hour / > 1 hour)
// "Filter" lists every game that matches both (filterAll), and
// "Surprise me" picks one of them at random (pickRandom).
//
// Mood and time use each game's genres and game modes, which GameInfo
// looks up on Wikidata and saves (see GameInfo.js). Wikidata names them
// in plain English ("survival horror", "action role-playing game",
// "cooperative video game"), so the lists below are KEYWORDS: a game
// matches when any of its genres contains one of them.
//
// No API gives "how long is one sitting" for a game, so the time filter
// guesses from the genres (see SESSION_KEYWORDS): a puzzle or arcade
// game fits 15 minutes, a roguelike or racing game 30, and so on.
// ================================================================
class GameFilter {
    static ANY_MOOD = 'Any Mood';
    static ANY_TIME = 'Any Time';

    // Each mood and the genre keywords that count for it
    static MOODS = {
        'Adventurous': ['adventure', 'open world', 'exploration', 'metroidvania'],
        'Excited':     ['action', 'shooter', 'hack and slash', 'beat \'em up'],
        'Spooked':     ['horror'],
        'Creative':    ['sandbox', 'construction', 'city-building', 'city building', 'god game', 'crafting'],
        'Immersive':   ['role-playing', 'immersive sim', 'interactive fiction', 'stealth', 'narrative'],
        'Competitive': ['fighting', 'battle royale', 'multiplayer online battle arena', 'sports', 'racing', 'esports'],
        'Social':      ['multiplayer', 'cooperative', 'co-op', 'party'],
        'Relaxed':     ['puzzle', 'casual', 'life simulation', 'farm', 'cozy', 'relax']
    };

    // "How much time do I have?" choices, in minutes
    static TIME_OPTIONS = {
        '≤ 15 minutes': 15,
        '30 minutes':   30,
        '1 hour':       60,
        '> 1 hour':     Infinity // everything fits
    };

    // How long one sitting usually takes, guessed from genres.
    // Checked in this order: a 15-minute or 30-minute genre wins (so a
    // roguelike RPG counts as 30 minutes); otherwise a LONG genre makes it
    // "> 1 hour"; otherwise a 60-minute genre. No match = "> 1 hour" only.
    static SESSION_KEYWORDS = [
        { minutes: 15, words: ['puzzle', 'casual', 'arcade', 'card', 'party', 'rhythm', 'incremental', 'clicker'] },
        { minutes: 30, words: ['roguelike', 'roguelite', 'fighting', 'racing', 'sports', 'battle royale', 'platform'] }
    ];
    static LONG_KEYWORDS = ['role-playing', 'open world', 'massively multiplayer', 'grand strategy', '4x'];
    static HOUR_KEYWORDS = ['shooter', 'action', 'strategy', 'horror', 'survival', 'simulation', 'multiplayer', 'cooperative', 'adventure'];

    // options.library      - CentralLibrary (the games being filtered)
    // options.info         - GameInfo (genres and game modes)
    // options.moodSelect   - the "I'm feeling…" <select> (moods are added to it here)
    // options.timeSelect   - the "How much time do I have?" <select> (choices added here)
    constructor(options) {
        this.library = options.library;
        this.info = options.info;
        this.moodSelect = options.moodSelect;
        this.timeSelect = options.timeSelect;

        GameFilter.addOptions(this.moodSelect, Object.keys(GameFilter.MOODS));
        GameFilter.addOptions(this.timeSelect, Object.keys(GameFilter.TIME_OPTIONS));
    }

    static addOptions(select, names) {
        if (!select) return;
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    // Genres/modes of this game that contain any of the keywords
    matchingGenres(game, words) {
        return (this.info.keywordsFor(game) || []).filter(g => words.some(w => g.indexOf(w) !== -1));
    }

    // ================================================================
    // Filtering and picking
    // ================================================================

    // What's chosen in the panel right now
    currentFilters() {
        return {
            mood: this.moodSelect ? this.moodSelect.value : GameFilter.ANY_MOOD,
            time: this.timeSelect ? this.timeSelect.value : GameFilter.ANY_TIME
        };
    }

    // Do these filters need genres from Wikidata?
    static needsLookup(filters) {
        const minutes = GameFilter.TIME_OPTIONS[filters.time];
        return filters.mood in GameFilter.MOODS || (minutes !== undefined && minutes !== Infinity);
    }

    // Does this game pass both filters?
    matches(game, filters) {
        return this.matchesMood(game, filters.mood) && this.fitsTime(game, filters.time);
    }

    // Positions (in library.games) of every game that passes the filters
    matchingIndexes(filters) {
        const idx = [];
        this.library.games.forEach((g, i) => { if (this.matches(g, filters)) idx.push(i); });
        return idx;
    }

    // "Filter": every game matching the panel's filters.
    // Looks up missing games first when mood or time is used.
    // Resolves to { matches: [{ index, why }], total } or { message } when none match.
    filterAll() {
        const filters = this.currentFilters();
        const ready = GameFilter.needsLookup(filters) ? this.info.lookUpMissingGames() : Promise.resolve();
        return ready.then(() => {
            const games = this.library.games;
            const idx = this.matchingIndexes(filters);
            if (!idx.length) {
                if (!games.length) return { message: 'Add a game first.' };
                if (GameFilter.needsLookup(filters) && this.info.lastError) return { message: this.info.lastError };
                return { message: GameFilter.noMatchMessage(filters) };
            }
            return { matches: idx.map(i => ({ index: i, why: this.whyItFits(games[i], filters) })), total: games.length };
        });
    }

    // "Surprise me": picks a random game matching the panel's filters.
    // Has GameInfo look up missing games first when mood or time is used.
    // Resolves to { index, why } (why = e.g. "survival horror · ~1 hr sessions")
    // or { message } when there's nothing to pick.
    pickRandom() {
        const filters = this.currentFilters();
        const ready = GameFilter.needsLookup(filters) ? this.info.lookUpMissingGames() : Promise.resolve();
        return ready.then(() => {
            const games = this.library.games;
            const idx = this.matchingIndexes(filters);
            if (!idx.length) {
                if (!games.length) return { message: 'Add a game first.' };
                if (GameFilter.needsLookup(filters) && this.info.lastError) return { message: this.info.lastError };
                return { message: GameFilter.noMatchMessage(filters) };
            }
            const i = idx[Math.floor(Math.random() * idx.length)];
            return { index: i, why: this.whyItFits(games[i], filters) };
        });
    }

    static noMatchMessage(filters) {
        const parts = [];
        if (filters.mood in GameFilter.MOODS) parts.push('feel ' + filters.mood.toLowerCase());
        const minutes = GameFilter.TIME_OPTIONS[filters.time];
        if (minutes !== undefined && minutes !== Infinity) parts.push('fit in ' + filters.time.replace('≤ ', ''));
        if (!parts.length) return 'No games match those filters.';
        return 'None of your games ' + parts.join(' and ') + '.';
    }

    // Short reason shown on the picked card
    whyItFits(game, filters) {
        const parts = [];
        if (filters.mood in GameFilter.MOODS) {
            // Skip genres the card already shows (its first two), e.g. just "Cooperative"
            const shown = (this.info.genresFor(game) || []).slice(0, 2).map(g => g.toLowerCase());
            const extra = this.matchingGenres(game, GameFilter.MOODS[filters.mood]).filter(g => shown.indexOf(g) === -1);
            parts.push(extra.slice(0, 2).map(GameInfo.prettyGenre).join(', '));
        }
        const minutes = GameFilter.TIME_OPTIONS[filters.time];
        if (minutes !== undefined && minutes !== Infinity) parts.push('~' + GameFilter.formatMinutes(this.sessionMinutes(game)) + ' sessions');
        return parts.filter(Boolean).join(' · ');
    }

    static formatMinutes(minutes) {
        return minutes >= 60 ? (minutes / 60) + ' hr' : minutes + ' min';
    }

    // ================================================================
    // Mood
    // ================================================================

    // Does this game fit the mood? "Any Mood" (or unknown) always does.
    matchesMood(game, mood) {
        const words = GameFilter.MOODS[mood];
        if (!words) return true;
        return this.matchingGenres(game, words).length > 0;
    }

    // ================================================================
    // Time
    // ================================================================

    // Roughly how long one sitting takes, in minutes (Infinity = long or unknown)
    sessionMinutes(game) {
        for (const level of GameFilter.SESSION_KEYWORDS) {
            if (this.matchingGenres(game, level.words).length) return level.minutes;
        }
        if (this.matchingGenres(game, GameFilter.LONG_KEYWORDS).length) return Infinity;
        if (this.matchingGenres(game, GameFilter.HOUR_KEYWORDS).length) return 60;
        return Infinity;
    }

    // Does one sitting fit in the time chosen? "Any Time" (or unknown) always does.
    fitsTime(game, time) {
        const available = GameFilter.TIME_OPTIONS[time];
        if (available === undefined || available === Infinity) return true;
        return this.sessionMinutes(game) <= available;
    }
}