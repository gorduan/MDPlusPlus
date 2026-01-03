# Claude Code Context - MD++

**PFLICHT:** Lies `.claude/CLAUDE.md` bevor du mit der Arbeit beginnst.

## Wann zu lesen

- Bei Sessionstart
- Nach `/compact`
- Vor Implementierung neuer Features
- Bei Electron-App Problemen

## Inhalt von `.claude/CLAUDE.md`

- Projektübersicht & Architektur
- Kritische Befehle
- **ELECTRON STARTUP PROTOCOL (KRITISCH)**
- Code-Patterns & Don'ts
- Dokumentations-Index
- Task Completion Protocol

## Quick Reference

```bash
# Parser bauen
npm run build

# Electron App starten (WICHTIG: nicht "npx electron .")
npm run electron:start

# Tests
npm run test
```

## Bekannte Fallstricke

1. **Electron startet nicht?** → Siehe `.claude/context/electron-startup.md` oder `docs/troubleshooting/electron-startup.md`
2. **GPU Crashes?** → `app.disableHardwareAcceleration()` ist bereits aktiv
3. **Falscher Entry Point?** → `npm run electron:start` verwenden, NICHT `npx electron .`
