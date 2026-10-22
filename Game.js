// ================================================================
// Game
// One game in your library: its name, platform, Launch ID,
// play style and play time.
// ================================================================
class Game {
    constructor(data) {
        data = data || {};
        this.id = data.id || Game.newId();              // GameCentral's own ID for this game
        this.title = data.title || '';
        this.platform = data.platform || 'Steam';       // 'Steam' | 'Epic Games' | 'Battle.net'
        this.launchId = data.launchId || '';            // the platform's ID, used by Play
        this.playStyle = data.playStyle || '';
        if (data.modes) this.modes = data.modes;        // older saves may have a list of play styles
        // Older saves may be missing these, so fill in defaults
        this.totalMinutes = typeof data.totalMinutes === 'number' ? data.totalMinutes : 0;
        this.lastPlayedAt = typeof data.lastPlayedAt === 'number' ? data.lastPlayedAt : null;
    }

    // A short random ID, e.g. "g1k3x9a2bq"
    static newId() {
        return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    // Is the game installed on this computer?
    // Checks the installed-games list you loaded in Add Game for this platform.
    // If no list has been loaded we can't tell, so it counts as available.
    isAvailableOnDevice() {
        return PlatformLibrary.isInstalled(this.platform, this.launchId) !== false;
    }

    // Is this the same game as another one on the SAME platform?
    // (The same game on Steam and on Epic counts as two different games.)
    // Same platform, and the same name (ignoring capitals and punctuation)
    // or the same Launch ID (ignoring capitals, so Battle.net's "Pro" = "pro").
    sameGame(other) {
        if (!other || this.platform !== other.platform) return false;
        const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        if (clean(this.title) !== '' && clean(this.title) === clean(other.title)) return true;
        const id = String(this.launchId || '').trim().toLowerCase();
        return id !== '' && id === String(other.launchId || '').trim().toLowerCase();
    }
}