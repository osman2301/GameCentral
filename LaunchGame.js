// ---- LaunchGame ----
// Launches a game through its platform's protocol link and tracks play time.
//
// We can't ask Steam/Epic/Blizzard how long a session lasted - once the
// protocol link hands off, the game is a separate process the browser
// can't see. Instead we time the gap between clicking Play (leaving the
// tab) and coming back to it, and count that gap as the play session.
// A short minimum guards against an accidental click or instant alt-tab
// being logged as "played."
//
// Options:
//   playButton       - the Play <button> element
//   getSelectedGame  - () => { game, index } | null
//   getGameAt        - (index) => game | undefined
//   onSessionEnded   - () => void   called after play time has been updated
//                                   (use it to save + re-render)
class LaunchGame {
    static MIN_SESSION_MS = 15000; // 15s

    constructor(options) {
        this.playButton = options.playButton;
        this.getSelectedGame = options.getSelectedGame;
        this.getGameAt = options.getGameAt;
        this.onSessionEnded = options.onSessionEnded;

        this.activeSession = null; // { gameIndex, startedAt }

        this.endActiveSession = this.endActiveSession.bind(this);
        this.handlePlayClick = this.handlePlayClick.bind(this);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.endActiveSession();
        });
        // Fallback for browsers that miss visibilitychange
        window.addEventListener('focus', this.endActiveSession);

        this.playButton.addEventListener('click', this.handlePlayClick);
    }

    // Builds the platform-specific protocol link that hands off to the real launcher.
    // Returns null when there's no ID saved, or the platform has no direct-launch support.
    static buildLaunchUrl(platform, launchId) {
        if (!launchId) return null;
        const id = launchId.trim();

        if (platform === 'Steam') {
            return 'steam://rungameid/' + id;
        }
        if (platform === 'Blizzard') {
            return 'battlenet://' + id;
        }
        if (platform === 'Epic Games') {
            const parts = id.split(':');
            if (parts.length !== 3) return null;
            return 'com.epicgames.launcher://apps/' + parts[0] + '%3A' + parts[1] + '%3A' + parts[2] + '?action=launch&silent=true';
        }
        return null;
    }

    handlePlayClick() {
        const selected = this.getSelectedGame();
        if (!selected) return;

        const { game, index } = selected;
        const url = LaunchGame.buildLaunchUrl(game.platform, game.launchId);
        if (!url) {
            alert('No launch link for "' + game.title + '" yet.\n\nEdit the game to add a Launch ID, or note that direct launching isn\'t supported for this platform.');
            return;
        }
        this.activeSession = { gameIndex: index, startedAt: Date.now() };
        window.location.href = url;
    }

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
