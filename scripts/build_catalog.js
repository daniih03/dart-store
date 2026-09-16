const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAMES_DIR = path.join(ROOT_DIR, 'games');
const OUTPUT_CATALOG = path.join(ROOT_DIR, 'catalog.json');

console.log('== DART STORE CATALOG BUILDER ==');

if (!fs.existsSync(GAMES_DIR)) {
    console.error('Error: games directory does not exist!');
    process.exit(1);
}

const entries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
const gamesList = [];

for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const gameId = entry.name;
    const gamePath = path.join(GAMES_DIR, gameId);
    const infoPath = path.join(gamePath, 'info.json');
    const coverPath = path.join(gamePath, 'cover.bin');
    const binaryPath = path.join(gamePath, 'game.cmd');

    if (!fs.existsSync(infoPath)) {
        console.warn(`[WARN] Skipping ${gameId}: missing info.json`);
        continue;
    }

    try {
        const infoRaw = fs.readFileSync(infoPath, 'utf8');
        const info = JSON.parse(infoRaw);

        // Required fields validation
        const required = ['id', 'title', 'author', 'version', 'category', 'size_kb', 'description'];
        for (const req of required) {
            if (!info[req]) {
                throw new Error(`Missing required field '${req}' in ${infoPath}`);
            }
        }

        // File checks
        const hasCover = fs.existsSync(coverPath);
        const hasBinary = fs.existsSync(binaryPath);

        if (!hasCover) {
            console.warn(`[WARN] ${gameId} has no cover.bin`);
        }
        if (!hasBinary) {
            console.warn(`[WARN] ${gameId} has no game.cmd`);
        }

        // Get actual binary file size if present
        let actualSizeKb = info.size_kb;
        if (hasBinary) {
            const stat = fs.statSync(binaryPath);
            actualSizeKb = Math.round(stat.size / 1024);
        }

        const gameEntry = {
            id: info.id,
            title: info.title,
            author: info.author,
            version: info.version,
            category: info.category,
            size_kb: actualSizeKb,
            description: info.description,
            binary_url: `games/${info.id}/game.cmd`,
            cover_url: `games/${info.id}/cover.bin`
        };

        gamesList.push(gameEntry);
        console.log(`[OK] Added: ${info.title} (${info.version}) - ${info.category} - ${actualSizeKb} KB`);
    } catch (err) {
        console.error(`[ERROR] Failed to process ${gameId}:`, err.message);
        process.exit(1);
    }
}

const catalog = {
    version: 1,
    updated_at: new Date().toISOString(),
    games_count: gamesList.length,
    games: gamesList
};

fs.writeFileSync(OUTPUT_CATALOG, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`\nCatalog compiled successfully: ${OUTPUT_CATALOG}`);
console.log(`Total games in store: ${catalog.games_count}`);
