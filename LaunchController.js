// ================================================================
// LaunchController
// Handles the Play buttons and tracks play time.
//
// How play time works: the browser can't see the game once it starts,
// so we time how long you're away from this tab after pressing Play.
// Anything under 15 seconds doesn't count (e.g. an accidental click).
//
// After you press Install, GameCentral can't see when the download
// finishes, so it asks "Did it finish installing?" straight away (and
// again whenever you come back). Answering yes marks the game installed
// and its button turns into Play.
//
// Uninstall works the same way in reverse: it opens the platform's
// uninstall step, asks "Did it finish uninstalling?", and answering yes
// turns the button back into Install.
// ================================================================
class LaunchController {
    static MIN_SESSION_MS = 15000; // 15 seconds
    static PENDING_INSTALL_KEY = 'gamecentral-pending-install'; // { gameID, action: 'install' | 'uninstall' }

    constructor(options) {
        this.library = options.library;                 // CentralLibrary
        this.platform = options.platform;               // OriginalPlatform
        this.playButton = options.playButton;           // big Play button (Library page only, else null)
        this.getSelectedGame = options.getSelectedGame; // the game on the big card
        this.onSessionEnded = options.onSessionEnded;   // the page redraws here

        this.activeSession = null; // { gameID, startedAt } while a game is running

        this.endActiveSession = this.endActiveSession.bind(this);

        // Coming back to this tab ends the play session, and asks about
        // a game you were installing
        this.installBar = null; // the "Did it finish installing?" bar
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.endActiveSession();
                this.checkInstall();
            }
        });
        window.addEventListener('focus', this.endActiveSession);
        window.addEventListener('focus', () => this.checkInstall());
        setTimeout(() => this.checkInstall(), 0); // also when a page opens

        // The big Play button only exists on the Library page
        if (this.playButton) {
            this.playButton.addEventListener('click', () => {
                const game = this.getSelectedGame();
                if (game) this.processAction(game.id);
            });
        }
    }

    // ---- Play or Install? ----
    // A game shows Install when you've loaded your installed-games list for
    // its platform and the game isn't in it. If no list is loaded we can't
    // tell, so it shows Play.
    static needsInstall(game) {
        return !!game && !game.isAvailableOnDevice();
    }

    // Sets a Play button's text and colour for this game.
    // iconOnly = true for the small square sidebar button.
    static styleActionButton(button, game, iconOnly) {
        const install = LaunchController.needsInstall(game);
        if (iconOnly) button.textContent = install ? '⬇' : '▶';
        else button.textContent = install ? '⬇ Install' : '▶ Play';
        button.classList.toggle('install-state', install);
        button.title = install ? 'Install' : 'Play';
        if (game) button.setAttribute('aria-label', (install ? 'Install ' : 'Play ') + game.title);
    }

    // What every Play/Install button calls
    processAction(gameID) {
        const game = this.library.findGame(gameID);
        if (!game) return;
        if (LaunchController.needsInstall(game)) this.processInstall(gameID);
        else this.processLaunch(gameID);
    }

    // ---- Installing a game ----
    // Hands the game to its platform's app to install. No play time is
    // counted. Once it's installed, load your installed-games list again
    // in Add Game and the button turns back into Play.
    processInstall(gameID) {
        const game = this.library.findGame(gameID);
        if (!game) return;
        // Remember it, so we can ask whether it finished when you come back
        // (only with a Launch ID - that's what the installed list uses)
        if (game.launchId) {
            try {
                localStorage.setItem(LaunchController.PENDING_INSTALL_KEY,
                    JSON.stringify({ gameID: game.id, action: 'install', startedAt: Date.now() }));
            } catch (e) { /* the question just won't be asked */ }
        }
        this.hideInstallBar();
        this.platform.installGame(game.launchId, game.platform, game.title);
        // Ask right away, so an already-installed game can be fixed in one click
        if (game.launchId) this.showInstallBar(game, 'install');
    }

    // ---- Uninstalling a game ----
    // Only for games in your installed list (that's what Uninstall takes them off)
    static canUninstall(game) {
        return !!game && !!game.launchId && PlatformLibrary.isInstalled(game.platform, game.launchId) === true;
    }

    // Opens the platform's uninstall step, then asks whether it finished
    processUninstall(gameID) {
        const game = this.library.findGame(gameID);
        if (!LaunchController.canUninstall(game)) return;
        if (this.activeSession && this.activeSession.gameID === game.id) this.activeSession = null; // stop timing it
        try {
            localStorage.setItem(LaunchController.PENDING_INSTALL_KEY,
                JSON.stringify({ gameID: game.id, action: 'uninstall', startedAt: Date.now() }));
        } catch (e) { /* the question just won't be asked again later */ }
        this.hideInstallBar();
        this.platform.uninstallGame(game.launchId, game.platform);
        this.showInstallBar(game, 'uninstall');
    }

    // ---- "Did it finish installing?" ----
    static loadPendingInstall() {
        try { return JSON.parse(localStorage.getItem(LaunchController.PENDING_INSTALL_KEY) || 'null'); }
        catch (e) { return null; }
    }

    static clearPendingInstall() {
        try { localStorage.removeItem(LaunchController.PENDING_INSTALL_KEY); } catch (e) { /* ignore */ }
    }

    // Shows the question if you pressed Install or Uninstall on a game
    checkInstall() {
        const pending = LaunchController.loadPendingInstall();
        if (!pending) return;
        const action = pending.action === 'uninstall' ? 'uninstall' : 'install';
        const game = this.library.findGame(pending.gameID);
        // Removed from the library, or already done (e.g. you reloaded the list)
        const done = !game || (action === 'install'
            ? !LaunchController.needsInstall(game)
            : PlatformLibrary.isInstalled(game.platform, game.launchId) !== true);
        if (done) {
            LaunchController.clearPendingInstall();
            this.hideInstallBar();
            return;
        }
        if (!this.installBar) this.showInstallBar(game, action);
    }

    // action: 'install' or 'uninstall'
    showInstallBar(game, action) {
        const uninstalling = action === 'uninstall';
        this.hideInstallBar();
        const bar = document.createElement('div');
        bar.className = 'install-check';
        bar.setAttribute('role', 'status');
        const text = document.createElement('span');
        text.className = 'install-check-text';
        text.append('Did ');
        const name = document.createElement('strong');
        name.textContent = game.title;
        text.append(name, uninstalling ? ' finish uninstalling?' : ' finish installing?');
        if (uninstalling) {
            const hint = document.createElement('small');
            hint.className = 'install-check-hint';
            hint.textContent = OriginalPlatform.uninstallHint(game.platform);
            text.append(hint);
        }

        const yes = document.createElement('button');
        yes.type = 'button';
        yes.className = 'play-button play-button-small';
        yes.textContent = uninstalling ? 'Yes, it\'s uninstalled' : 'Yes, it\'s installed';
        yes.addEventListener('click', () => {
            if (uninstalling) PlatformLibrary.markUninstalled(game.platform, game.launchId);
            else PlatformLibrary.markInstalled(game.platform, game.launchId, game.title);
            LaunchController.clearPendingInstall();
            this.hideInstallBar();
            this.onSessionEnded(); // redraw: the button turns into Play (or Install)
        });

        const notYet = document.createElement('button');
        notYet.type = 'button';
        notYet.className = 'ghost-button';
        notYet.textContent = 'Not yet';
        notYet.title = 'Ask again when I come back';
        notYet.addEventListener('click', () => this.hideInstallBar());

        const stop = document.createElement('button');
        stop.type = 'button';
        stop.className = 'install-check-close';
        stop.textContent = '×';
        stop.title = 'Stop asking';
        stop.setAttribute('aria-label', 'Stop asking about ' + game.title);
        stop.addEventListener('click', () => {
            LaunchController.clearPendingInstall();
            this.hideInstallBar();
        });

        bar.append(text, yes, notYet, stop);
        document.body.appendChild(bar);
        this.installBar = bar;
    }

    hideInstallBar() {
        if (this.installBar) this.installBar.remove();
        this.installBar = null;
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
    // Used by processAction for installed games (or when we can't tell)
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