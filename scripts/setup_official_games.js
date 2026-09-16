const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const gamesDir = path.join(baseDir, 'games');

// 1. Remove old games if they exist
const oldGames = ['space_shooter', 'micro_racer', 'dungeon_crawl', 'brick_breaker'];
for (const old of oldGames) {
    const oldPath = path.join(gamesDir, old);
    if (fs.existsSync(oldPath)) {
        fs.rmSync(oldPath, { recursive: true, force: true });
        console.log(`Removed old game: ${old}`);
    }
}

// 2. Define the 4 official console games
const officialGames = [
    {
        id: "tetrix",
        info: {
            id: "tetrix",
            title: "TETRIX",
            author: "DANIIH",
            version: "1.0.0",
            category: "PUZZLE",
            size_kb: 48,
            description: "Juego clasico de bloques con rotacion, ghost piece, aceleracion progresiva y combos a 60 FPS.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            // Well frame
            ctx.drawRect(8, 6, 32, 38);
            // Bottom block stack
            ctx.fillRect(10, 36, 8, 6);
            ctx.fillRect(20, 36, 18, 6);
            ctx.fillRect(10, 30, 16, 6);
            // Falling T piece
            ctx.fillRect(20, 14, 12, 4);
            ctx.fillRect(24, 18, 4, 4);
            // Ghost piece outline
            ctx.drawRect(20, 24, 12, 4);
            ctx.drawRect(24, 28, 4, 4);
        }
    },
    {
        id: "pong",
        info: {
            id: "pong",
            title: "PONG",
            author: "DANIIH",
            version: "1.0.0",
            category: "ARCADE",
            size_kb: 32,
            description: "Tenis de mesa retro 1-bit contra la CPU con aceleracion de pelota y dinamica de rebotes.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            // Court borders
            ctx.drawRect(2, 4, 44, 40);
            // Center dashed net
            for (let y = 6; y < 42; y += 4) {
                ctx.line(24, y, 24, y + 2);
            }
            // Left paddle (Player)
            ctx.fillRect(6, 16, 3, 16);
            // Right paddle (CPU)
            ctx.fillRect(39, 12, 3, 16);
            // Ball & motion trail
            ctx.fillRect(28, 22, 4, 4);
            ctx.setPixel(25, 23);
            ctx.setPixel(22, 24);
        }
    },
    {
        id: "table_tennis",
        info: {
            id: "table_tennis",
            title: "TABLE TENNIS",
            author: "DANIIH",
            version: "1.0.0",
            category: "DEPORTE",
            size_kb: 72,
            description: "Tenis de mesa 2.5D pseudo-3D bajo normativa oficial ITTF, tiros Drive/Slice y efectos de red.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            // Perspective table (trapezoid)
            ctx.line(12, 12, 36, 12); // top edge
            ctx.line(6, 36, 42, 36);  // bottom edge
            ctx.line(12, 12, 6, 36);  // left edge
            ctx.line(36, 12, 42, 36); // right edge
            // Center line
            ctx.line(24, 12, 24, 36);
            // Net
            ctx.line(9, 24, 39, 24);
            ctx.line(9, 22, 39, 22);
            // Paddle
            ctx.fillCircle(32, 38, 4);
            ctx.fillRect(31, 41, 2, 4);
            // Ball and height shadow
            ctx.fillCircle(18, 18, 2);
            ctx.setPixel(18, 26); // shadow
            ctx.line(18, 21, 18, 25); // height ray
        }
    },
    {
        id: "zombies",
        info: {
            id: "zombies",
            title: "ZOMBIES",
            author: "DANIIH",
            version: "1.0.0",
            category: "SURVIVAL",
            size_kb: 85,
            description: "Supervivencia por rondas, barricadas, apuntado en 8 direcciones y oleadas crecientes de zombies.",
            binary_file: "game.cmd",
            cover_file: "cover.bin"
        },
        draw: (ctx) => {
            // Military Helmet
            ctx.fillCircle(24, 16, 12);
            ctx.fillRect(10, 16, 28, 5);
            // Skull / Face
            ctx.fillRect(14, 21, 20, 16);
            // Eye sockets (clear)
            ctx.clearArea(17, 24, 4, 4);
            ctx.clearArea(27, 24, 4, 4);
            // Nose cavity
            ctx.clearArea(23, 29, 2, 3);
            // Teeth
            ctx.fillRect(16, 37, 16, 5);
            ctx.clearArea(19, 39, 2, 3);
            ctx.clearArea(23, 39, 2, 3);
            ctx.clearArea(27, 39, 2, 3);
            // Crosshairs
            ctx.line(4, 24, 8, 24);
            ctx.line(40, 24, 44, 24);
            ctx.line(24, 4, 24, 8);
            ctx.line(24, 40, 24, 44);
        }
    }
];

function createCoverBitmap(drawFn) {
    const buf = Buffer.alloc(288, 0); // 48x48 = 288 bytes

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

    function fillCircle(xm, ym, r) {
        for (let y = -r; y <= r; y++) {
            for (let x = -r; x <= r; x++) {
                if (x * x + y * y <= r * r) {
                    setPixel(xm + x, ym + y, 1);
                }
            }
        }
    }

    // Outer border
    drawRect(0, 0, 48, 48);

    drawFn({ setPixel, line, fillRect, clearArea, drawRect, fillCircle });
    return buf;
}

for (const g of officialGames) {
    const dir = path.join(gamesDir, g.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // info.json
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(g.info, null, 2) + '\n', 'utf8');

    // cover.bin
    const coverBuf = createCoverBitmap(g.draw);
    fs.writeFileSync(path.join(dir, 'cover.bin'), coverBuf);

    // game.cmd
    const cmdHeader = Buffer.from(`DART_CMD_PACKAGE_V1:${g.id}:${g.info.version}:${Date.now()}\n`);
    const cmdData = Buffer.alloc(g.info.size_kb * 1024, 0x55);
    cmdHeader.copy(cmdData, 0);
    fs.writeFileSync(path.join(dir, 'game.cmd'), cmdData);

    console.log(`Generated official game assets: ${g.id}`);
}
