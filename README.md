# 🎯 DART Store // Servidor y Catálogo de Juegos

Repositorio oficial y red de distribución (CDN) de videojuegos para la consola portátil **DART** (ESP32-S3 con pantalla monocroma Sharp Memory LCD 400x240, 1-bit).

- 🌐 **Web Vitrina:** [https://daniih03.github.io/dart-store/](https://daniih03.github.io/dart-store/)
- 📡 **Endpoint del Catálogo:** [https://daniih03.github.io/dart-store/catalog.json](https://daniih03.github.io/dart-store/catalog.json)

---

## 🏗️ 1. Arquitectura de Distribución

A diferencia de una base de datos cloud tradicional con suscripciones y riesgos de suspensión por inactividad, **DART Store** opera enteramente sobre **GitHub Pages y GitHub Actions**:

1. **100% Permanente y Gratuito:** Sin cortes ni costes de servidor.
2. **Ultraeficiente para ESP32-S3:** Peticiones estándar `HTTP GET` estáticas sin cabeceras complejas de autenticación.
3. **Streaming Directo a MicroSD:** La consola lee el binario por chunks (1-2 KB) y lo escribe directamente en `/sd/games/{id}.cmd` sin consumir la memoria RAM del microcontrolador.

---

## 📂 2. Estructura del Repositorio

```text
dart-store/
├── games/
│   ├── space_shooter/
│   │   ├── info.json          # Metadatos del videojuego
│   │   ├── cover.bin          # Carátula 1-bit (48x48 px, 288 bytes)
│   │   └── game.cmd           # Binario o paquete ejecutable
│   ├── micro_racer/
│   │   ├── info.json
│   │   ├── cover.bin
│   │   └── game.cmd
│   ├── dungeon_crawl/
│   │   ├── info.json
│   │   ├── cover.bin
│   │   └── game.cmd
│   └── brick_breaker/
│       ├── info.json
│       ├── cover.bin
│       └── game.cmd
├── scripts/
│   ├── build_catalog.js       # Compilador que genera catalog.json
│   └── generate_assets.js     # Generador de carátulas y paquetes demo
├── .github/workflows/
│   └── deploy_store.yml       # GitHub Action que compila y despliega a Pages
├── catalog.json               # Catálogo maestro compilado
├── index.html                 # Vitrina web pública con visor 1-bit en canvas
└── README.md                  # Este documento
```

---

## 🎮 3. Cómo Añadir un Nuevo Videojuego

Como desarrollador, añadir un nuevo título a la tienda solo requiere **un commit de Git**:

### Paso 1: Crear la carpeta del juego
Crea una carpeta dentro de `games/` con el identificador en minúsculas y sin espacios (ej: `games/mi_juego/`).

### Paso 2: Crear `info.json`
```json
{
  "id": "mi_juego",
  "title": "MI JUEGO RETRO",
  "author": "DANIIH",
  "version": "1.0.0",
  "category": "ARCADE",
  "size_kb": 32,
  "description": "Una breve descripcion de tu juego para la ficha tecnica de la consola.",
  "binary_file": "game.cmd",
  "cover_file": "cover.bin"
}
```

### Paso 3: Añadir la Carátula `cover.bin`
- **Dimensiones:** Exactamente **48x48 píxeles**.
- **Profundidad de color:** **1-bit monocromo** (1 bit por píxel: 0 = blanco / claro, 1 = negro / oscuro).
- **Tamaño de archivo exacto:** \( \frac{48 \times 48}{8} = 288 \text{ bytes} \).
- **Formato:** Fila por fila, MSB first (bit 7 es el píxel más a la izquierda del byte).

### Paso 4: Añadir el Binario `game.cmd`
Copia el archivo compilado o empaquetado del juego (`game.cmd`).

### Paso 5: Compilar y Subir
```bash
node scripts/build_catalog.js
git add .
git commit -m "feat: add new game mi_juego"
git push origin main
```
La **GitHub Action** compilará el catálogo, verificará los archivos y actualizará GitHub Pages en menos de 1 minuto. La consola DART detectará el nuevo título de inmediato la próxima vez que el usuario abra la Tienda.

---

## 🕹️ 4. Descarga desde la Consola DART

1. Enciende tu consola DART y asegúrate de estar conectado a Wi-Fi desde **Ajustes**.
2. En el Menú Home, pulsa **`[MENU]`** para desplegar el **System Drawer**.
3. Selecciona **`TIENDA`** y pulsa **`(A)`**.
4. Navega con la cruceta `[^ v]` para inspeccionar carátulas y detalles.
5. Pulsa **`(A)`** para descargar el juego por streaming hacia la tarjeta MicroSD.
