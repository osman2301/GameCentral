// ================================================================
// OriginalPlatform
// Talks to the game's own app (Steam, the Epic Games Launcher or
// Battle.net) by opening a special link that the app picks up.
// ================================================================
class OriginalPlatform {
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

    // The platform's app, for messages ("Open it in Steam?")
    static appName(platform) {
        if (platform === 'Epic Games') return 'the Epic Games Launcher';
        if (platform === 'Battle.net') return 'the Battle.net app';
        return 'Steam';
    }

    // Asks the platform's app to start the game.
    // gameID is the game's ID on that platform (its Launch ID).
    launchGame(gameID, platform) {
        const url = OriginalPlatform.buildLaunchUrl(platform, gameID);
        if (url) window.location.href = url;
    }

    // Opens the platform's store on the game so it can be installed
    openStore(platform, title) {
        window.location.href = OriginalPlatform.appStoreUrl(platform, title);
    }
}
