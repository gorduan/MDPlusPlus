# Electron App starten

```bash
npm run electron:start
```

## Was passiert

1. `electron-vite build` - Baut Main, Preload und Renderer
2. `electron out/main/index.js` - Startet die App mit korrektem Entry Point

## Bei Problemen

Siehe: `.claude/context/electron-startup.md`
