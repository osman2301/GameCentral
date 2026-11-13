// ================================================================
// ImportController
// Runs the "Add a Game" window: showing the right boxes per platform,
// filling in the game's name and Launch ID from the game you pick in a
// list (using PlatformLibrary), and adding the finished game to the
// CentralLibrary. The name and Launch ID can't be typed in by hand.
// ================================================================
class GameSearchBox {
    // A search box with a drop-down of matching games, used for
    // "All Steam games", "Your Epic library" and "All Battle.net games".
    // Type to search, then click a game or use the arrow keys and Enter.
    //   options.input / results / status - the <input>, <ul> and message line
    //   options.search(query)   -> [{ id, name }] matches
    //   options.browse()        -> [{ id, name }] shown when you click the box
    //                              before typing (so it works like a drop-down)
    //   options.isInstalled(id) -> true / false / null (null = can't tell, no tag)
    //   options.onPick(game)    -> fills in the form
    //   options.showIds         -> show each game's ID (handy for Steam editions)
    //   options.noMatch(query)  -> message when nothing matches
    constructor(options) {
        this.o = options;
        this.input = options.input;
        this.results = options.results;
        this.status = options.status;
        this.matches = []; // [{ id, name }] in the drop-down
        this.active = -1;  // highlighted row (arrow keys)
        this.timer = null;

        this.input.addEventListener('input', () => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.run(), 120);
        });
        // Clicking the box opens the list, even before you type
        this.input.addEventListener('focus', () => this.open());
        this.input.addEventListener('click', () => this.open());
        this.input.addEventListener('blur', () => setTimeout(() => this.show(false), 150));
        this.input.addEventListener('keydown', (event) => this.onKey(event));
        // mousedown (not click) so it runs before the box loses focus
        this.results.addEventListener('mousedown', (event) => {
            const li = event.target.closest('li[data-index]');
            if (!li) return;
            event.preventDefault();
            this.pick(Number(li.dataset.index));
        });
    }

    // Opens the list if it's closed (fills it first if needed)
    open() {
        if (this.input.disabled || !this.results.hidden) return;
        if (!this.matches.length) this.run();
        else this.show(true);
    }

    run() {
        const query = this.input.value.trim();
        if (query.length >= 2) this.matches = this.o.search(query);
        else this.matches = this.o.browse ? this.o.browse() : []; // empty box: the starting list
        this.active = this.matches.length ? 0 : -1;
        this.render();
        if (query.length >= 2 && !this.matches.length) ImportController.setStatus(this.status, this.o.noMatch(query), true);
        else ImportController.setStatus(this.status, '');
    }

    render() {
        this.results.innerHTML = '';
        this.matches.forEach((g, i) => {
            const li = document.createElement('li');
            li.dataset.index = String(i);
            li.id = this.results.id + '-option-' + i;
            li.setAttribute('role', 'option');
            li.className = i === this.active ? 'active' : '';
            li.setAttribute('aria-selected', i === this.active ? 'true' : 'false');
            const name = document.createElement('span');
            name.className = 'result-name';
            name.textContent = g.name;
            li.appendChild(name);
            // INSTALLED / INSTALL tag, when your installed list is loaded
            const installed = this.o.isInstalled(g.id);
            if (installed !== null) {
                const tag = document.createElement('span');
                tag.className = 'result-tag ' + (installed ? 'tag-installed' : 'tag-not-installed');
                tag.textContent = installed ? 'INSTALLED' : 'INSTALL';
                li.appendChild(tag);
            }
            if (this.o.showIds) {
                const id = document.createElement('span');
                id.className = 'result-id';
                id.textContent = g.id;
                li.appendChild(id);
            }
            this.results.appendChild(li);
        });
        this.show(this.matches.length > 0);
    }

    show(visible) {
        this.results.hidden = !visible;
        this.input.setAttribute('aria-expanded', visible ? 'true' : 'false');
        if (visible && this.active >= 0) this.input.setAttribute('aria-activedescendant', this.results.id + '-option-' + this.active);
        else this.input.removeAttribute('aria-activedescendant');
    }

    // Arrow keys move, Enter picks, Escape closes the list (not the window)
    onKey(event) {
        const open = !this.results.hidden && this.matches.length > 0;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) { this.open(); return; } // first press opens the list
            if (!this.matches.length) return;
            const n = this.matches.length;
            this.active = (this.active + (event.key === 'ArrowDown' ? 1 : -1) + n) % n;
            this.render();
            const li = this.results.children[this.active];
            if (li) li.scrollIntoView({ block: 'nearest' });
        } else if (event.key === 'Enter') {
            event.preventDefault(); // don't submit the form
            if (open && this.active >= 0) this.pick(this.active);
        } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation(); // keep the Add Game window open
            this.show(false);
        }
    }

    pick(i) {
        const g = this.matches[i];
        if (!g) return;
        this.o.onPick(g);
        this.reset();
    }

    reset() {
        clearTimeout(this.timer);
        this.input.value = '';
        this.matches = [];
        this.active = -1;
        this.results.innerHTML = '';
        this.show(false);
        ImportController.setStatus(this.status, '');
    }

    // Greys the box out (e.g. before your Epic library is loaded)
    setEnabled(enabled, placeholder) {
        this.input.disabled = !enabled;
        this.input.placeholder = placeholder;
        if (!enabled) this.reset();
    }
}

class ImportController {
    // Example text and help shown under Launch ID for each platform
    static LAUNCH_HINTS = {
        'Steam': { hint: 'Pick a game from your installed Steam games or All Steam games above.' },
        'Epic Games': { hint: 'Pick a game from your installed Epic games or your Epic library above.' },
        'Battle.net': { hint: 'Pick a game from your installed Battle.net games or All Battle.net games above.' }
    };

    // Shows a message under a field. Error messages (isError = true) are shown in red.
    static setStatus(el, text, isError) {
        el.textContent = text;
        el.classList.toggle('error', !!isError);
        el.style.color = isError ? '#ff6b6b' : ''; // red, even if style.css is an older copy
    }

    constructor(options) {
        this.library = options.library;                 // CentralLibrary
        this.platformLibrary = options.platformLibrary; // PlatformLibrary
        this.onGameImported = options.onGameImported;   // the page shows the new game
        this.onInstalledChanged = options.onInstalledChanged || function () {}; // Play/Install buttons update

        // ---- Main form ----
        this.backdrop = document.getElementById('add-game-backdrop');
        this.form = document.getElementById('add-game-form');
        this.nameInput = document.getElementById('new-game-name');
        this.platformSelect = document.getElementById('new-game-platform');
        this.launchIdInput = document.getElementById('new-game-launch-id');
        this.launchIdHint = document.getElementById('launch-id-hint');

        // ---- Steam ----
        this.steamImportRow = document.getElementById('steam-import-row');
        this.steamFilesInput = document.getElementById('steam-files-input');
        this.steamGameSelect = document.getElementById('steam-game-select');
        this.steamImportStatus = document.getElementById('steam-import-status');
        this.steamLookupStatus = document.getElementById('steam-lookup-status');
        // "All Steam games" search drop-down
        this.steamAllRow = document.getElementById('steam-all-row');
        this.steamSearch = new GameSearchBox({
            input: document.getElementById('steam-all-search'),
            results: document.getElementById('steam-all-results'),
            status: document.getElementById('steam-all-status'),
            search: query => this.platformLibrary.searchSteamGames(query, 30),
            browse: () => this.platformLibrary.popularSteamGames(50),
            isInstalled: id => PlatformLibrary.isInstalled('Steam', id),
            onPick: g => this.pickSteamSearchResult(g),
            showIds: true,
            noMatch: query => 'No Steam game matches "' + query + '". Very new games may be missing from the list.'
        });

        // ---- Epic ----
        this.epicImportRow = document.getElementById('epic-import-row');
        this.epicFolderInput = document.getElementById('epic-folder-input');
        this.epicGameSelect = document.getElementById('epic-game-select');
        this.epicImportStatus = document.getElementById('epic-import-status');
        this.epicLookupStatus = document.getElementById('epic-lookup-status');
        // Your Epic library (catcache.bin): every game you own, installed or not
        this.epicOwnedRow = document.getElementById('epic-owned-row');
        this.epicOwnedInput = document.getElementById('epic-owned-input');
        this.epicOwnedSelect = document.getElementById('epic-owned-select');
        this.epicOwnedStatus = document.getElementById('epic-owned-status');
        // Search drop-down for your Epic library
        this.epicSearch = new GameSearchBox({
            input: document.getElementById('epic-owned-search'),
            results: document.getElementById('epic-owned-results'),
            status: document.getElementById('epic-owned-search-status'),
            search: query => PlatformLibrary.searchList(this.platformLibrary.epicOwned, query, 30),
            browse: () => this.platformLibrary.epicOwned.map(g => ({ id: String(g[0]), name: g[1] })),
            isInstalled: id => PlatformLibrary.isInstalled('Epic Games', id),
            onPick: g => this.pickEpicSearchResult(g),
            showIds: false,
            noMatch: query => 'No game in your Epic library matches "' + query + '". If you just got it, open the Epic launcher and load catcache.bin again.'
        });

        // ---- Battle.net ----
        this.battleImportRow = document.getElementById('battle-import-row');
        this.battleFilesInput = document.getElementById('battle-files-input');
        this.battleGameSelect = document.getElementById('battle-game-select');
        this.battleImportStatus = document.getElementById('battle-import-status');
        this.battleLookupStatus = document.getElementById('battle-lookup-status');
        // "All Battle.net games" search drop-down (every known Battle.net game)
        this.battleAllRow = document.getElementById('battle-all-row');
        this.battleSearch = new GameSearchBox({
            input: document.getElementById('battle-all-search'),
            results: document.getElementById('battle-all-results'),
            status: document.getElementById('battle-all-status'),
            search: query => PlatformLibrary.searchList(PlatformLibrary.knownBattlenetGames(), query, 30),
            browse: () => PlatformLibrary.knownBattlenetGames().map(g => ({ id: String(g[0]), name: g[1] })),
            isInstalled: id => PlatformLibrary.isInstalled('Battle.net', id),
            onPick: g => this.pickBattleSearchResult(g),
            showIds: false,
            noMatch: query => 'No Battle.net game matches "' + query + '".'
        });

        // ---- "Already added" check ----
        this.duplicateShown = false; // is the red "already added" message showing?

        this.renderSteamSelect();
        this.renderEpicSelect();
        this.renderEpicOwnedSelect();
        this.renderBattleSelect();
        this.bindEvents();
        this.updateLaunchField();
    }

    // ---- Buttons and inputs ----
    bindEvents() {
        // A game picked for another platform doesn't fit this one, so start over
        this.platformSelect.addEventListener('change', () => {
            this.clearPickedGame();
            this.updateLaunchField();
        });

        // Steam
        document.getElementById('steam-files-button').addEventListener('click', () => this.steamFilesInput.click());
        this.steamFilesInput.addEventListener('change', () => this.importSteamManifests());
        this.steamGameSelect.addEventListener('change', () => this.pickSteamGame());
        document.getElementById('steam-clear-button').addEventListener('click', () => this.clearSteamInstalled());

        // Epic
        document.getElementById('epic-folder-button').addEventListener('click', () => this.epicFolderInput.click());
        this.epicFolderInput.addEventListener('change', () => this.importEpicManifests());
        this.epicGameSelect.addEventListener('change', () => this.pickEpicGame());
        document.getElementById('epic-clear-button').addEventListener('click', () => this.clearEpicGames());
        document.getElementById('epic-owned-button').addEventListener('click', () => this.epicOwnedInput.click());
        this.epicOwnedInput.addEventListener('change', () => this.importEpicLibrary());
        this.epicOwnedSelect.addEventListener('change', () => this.pickEpicOwnedGame());
        document.getElementById('epic-owned-clear-button').addEventListener('click', () => this.clearEpicLibrary());

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
        // Lists may have changed since this page opened (e.g. a game marked installed)
        this.platformLibrary.reloadInstalled();
        this.renderSteamSelect();
        this.renderBattleSelect();
        this.backdrop.classList.add('open');
        this.updateLaunchField();
        this.platformSelect.focus();
    }

    closeModal() {
        this.backdrop.classList.remove('open');
        this.form.reset();
        this.steamSearch.reset();
        this.epicSearch.reset();
        this.battleSearch.reset();
        this.clearPickedGame();
        this.updateLaunchField();
    }

    // Shows only the boxes that belong to the chosen platform
    updateLaunchField() {
        const platform = this.platformSelect.value;
        const config = ImportController.LAUNCH_HINTS[platform];
        this.launchIdHint.textContent = config.hint;

        const isSteam = platform === 'Steam';
        this.steamImportRow.style.display = isSteam ? '' : 'none';
        this.steamAllRow.style.display = isSteam ? '' : 'none';

        const isEpic = platform === 'Epic Games';
        this.epicImportRow.style.display = isEpic ? '' : 'none';
        this.epicOwnedRow.style.display = isEpic ? '' : 'none';
        if (isEpic) {
            this.renderEpicSelect();
            this.renderEpicOwnedSelect();
        }

        const isBattle = platform === 'Battle.net';
        this.battleImportRow.style.display = isBattle ? '' : 'none';
        this.battleAllRow.style.display = isBattle ? '' : 'none';
    }

    // Empties the game details and their messages (e.g. after switching platform)
    clearPickedGame() {
        this.nameInput.value = '';
        this.launchIdInput.value = '';
        this.duplicateShown = false;
        [this.steamLookupStatus, this.epicLookupStatus, this.battleLookupStatus]
            .forEach(el => ImportController.setStatus(el, ''));
        // The installed-games drop-downs go back to "Pick an installed game…"
        [this.steamGameSelect, this.epicGameSelect, this.epicOwnedSelect, this.battleGameSelect]
            .forEach(sel => { sel.value = ''; });
    }

    // ---- Adding the game ----
    // Builds the new Game from the form and adds it to the CentralLibrary
    processImport(platformID) {
        const name = this.nameInput.value.trim();
        if (!name) {
            ImportController.setStatus(this.lookupStatusFor(platformID), 'Pick a game from a list above first.', true);
            return;
        }

        const launchId = this.launchIdInput.value.trim();
        if (platformID === 'Epic Games' && launchId && launchId.split(':').length !== 3) {
            alert('Epic Launch IDs need three colon-separated parts: namespace:catalogItemId:appName');
            return;
        }

        const game = new Game({ title: name, platform: platformID, launchId: launchId });
        // Already in the library on this platform? Show the red message and stay open.
        if (this.showIfAlreadyAdded()) return;
        this.library.addGames([game]);
        this.closeModal();
        this.onGameImported(game);
    }

    // ---- "Already added" message (all three platforms) ----
    // The message line under Launch ID for the chosen platform
    lookupStatusFor(platform) {
        if (platform === 'Epic Games') return this.epicLookupStatus;
        if (platform === 'Battle.net') return this.battleLookupStatus;
        return this.steamLookupStatus;
    }

    // Shows a red message if this game is already in the library on the
    // chosen platform (using Game.sameGame). Returns true if it is.
    showIfAlreadyAdded() {
        const name = this.nameInput.value.trim();
        const platform = this.platformSelect.value;
        const status = this.lookupStatusFor(platform);
        const game = new Game({ title: name, platform: platform, launchId: this.launchIdInput.value.trim() });
        const existing = name ? this.library.games.find(g => g.sameGame(game)) : null;

        if (existing) {
            ImportController.setStatus(status, '"' + existing.title + '" is already added to your library on ' + platform + '.', true);
            this.duplicateShown = true;
            return true;
        }
        if (this.duplicateShown) {
            // It was a duplicate a moment ago but isn't any more
            if (status.textContent.indexOf('is already added') !== -1) ImportController.setStatus(status, '');
            this.duplicateShown = false;
        }
        return false;
    }

    // Fills an installed-games drop-down from a list of Game objects
    static fillSelect(sel, list, emptyText, clearButtonId, pickText) {
        sel.innerHTML = '';
        const first = document.createElement('option');
        first.value = '';
        first.textContent = list.length ? (pickText || 'Pick an installed game…') : emptyText;
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

    // ---- "All Steam games" search: a game was picked ----
    pickSteamSearchResult(g) {
        this.nameInput.value = g.name;
        this.launchIdInput.value = g.id;
        const installed = PlatformLibrary.isInstalled('Steam', g.id);
        let note = '';
        if (installed === false) note = ' It isn\'t installed, so it will get an Install button.';
        else if (installed === null) note = ' Load your installed Steam games above to check whether it\'s installed.';
        ImportController.setStatus(this.steamLookupStatus, 'Launch ID ' + g.id + ' for "' + g.name + '" filled in.' + note);
        this.showIfAlreadyAdded();
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
            this.onInstalledChanged();
            ImportController.setStatus(this.steamImportStatus, 'Read ' + result.found + ' game(s), ' + result.added + ' new. ' +
                this.platformLibrary.steamInstalled.length + ' installed Steam game(s) in the list.' + skipNote);
        });
    }

    renderSteamSelect() {
        ImportController.fillSelect(this.steamGameSelect, this.platformLibrary.requestGames('Steam'), 'No Steam games loaded yet', 'steam-clear-button');
    }

    pickSteamGame() {
        const g = this.platformLibrary.requestGames('Steam')[Number(this.steamGameSelect.value)];
        if (this.steamGameSelect.value === '' || !g) return;
        this.nameInput.value = g.title;
        this.launchIdInput.value = g.launchId;
        ImportController.setStatus(this.steamLookupStatus, 'Launch ID ' + g.launchId + ' for "' + g.title + '" filled in.');
        this.showIfAlreadyAdded();
    }

    clearSteamInstalled() {
        this.platformLibrary.clearInstalled('Steam');
        this.renderSteamSelect();
        this.onInstalledChanged();
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
            this.onInstalledChanged();
            ImportController.setStatus(this.epicImportStatus, label + ': found ' + result.list.length + ' game(s): ' + result.list.map(g => g[1]).join(', ') + '.' + skipNote);
        });
    }

    renderEpicSelect() {
        ImportController.fillSelect(this.epicGameSelect, this.platformLibrary.requestGames('Epic Games'), 'No Epic games loaded yet', 'epic-clear-button');
    }

    clearEpicGames() {
        this.platformLibrary.clearInstalled('Epic Games');
        this.renderEpicSelect();
        this.onInstalledChanged();
        ImportController.setStatus(this.epicImportStatus, 'List cleared. Load your Epic files again to rebuild it.');
    }

    pickEpicGame() {
        const g = this.platformLibrary.requestGames('Epic Games')[Number(this.epicGameSelect.value)];
        if (this.epicGameSelect.value === '' || !g) return;
        this.nameInput.value = g.title;
        this.launchIdInput.value = g.launchId;
        ImportController.setStatus(this.epicLookupStatus, 'Launch ID for "' + g.title + '" filled in.');
        this.showIfAlreadyAdded();
    }

    // ---- Your Epic library (catcache.bin) ----
    importEpicLibrary() {
        const input = this.epicOwnedInput;
        const file = Array.from(input.files || [])[0];
        input.value = '';
        if (!file) return;
        ImportController.setStatus(this.epicOwnedStatus, 'Reading ' + file.name + '…');
        this.platformLibrary.readEpicCatcache(file).then(list => {
            if (list === null) {
                ImportController.setStatus(this.epicOwnedStatus, file.name + ' isn\'t an Epic catalog cache. Pick catcache.bin from C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Catalog', true);
                return;
            }
            if (!list.length) {
                ImportController.setStatus(this.epicOwnedStatus, 'Found no games in ' + file.name + '. Open the Epic launcher, let it load your library, then try again.', true);
                return;
            }
            this.renderEpicOwnedSelect();
            const installedCount = list.filter(g => PlatformLibrary.isInstalled('Epic Games', g[0]) === true).length;
            const installedNote = this.platformLibrary.epicGames.length ? ' (' + installedCount + ' installed)' : '';
            ImportController.setStatus(this.epicOwnedStatus, 'Found ' + list.length + ' game(s) in your Epic library' + installedNote + '.');
        }, () => {
            ImportController.setStatus(this.epicOwnedStatus, 'Couldn\'t read ' + file.name + '.', true);
        });
    }

    renderEpicOwnedSelect() {
        const owned = this.platformLibrary.requestOwnedEpicGames();
        ImportController.fillSelect(this.epicOwnedSelect, owned,
            'No Epic library loaded yet', 'epic-owned-clear-button', 'Pick a game you own…');
        this.epicSearch.setEnabled(owned.length > 0, owned.length
            ? 'Search or pick from your ' + owned.length + ' Epic games…'
            : 'Load your Epic library to search it');
    }

    // ---- Epic library search: a game was picked ----
    pickEpicSearchResult(g) {
        this.nameInput.value = g.name;
        this.launchIdInput.value = g.id;
        const installed = PlatformLibrary.isInstalled('Epic Games', g.id);
        let note = '';
        if (installed === false) note = ' It isn\'t installed, so it will get an Install button.';
        else if (installed === null) note = ' Load your installed Epic games above to check whether it\'s installed.';
        ImportController.setStatus(this.epicLookupStatus, 'Launch ID for "' + g.name + '" filled in.' + note);
        this.showIfAlreadyAdded();
    }

    pickEpicOwnedGame() {
        const g = this.platformLibrary.requestOwnedEpicGames()[Number(this.epicOwnedSelect.value)];
        if (this.epicOwnedSelect.value === '' || !g) return;
        this.nameInput.value = g.title;
        this.launchIdInput.value = g.launchId;
        if (!g.isAvailableOnDevice()) {
            ImportController.setStatus(this.epicLookupStatus, 'Launch ID for "' + g.title + '" filled in. It isn\'t installed, so it will get an Install button.');
        } else {
            ImportController.setStatus(this.epicLookupStatus, 'Launch ID for "' + g.title + '" filled in.');
        }
        this.showIfAlreadyAdded();
    }

    clearEpicLibrary() {
        this.platformLibrary.clearEpicOwned();
        this.renderEpicOwnedSelect();
        ImportController.setStatus(this.epicOwnedStatus, 'List cleared. Load catcache.bin again to rebuild it.');
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
            this.onInstalledChanged();
            ImportController.setStatus(this.battleImportStatus, 'Found ' + list.length + ' game(s): ' + list.map(g => g[1]).join(', ') + '.');
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
        this.nameInput.value = g.title;
        this.launchIdInput.value = g.launchId;
        ImportController.setStatus(this.battleLookupStatus, 'Launch ID ' + g.launchId + ' for "' + g.title + '" filled in.');
        this.showIfAlreadyAdded();
    }

    clearBattleInstalled() {
        this.platformLibrary.clearInstalled('Battle.net');
        this.renderBattleSelect();
        this.onInstalledChanged();
        ImportController.setStatus(this.battleImportStatus, 'List cleared. Load product.db again to rebuild it.');
    }

    // ---- "All Battle.net games" search: a game was picked ----
    pickBattleSearchResult(g) {
        this.nameInput.value = g.name;
        this.launchIdInput.value = g.id;
        const installed = PlatformLibrary.isInstalled('Battle.net', g.id);
        let note = '';
        if (installed === false) note = ' It isn\'t installed, so it will get an Install button.';
        else if (installed === null) note = ' Load your installed Battle.net games above to check whether it\'s installed.';
        ImportController.setStatus(this.battleLookupStatus, 'Launch ID ' + g.id + ' for "' + g.name + '" filled in.' + note);
        this.showIfAlreadyAdded();
    }
}