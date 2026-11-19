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

    // Builds the link that tells the platform's app to install the game.
    // Returns null when the game has no (valid) Launch ID.
    //   Steam:      opens Steam's install window (pick a drive, then Install)
    //   Epic:       asks the Epic Games Launcher to install it (not officially documented)
    //   Battle.net: opens the game's page in the Battle.net app, where you click Install
    static buildInstallUrl(platform, launchId) {
        if (!launchId) return null;
        const id = launchId.trim();

        if (platform === 'Steam') {
            return 'steam://install/' + id;
        }
        if (platform === 'Battle.net') {
            return 'battlenet://' + id;
        }
        if (platform === 'Epic Games') {
            const parts = id.split(':');
            if (parts.length !== 3) return null;
            return 'com.epicgames.launcher://apps/' + parts.join('%3A') + '?action=install';
        }
        return null;
    }

    // Builds the link that takes you to the platform's uninstall step.
    //   Steam:      opens Steam's "Uninstall <game>?" window
    //   Epic:       opens your Epic library - click ⋯ on the game, then Uninstall
    //               (the launcher only accepts action=launch and action=install,
    //               so there's no link that uninstalls one game)
    //   Battle.net: opens the game's page - click the gear next to Play, then Uninstall
    // (Epic and Battle.net have no direct uninstall link, so GameCentral
    // shows what to click - see uninstallHint and LaunchController.)
    static buildUninstallUrl(platform, launchId) {
        if (!launchId) return null;
        const id = launchId.trim();
        if (platform === 'Steam') return 'steam://uninstall/' + id;
        if (platform === 'Battle.net') return 'battlenet://' + id;
        if (platform === 'Epic Games') return 'com.epicgames.launcher://library';
        return null;
    }

    // What to tell you to do in the platform's app after opening it
    static uninstallHint(platform) {
        if (platform === 'Epic Games') return 'In your Epic library, click ⋯ on the game, then Uninstall.';
        if (platform === 'Battle.net') return 'In Battle.net, click the gear next to Play, then Uninstall.';
        return 'Confirm in Steam\'s Uninstall window.';
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

    // Asks the platform's app to install the game.
    // Without a usable Launch ID, opens a store search for it instead.
    installGame(launchId, platform, title) {
        const url = OriginalPlatform.buildInstallUrl(platform, launchId);
        if (url) window.location.href = url;
        else this.openStore(platform, title);
    }

    // Asks the platform's app to uninstall the game (see buildUninstallUrl)
    uninstallGame(launchId, platform) {
        const url = OriginalPlatform.buildUninstallUrl(platform, launchId);
        if (url) window.location.href = url;
    }

    // Opens the platform's store on the game so it can be installed
    openStore(platform, title) {
        window.location.href = OriginalPlatform.appStoreUrl(platform, title);
    }
}