// ================================================================
// LaunchController
// Handles the Play buttons and tracks play time.
//
// How play time works: the browser can't see the game once it starts,
// so we time how long you're away from this tab after pressing Play.
// Anything under 15 seconds doesn't count (e.g. an accidental click).
// ================================================================
class LaunchController {
    static MIN_SESSION_MS = 15000; // 15 seconds

    constructor(options) {
        this.library = options.library;                 // CentralLibrary
        this.platform = options.platform;               // OriginalPlatform
        this.playButton = options.playButton;           // big Play button (Library page only, else null)
        this.getSelectedGame = options.getSelectedGame; // the game on the big card
        this.onSessionEnded = options.onSessionEnded;   // the page redraws here

        this.activeSession = null; // { gameID, startedAt } while a game is running

        this.endActiveSession = this.endActiveSession.bind(this);

        // Coming back to this tab ends the play session
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.endActiveSession();
        });
        window.addEventListener('focus', this.endActiveSession);

        // The big Play button only exists on the Library page
        if (this.playButton) {
            this.playButton.addEventListener('click', () => {
                const game = this.getSelectedGame();
                if (game) this.processLaunch(game.id);
            });
        }
    }

    // ---- Checking a game can start ----
    // Returns true if the game should be launched. Asks first when it can't
    // start directly or doesn't look installed.
    validateLaunch(gameID) {
        const game = this.library.findGame(gameID);
        if (!game) return false;
        const app = OriginalPlatform.appName(game.platform);

        // No Launch ID: offer to open the store in the platform's app instead
        if (!OriginalPlatform.buildLaunchUrl(game.platform, game.launchId)) {
            if (confirm('"' + game.title + '" has no Launch ID yet, so it can\'t be started directly.\n\n' +
                        'Open it in ' + app + ' so you can install it?')) {
                this.platform.openStore(game.platform, game.title);
            }
            return false;
        }

        // Not in the installed-games list you loaded
        if (!game.isAvailableOnDevice()) {
            return confirm('"' + game.title + '" isn\'t in your installed ' + game.platform + ' games.\n\n' +
                           'Open it in ' + app + ' anyway? It will offer to install it.');
        }
        return true;
    }

    // ---- Starting a game ----
    // Used by every Play button (big card, sidebar, Home, Discover)
    processLaunch(gameID) {
        if (!this.validateLaunch(gameID)) return;
        const game = this.library.findGame(gameID);

        // Start the play timer and mark the game as played right away,
        // so Home shows it immediately. Play time is added when you come back.
        this.activeSession = { gameID: gameID, startedAt: Date.now() };
        game.lastPlayedAt = Date.now();
        this.library.saveGames();
        this.onSessionEnded();
        this.platform.launchGame(game.launchId, game.platform);
    }

    // ---- Ending a session ----
    // Runs when you return to the tab: adds the time you were away to the game.
    endActiveSession() {
        if (!this.activeSession) return;

        const elapsedMs = Date.now() - this.activeSession.startedAt;
        const game = this.library.findGame(this.activeSession.gameID);
        this.activeSession = null;

        if (!game || elapsedMs < LaunchController.MIN_SESSION_MS) return;

        game.totalMinutes = (game.totalMinutes || 0) + elapsedMs / 60000;
        game.lastPlayedAt = Date.now();
        this.library.saveGames();
        this.onSessionEnded();
    }
}
