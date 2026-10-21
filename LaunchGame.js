// ================================================================
// LaunchGame
// Starts games through Steam, Epic or Battle.net and tracks play time.
//
// How play time works: the browser can't see the game once it starts,
// so we time how long you're away from this tab after pressing Play.
// Anything under 15 seconds doesn't count (e.g. an accidental click).
// ================================================================
class LaunchGame {
    static MIN_SESSION_MS = 15000; // 15 seconds

    constructor(options) {
        this.playButton = options.playButton; // may be null on Home / Discover
        this.getSelectedGame = options.getSelectedGame;
        this.getGameAt = options.getGameAt;
        this.onSessionEnded = options.onSessionEnded; // the app saves + redraws here

        this.activeSession = null; // { gameIndex, startedAt } while a game is running

        this.endActiveSession = this.endActiveSession.bind(this);
        this.handlePlayClick = this.handlePlayClick.bind(this);

        // Coming back to this tab ends the play session
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.endActiveSession();
        });
        window.addEventListener('focus', this.endActiveSession);

        // The big Play button only exists on the Library page
        if (this.playButton) this.playButton.addEventListener('click', this.handlePlayClick);
    }

    // ---- Launch links ----
    // Builds the link that tells the platform's app to start the game.
    // Returns null when the game has no (valid) Launch ID.
    static buildLaunchUrl(platform, launchId) {
        if (!launchId) return null;
        const id = launchId.trim();

        if (platform === 'Steam') {
            return 'steam://rungameid/' + id;
        }
        if (platform === 'Battle.net') {
            return 'battlenet://' + id;
        }
        if (platform === 'Epic Games') {
            // Epic IDs are namespace:catalogItemId:appName
            const parts = id.split(':');
            if (parts.length !== 3) return null;
            return 'com.epicgames.launcher://apps/' + parts[0] + '%3A' + parts[1] + '%3A' + parts[2] + '?action=launch&silent=true';
        }
        return null;
    }

    // Link that opens the platform's own app on a store search for the game,
    // used when there's no Launch ID so the game can be installed first.
    static appStoreUrl(platform, title) {
        const term = encodeURIComponent(title);
        if (platform === 'Epic Games') return 'com.epicgames.launcher://store/browse?q=' + term;
        if (platform === 'Battle.net') return 'battlenet://';
        return 'steam://openurl/https://store.steampowered.com/search/?term=' + term;
    }

    // ---- Starting a game ----
    handlePlayClick() {
        const selected = this.getSelectedGame();
        if (!selected) return;
        this.launch(selected.game, selected.index);
    }

    // Used by the smaller Play buttons (sidebar, Home, Discover)
    launchAt(index) {
        const game = this.getGameAt(index);
        if (game) this.launch(game, index);
    }

    launch(game, index) {
        const url = LaunchGame.buildLaunchUrl(game.platform, game.launchId);

        // No Launch ID: offer to open the store in the platform's app instead
        if (!url) {
            const app = game.platform === 'Epic Games' ? 'the Epic Games Launcher'
                      : game.platform === 'Battle.net' ? 'the Battle.net app' : 'Steam';
            if (confirm('"' + game.title + '" has no Launch ID yet, so it can\'t be started directly.\n\n' +
                        'Open it in ' + app + ' so you can install it?')) {
                window.location.href = LaunchGame.appStoreUrl(game.platform, game.title);
            }
            return;
        }

        // Start the play timer and mark the game as played right away,
        // so Home shows it immediately. Play time is added when you come back.
        this.activeSession = { gameIndex: index, startedAt: Date.now() };
        game.lastPlayedAt = Date.now();
        this.onSessionEnded();
        window.location.href = url;
    }

    // ---- Ending a session ----
    // Runs when you return to the tab: adds the time you were away to the game.
    endActiveSession() {
        if (!this.activeSession) return;

        const elapsedMs = Date.now() - this.activeSession.startedAt;
        const game = this.getGameAt(this.activeSession.gameIndex);
        this.activeSession = null;

        if (!game || elapsedMs < LaunchGame.MIN_SESSION_MS) return;

        game.totalMinutes = (game.totalMinutes || 0) + elapsedMs / 60000;
        game.lastPlayedAt = Date.now();
        this.onSessionEnded();
    }
}