# Build Commands

## Parser Library

```bash
npm run build
```

Baut: `dist/index.js`, `dist/components/`

## Electron App

```bash
npm run electron:start    # Build + Start
npm run electron:build    # Build + Installer erstellen
```

Baut: `out/main/`, `out/preload/`, `out/renderer/`

## Cleanup

```bash
npm run clean
```

Löscht: `dist/`, `out/`
