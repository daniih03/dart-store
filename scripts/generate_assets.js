const fs = require('fs');
const path = require('path');

const games = [
    {
        id: "space_shooter",
        info: {
            id: "space_shooter",
            title: "SPACE SHOOTER",
            author: "DANIIH",
            version: "1.0.2",
            category: "ARCADE",
            size_kb: 42,
            description: "Defiende la galaxia contra oleadas enemigas con disparos laser continuos y jefes de sector.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            // Ship
            ctx.line(24, 10, 14, 34);
            ctx.line(24, 10, 34, 34);
            ctx.line(14, 34, 34, 34);
            ctx.fillRect(21, 20, 7, 10);
            // Stars
            ctx.setPixel(8, 8);
            ctx.setPixel(38, 12);
            ctx.setPixel(10, 38);
            ctx.setPixel(36, 40);
        }
    },
    {
        id: "micro_racer",
        info: {
            id: "micro_racer",
            title: "MICRO RACER",
            author: "RETROLAB",
            version: "1.1.0",
            category: "CARRERAS",
            size_kb: 38,
            description: "Carreras cenitales en circuitos urbanos con curvas cerradas, turbos y derrapes al limite.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            // Car body
            ctx.fillRect(16, 10, 16, 28);
            // Windows
            ctx.clearArea(19, 16, 10, 8);
            ctx.clearArea(19, 27, 10, 6);
            // Wheels
            ctx.fillRect(13, 12, 3, 7);
            ctx.fillRect(32, 12, 3, 7);
            ctx.fillRect(13, 30, 3, 7);
            ctx.fillRect(32, 30, 3, 7);
        }
    },
    {
        id: "dungeon_crawl",
        info: {
            id: "dungeon_crawl",
            title: "DUNGEON CRAWL",
            author: "NIBBLE_DEV",
            version: "0.9.5",
            category: "RPG",
            size_kb: 64,
            description: "Explora mazmorras 1-bit procedurales, encuentra cofres misticos y derrota al nigromante oscuro.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            // Sword
            ctx.line(14, 14, 34, 34);
            ctx.line(15, 14, 34, 33);
            ctx.line(19, 29, 29, 19); // guard
            ctx.fillRect(30, 30, 5, 5); // pommel
            // Shield
            ctx.drawRect(6, 6, 14, 18);
        }
    },
    {
        id: "brick_breaker",
        info: {
            id: "brick_breaker",
            title: "BRICK BREAKER",
            author: "BIT_STUDIO",
            version: "1.0.0",
            category: "ARCADE",
            size_kb: 28,
            description: "Rompe todos los bloques con tu pala y potenciadores de bola multiple, laser y escudo.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 4; c++) {
                    ctx.drawRect(6 + c * 9, 8 + r * 6, 8, 5);
                }
            }
            ctx.fillRect(14, 36, 20, 4);
            ctx.fillRect(23, 27, 4, 4);
        }
    }
];

function createCoverBitmap(drawFn) {
    // 48x48 = 2304 bits = 288 bytes
    const buf = Buffer.alloc(288, 0); // 0 = white, 1 = black

    function setPixel(x, y, v = 1) {
        if (x < 0 || x >= 48 || y < 0 || y >= 48) return;
        const byteIdx = (y * 6) + Math.floor(x / 8);
        const bitMask = 1 << (7 - (x % 8));
        if (v === 1) buf[byteIdx] |= bitMask;
        else buf[byteIdx] &= ~bitMask;
    }

    function line(x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        while (true) {
            setPixel(x0, y0);
            if (x0 === x1 && y0 === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    function fillRect(x, y, w, h) {
        for (let py = y; py < y + h; py++) {
            for (let px = x; px < x + w; px++) {
                setPixel(px, py, 1);
            }
        }
    }

    function clearArea(x, y, w, h) {
        for (let py = y; py < y + h; py++) {
            for (let px = x; px < x + w; px++) {
                setPixel(px, py, 0);
            }
        }
    }

    function drawRect(x, y, w, h) {
        for (let px = x; px < x + w; px++) {
            setPixel(px, y, 1);
            setPixel(px, y + h - 1, 1);
        }
        for (let py = y; py < y + h; py++) {
            setPixel(x, py, 1);
            setPixel(x + w - 1, py, 1);
        }
    }

    // Border
    drawRect(0, 0, 48, 48);

    drawFn({ setPixel, line, fillRect, clearArea, drawRect });
    return buf;
}

const baseDir = path.resolve(__dirname, '..');
for (const g of games) {
    const dir = path.join(baseDir, 'games', g.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // 1. info.json
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(g.info, null, 2) + '\n', 'utf8');

    // 2. cover.bin
    const coverBuf = createCoverBitmap(g.draw);
    fs.writeFileSync(path.join(dir, 'cover.bin'), coverBuf);

    // 3. game.cmd (dummy package with signature DART_PACKAGE_V1)
    const cmdHeader = Buffer.from(`DART_CMD_PACKAGE_V1:${g.id}:${g.info.version}:${Date.now()}\n`);
    const cmdData = Buffer.alloc(g.info.size_kb * 1024, 0x55);
    cmdHeader.copy(cmdData, 0);
    fs.writeFileSync(path.join(dir, 'game.cmd'), cmdData);

    console.log(`Generated assets for: ${g.id}`);
}
