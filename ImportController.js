// ================================================================
// ImportController
// Runs the "Add a Game" window: showing the right boxes per platform,
// filling in Launch IDs from a typed name or from your installed games
// (using PlatformLibrary), and adding the finished game to the
// CentralLibrary.
// ================================================================
class ImportController {
    // Example text and help shown under Launch ID for each platform
    static LAUNCH_HINTS = {
        'Steam': { placeholder: '1245620', hint: 'The number in the game\'s store link: store.steampowered.com/app/<b>1245620</b>/…' },
        'Epic Games': { placeholder: 'namespace:catalogItemId:appName', hint: 'Filled in when you pick a game from the list above.' },
        'Battle.net': { placeholder: 'Pro', hint: 'A short product code, e.g. <b>Pro</b> for Overwatch 2 — filled in from the game name.' }
    };

    // Shows a message under a field. Error messages (isError = true) are shown in red.
    static setStatus(el, text, isError) {
        el.textContent = text;
        el.classList.toggle('error', !!isError);
    }

    constructor(options) {
        this.library = options.library;                 // CentralLibrary
        this.platformLibrary = options.platformLibrary; // PlatformLibrary
        this.onGameImported = options.onGameImported;   // the page shows the new game

        // ---- Main form ----
        this.backdrop = document.getElementById('add-game-backdrop');
        this.form = document.getElementById('add-game-form');
        this.nameInput = document.getElementById('new-game-name');
        this.platformSelect = document.getElementById('new-game-platform');
        this.playStyleSelect = document.getElementById('new-game-play-style');
        this.launchIdInput = document.getElementById('new-game-launch-id');
        this.launchIdHint = document.getElementById('launch-id-hint');

        // ---- Steam ----
        this.steamImportRow = document.getElementById('steam-import-row');
        this.steamFilesInput = document.getElementById('steam-files-input');
        this.steamGameSelect = document.getElementById('steam-game-select');
        this.steamImportStatus = document.getElementById('steam-import-status');
        this.steamLookupStatus = document.getElementById('steam-lookup-status');
        this.steamAutofillRow = document.getElementById('steam-autofill-row');
        this.steamUrlInput = document.getElementById('steam-url-input');
        this.steamAutofillStatus = document.getElementById('steam-autofill-status');
        this.steamLookupTimer = null;

        // ---- Epic ----
        this.epicImportRow = document.getElementById('epic-import-row');
        this.epicFolderInput = document.getElementById('epic-folder-input');
        this.epicGameSelect = document.getElementById('epic-game-select');
        this.epicImportStatus = document.getElementById('epic-import-status');
        this.epicLookupStatus = document.getElementById('epic-lookup-status');
        this.epicLookupTimer = null;

        // ---- Battle.net ----
        this.battleImportRow = document.getElementById('battle-import-row');
        this.battleFilesInput = document.getElementById('battle-files-input');
        this.battleGameSelect = document.getElementById('battle-game-select');
        this.battleImportStatus = document.getElementById('battle-import-status');
        this.battleLookupStatus = document.getElementById('battle-lookup-status');
        this.battleLookupTimer = null;

        this.renderSteamSelect();
        this.renderEpicSelect();
        this.renderBattleSelect();
        this.bindEvents();
        this.updateLaunchField();
    }

    // ---- Buttons and inputs ----
    bindEvents() {
        // Typing a name tries to fill in the Launch ID
        this.nameInput.addEventListener('input', () => {
            this.maybeAutoLookupSteam();
            this.maybeAutoLookupEpic();
            this.maybeAutoLookupBattle();
        });
        this.platformSelect.addEventListener('change', () => this.updateLaunchField());

        // Steam
        this.steamUrlInput.addEventListener('input', () => this.handleSteamUrlInput());
        document.getElementById('steam-search-button').addEventListener('click', () => {
            const name = this.nameInput.value.trim();
            window.open(name ? 'https://store.steampowered.com/search/?term=' + encodeURIComponent(name)
                             : 'https://store.steampowered.com/', '_blank', 'noopener');
        });
        document.getElementById('steam-files-button').addEventListener('click', () => this.steamFilesInput.click());
        this.steamFilesInput.addEventListener('change', () => this.importSteamManifests());
        this.steamGameSelect.addEventListener('change', () => this.pickSteamGame());
        document.getElementById('steam-clear-button').addEventListener('click', () => this.clearSteamInstalled());

        // Epic
        document.getElementById('epic-folder-button').addEventListener('click', () => this.epicFolderInput.click());
        this.epicFolderInput.addEventListener('change', () => this.importEpicManifests());
        this.epicGameSelect.addEventListener('change', () => this.pickEpicGame());
        document.getElementById('epic-clear-button').addEventListener('click', () => this.clearEpicGames());

        // Battle.net
        document.getElementById('battle-files-button').addEventListener('click', () => this.battleFilesInput.click());
        this.battleFilesInput.addEventListener('change', () => this.importBattlenetDb());
        this.battleGameSelect.addEventListener('change', () => this.pickBattleGame());
        document.getElementById('battle-clear-button').addEventListener('click', () => this.clearBattleInstalled());

        // Opening and closing the window
        document.getElementById('open-add-game').addEventListener('click', () => this.openModal());
        // The small "+" only exists on the Library page
        const smallAdd = document.getElementById('open-add-game-small');
        if (smallAdd) smallAdd.addEventListener('click', () => this.openModal());
        document.getElementById('close-add-game').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-add-game').addEventListener('click', () => this.closeModal());
        this.backdrop.addEventListener('click', (event) => {
            if (event.target === this.backdrop) this.closeModal(); // click outside the window
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.backdrop.classList.contains('open')) this.closeModal();
        });

        this.form.addEventListener('submit', (event) => {
            event.preventDefault(); // stop the page from reloading
            this.processImport(this.platformSelect.value);
        });
    }

    // ---- Window ----
    openModal() {
        this.backdrop.classList.add('open');
        this.updateLaunchField();
        this.nameInput.focus();
    }

    closeModal() {
        this.backdrop.classList.remove('open');
        this.form.reset();
        this.updateLaunchField();
    }

    // Shows only the boxes that belong to the chosen platform
    updateLaunchField() {
        const platform = this.platformSelect.value;
        const config = ImportController.LAUNCH_HINTS[platform];
        this.launchIdInput.placeholder = config.placeholder;
        this.launchIdHint.innerHTML = config.hint;

        const isSteam = platform === 'Steam';
        this.steamAutofillRow.style.display = isSteam ? '' : 'none';
        this.steamImportRow.style.display = isSteam ? '' : 'none';
        if (isSteam) {
            this.maybeAutoLookupSteam();
        } else {
            this.steamUrlInput.value = '';
            ImportController.setStatus(this.steamAutofillStatus, '');
            ImportController.setStatus(this.steamLookupStatus, '');
        }

        const isEpic = platform === 'Epic Games';
        this.epicImportRow.style.display = isEpic ? '' : 'none';
        if (isEpic) {
            this.renderEpicSelect();
            this.maybeAutoLookupEpic();
        } else {
            ImportController.setStatus(this.epicLookupStatus, '');
        }

        const isBattle = platform === 'Battle.net';
        this.battleImportRow.style.display = isBattle ? '' : 'none';
        if (isBattle) this.maybeAutoLookupBattle();
        else ImportController.setStatus(this.battleLookupStatus, '');
    }

    // ---- Adding the game ----
    // Builds the new Game from the form and adds it to the CentralLibrary
    processImport(platformID) {
        const name = this.nameInput.value.trim();
        if (!name) return;

        const launchId = this.launchIdInput.value.trim();
        if (platformID === 'Epic Games' && launchId && launchId.split(':').length !== 3) {
            alert('Epic Launch IDs need three colon-separated parts: namespace:catalogItemId:appName');
            return;
        }

        const game = new Game({ title: name, platform: platformID, playStyle: this.playStyleSelect.value, launchId: launchId });
        if (!this.library.addGames([game])) {
            alert('"' + name + '" is already in your library.');
            return;
        }
        this.closeModal();
        this.onGameImported(game);
    }

    // Fills an installed-games drop-down from a list of Game objects
    static fillSelect(sel, list, emptyText, clearButtonId) {
        sel.innerHTML = '';
        const first = document.createElement('option');
        first.value = '';
        first.textContent = list.length ? 'Pick an installed game…' : emptyText;
        sel.appendChild(first);
        list.forEach((g, i) => {
            const opt = document.createElement('option');
            opt.value = String(i);
            opt.textContent = g.title;
            sel.appendChild(opt);
        });
        sel.disabled = !list.length;
        document.getElementById(clearButtonId).style.display = list.length ? '' : 'none';
    }

    // ================================================================
    // Steam
    // ================================================================

    // Runs as you type: installed games first, then the big Steam list.
    // Waits 200ms after the last key so it doesn't search on every keystroke.
    maybeAutoLookupSteam() {
        if (this.platformSelect.value !== 'Steam') return;

        const name = this.nameInput.value.trim();
        clearTimeout(this.steamLookupTimer);
        if (name.length < 3) {
            ImportController.setStatus(this.steamLookupStatus, '');
            return;
        }

        this.steamLookupTimer = setTimeout(() => {
            const installedList = this.platformLibrary.steamInstalled;
            const installed = PlatformLibrary.findListMatch(installedList, name);
            if (installed) {
                this.launchIdInput.value = installed.id;
                ImportController.setStatus(this.steamLookupStatus, 'Matched installed game "' + installed.name + '" — Launch ID ' + installed.id + ' filled in.');
                return;
            }
            const match = this.platformLibrary.findSteamMatch(name);
            if (match && installedList.length) {
                // Your installed list is loaded and this game isn't in it
                this.launchIdInput.value = match.id;
                ImportController.setStatus(this.steamLookupStatus, 'Matched "' + match.name + '" (Launch ID ' + match.id + '), but it isn\'t in your installed Steam games. ' +
                    'You can still add it — Play will open it in Steam so you can install it.', true);
            } else if (match) {
                // No installed list loaded, so we can't tell if it's installed
                this.launchIdInput.value = match.id;
                ImportController.setStatus(this.steamLookupStatus, 'Matched "' + match.name + '" — Launch ID ' + match.id + ' filled in. ' +
                    'Load your installed Steam games above to check whether it\'s installed.');
            } else {
                ImportController.setStatus(this.steamLookupStatus, 'No match in the local Steam list — enter the ID manually or use the fallback below.', true);
            }
        }, 200);
    }

    // ---- Pasted store link or App ID ----
    handleSteamUrlInput() {
        const value = this.steamUrlInput.value.trim();
        const fromLink = value.match(/store\.steampowered\.com\/app\/(\d+)/i);
        const appId = /^\d+$/.test(value) ? value : (fromLink ? fromLink[1] : null);
        if (appId) {
            this.launchIdInput.value = appId;
            ImportController.setStatus(this.steamAutofillStatus, 'Found App ID ' + appId + ' — filled in above.');
        } else if (value) {
            ImportController.setStatus(this.steamAutofillStatus, 'Couldn\'t find an App ID in that link — check it\'s a store.steampowered.com/app/ URL.', true);
        } else {
            ImportController.setStatus(this.steamAutofillStatus, '');
        }
    }

    // ---- Installed Steam games ----
    importSteamManifests() {
        const input = this.steamFilesInput;
        const files = Array.from(input.files || []).filter(f => /\.acf$/i.test(f.name));
        input.value = '';
        if (!files.length) {
            ImportController.setStatus(this.steamImportStatus, 'No appmanifest_*.acf files picked. They are in C:\\Program Files (x86)\\Steam\\steamapps (and each other library\'s steamapps folder).', true);
            return;
        }
        ImportController.setStatus(this.steamImportStatus, 'Reading ' + files.length + ' file(s)…');
        this.platformLibrary.readSteamFiles(files).then(result => {
            const skipNote = result.skipped.length ? ' Skipped: ' + result.skipped.join(', ') + '.' : '';
            if (!result.found) {
                ImportController.setStatus(this.steamImportStatus, 'Found no installed games in those files.' + skipNote, true);
                return;
            }
            this.renderSteamSelect();
            ImportController.setStatus(this.steamImportStatus, 'Read ' + result.found + ' game(s), ' + result.added + ' new. ' +
                this.platformLibrary.steamInstalled.length + ' installed Steam game(s) in the list.' + skipNote);
            this.maybeAutoLookupSteam();
        });
    }

    renderSteamSelect() {
        ImportController.fillSelect(this.steamGameSelect, this.platformLibrary.requestGames('Steam'), 'No Steam games loaded yet', 'steam-clear-button');
    }

    pickSteamGame() {
        const g = this.platformLibrary.requestGames('Steam')[Number(this.steamGameSelect.value)];
        if (this.steamGameSelect.value === '' || !g) return;
        clearTimeout(this.steamLookupTimer);
        this.nameInput.value = g.title;
        this.launchIdInput.value = g.launchId;
        ImportController.setStatus(this.steamLookupStatus, 'Launch ID ' + g.launchId + ' for "' + g.title + '" filled in.');
    }

    clearSteamInstalled() {
        this.platformLibrary.clearInstalled('Steam');
        this.renderSteamSelect();
        ImportController.setStatus(this.steamImportStatus, 'List cleared. Load your appmanifest files again to rebuild it.');
    }

    // ================================================================
    // Epic Games
    // ================================================================

    // Reads every Epic file in the picked folder and replaces the saved list
    importEpicManifests() {
        const input = this.epicFolderInput;
        const files = Array.from(input.files || []).filter(f => /\.(item|dat|mancpn)$/i.test(f.name));
        input.value = '';
        if (!files.length) {
            ImportController.setStatus(this.epicImportStatus, 'No .item files found there. Pick the Manifests folder: C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests', true);
            return;
        }
        ImportController.setStatus(this.epicImportStatus, 'Reading ' + files.length + ' file(s)…');
        const label = 'Loaded ' + files.length + ' file(s)';
        this.platformLibrary.readEpicFiles(files).then(result => {
            const skipNote = result.skipped.length ? ' Skipped: ' + result.skipped.join(', ') + '.' : '';
            if (!result.list.length) {
                ImportController.setStatus(this.epicImportStatus, label + ': found no installed games.' + skipNote, true);
                return;
            }
            this.renderEpicSelect();
            ImportController.setStatus(this.epicImportStatus, label + ': found ' + result.list.length + ' game(s): ' + result.list.map(g => g[1]).join(', ') + '.' + skipNote);
            this.maybeAutoLookupEpic();
        });
    }

    renderEpicSelect() {
        ImportController.fillSelect(this.epicGameSelect, this.platformLibrary.requestGames('Epic Games'), 'No Epic games loaded yet', 'epic-clear-button');
    }

    clearEpicGames() {
        this.platformLibrary.clearInstalled('Epic Games');
        this.renderEpicSelect();
        ImportController.setStatus(this.epicImportStatus, 'List cleared. Load your Epic files again to rebuild it.');
    }

    pickEpicGame() {
        const g = this.platformLibrary.requestGames('Epic Games')[Number(this.epicGameSelect.value)];
        if (this.epicGameSelect.value === '' || !g) return;
        this.nameInput.value = g.title;
        this.launchIdInput.value = g.launchId;
        ImportController.setStatus(this.epicLookupStatus, 'Launch ID for "' + g.title + '" filled in.');
    }

    // Runs as you type: looks for the name in your installed Epic games
    maybeAutoLookupEpic() {
        if (this.platformSelect.value !== 'Epic Games') return;

        const name = this.nameInput.value.trim();
        clearTimeout(this.epicLookupTimer);
        if (name.length < 3) {
            ImportController.setStatus(this.epicLookupStatus, '');
            return;
        }
        if (!this.platformLibrary.epicGames.length) {
            ImportController.setStatus(this.epicLookupStatus, 'Load your installed Epic games above to fill this in automatically.');
            return;
        }

        this.epicLookupTimer = setTimeout(() => {
            const match = PlatformLibrary.findListMatch(this.platformLibrary.epicGames, name);
            if (match) {
                this.launchIdInput.value = match.id;
                ImportController.setStatus(this.epicLookupStatus, 'Matched "' + match.name + '" — Launch ID filled in.');
            } else {
                ImportController.setStatus(this.epicLookupStatus, 'Not in your installed Epic games. You can still add it — Play will open it in the Epic Games Launcher so you can install it.', true);
            }
        }, 200);
    }

    // ================================================================
    // Battle.net
    // ================================================================
    importBattlenetDb() {
        const input = this.battleFilesInput;
        const file = Array.from(input.files || []).find(f => /\.db$/i.test(f.name));
        input.value = '';
        if (!file) {
            ImportController.setStatus(this.battleImportStatus, 'Pick product.db from C:\\ProgramData\\Battle.net\\Agent');
            return;
        }
        this.platformLibrary.readBattlenetFile(file).then(list => {
            if (!list.length) {
                ImportController.setStatus(this.battleImportStatus, 'Found no installed Battle.net games in ' + file.name + '.', true);
                return;
            }
            this.renderBattleSelect();
            ImportController.setStatus(this.battleImportStatus, 'Found ' + list.length + ' game(s): ' + list.map(g => g[1]).join(', ') + '.');
            this.maybeAutoLookupBattle();
        }, () => {
            ImportController.setStatus(this.battleImportStatus, 'Couldn\'t read ' + file.name + '.', true);
        });
    }

    renderBattleSelect() {
        ImportController.fillSelect(this.battleGameSelect, this.platformLibrary.requestGames('Battle.net'), 'No Battle.net games loaded yet', 'battle-clear-button');
    }

    pickBattleGame() {
        const g = this.platformLibrary.requestGames('Battle.net')[Number(this.battleGameSelect.value)];
        if (this.battleGameSelect.value === '' || !g) return;
        clearTimeout(this.battleLookupTimer);
        this.nameInput.value = g.title;
        this.launchIdInput.value = g.launchId;
        ImportController.setStatus(this.battleLookupStatus, 'Launch ID ' + g.launchId + ' for "' + g.title + '" filled in.');
    }

    clearBattleInstalled() {
        this.platformLibrary.clearInstalled('Battle.net');
        this.renderBattleSelect();
        ImportController.setStatus(this.battleImportStatus, 'List cleared. Load product.db again to rebuild it.');
    }

    // Runs as you type: installed games first, then every known Battle.net
    // game, so uninstalled games still get a code.
    maybeAutoLookupBattle() {
        if (this.platformSelect.value !== 'Battle.net') return;
        const name = this.nameInput.value.trim();
        clearTimeout(this.battleLookupTimer);
        if (name.length < 2) { ImportController.setStatus(this.battleLookupStatus, ''); return; }
        this.battleLookupTimer = setTimeout(() => {
            const installed = PlatformLibrary.findListMatch(this.platformLibrary.battleInstalled, name);
            const known = installed || PlatformLibrary.findListMatch(PlatformLibrary.knownBattlenetGames(), name);
            if (known) {
                this.launchIdInput.value = known.id;
                ImportController.setStatus(this.battleLookupStatus, (installed ? 'Matched installed game "' : 'Matched "') + known.name + '" — Launch ID ' + known.id + ' filled in.' +
                    (installed ? '' : ' If it isn\'t installed, Play opens it in Battle.net so you can install it.'));
            } else {
                ImportController.setStatus(this.battleLookupStatus, 'Not a known Battle.net game — enter its product code by hand if you know it.', true);
            }
        }, 200);
    }
}