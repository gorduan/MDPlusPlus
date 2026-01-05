# MD++ - Claude Code Context

> **Single Source of Truth** - Lies diese Datei bei jedem Sessionstart.

---

## Quick Reference - Befehle

```bash
# Parser Library
npm run build              # Parser + Components bauen
npm run test               # Tests ausführen
npm run typecheck          # TypeScript prüfen

# Electron Desktop App
npm run electron:start     # Baut und startet die App (EMPFOHLEN)
npm run electron:dev       # Dev-Modus mit Hot-Reload
npm run electron:build     # Erstellt installierbare Pakete

# Cleanup
npm run clean              # Löscht dist/ und out/
```

---

## Projektübersicht

**MD++ (Markdown Plus Plus)** ist ein erweiterter Markdown-Parser mit:
- AI Context Blocks (`:::ai-context`)
- Framework-agnostische Component Directives
- Standalone Electron Desktop Editor
- Embeddable React Components

### Tech Stack

| Komponente | Technologie |
|------------|-------------|
| Parser | TypeScript, unified/remark/rehype |
| Editor | Monaco Editor |
| Desktop App | Electron 28 + electron-vite |
| UI Framework | React 18 |
| Build | tsup (Parser), electron-vite (App) |

---

## Projektstruktur

```
MDPlusPlus/
├── src/                    # Parser Quellcode
│   ├── index.ts           # Parser Entry Point
│   └── plugins/           # Remark/Rehype Plugins
├── components/            # React Components (Editor, Preview)
├── app/
│   ├── electron/          # Electron Main Process
│   │   ├── main.ts        # WICHTIG: Electron Entry Point
│   │   └── preload.ts     # Preload Script
│   └── renderer/          # React Renderer (UI)
│       └── src/
│           └── components/ # App-spezifische Components
├── plugins/               # Plugin Definitionen (JSON)
├── dist/                  # Gebaute Parser Library
├── out/                   # Gebaute Electron App
│   ├── main/             # → Entry: out/main/index.js
│   ├── preload/
│   └── renderer/
├── docs/                  # Dokumentation
└── .claude/               # Claude Code Context
```

---

## KRITISCH: Entry Points

| Zweck | Entry Point | package.json main |
|-------|-------------|-------------------|
| NPM Package (Parser) | `./dist/index.js` | ✅ Ja |
| Electron App | `./out/main/index.js` | ❌ Nein |

**WICHTIG:** `npx electron .` verwendet package.json `main` → startet Parser, nicht App!

→ Siehe [.claude/context/electron-startup.md](context/electron-startup.md)

---

## Kritische Regeln

### 1. Electron App starten

```bash
# RICHTIG
npm run electron:start
npx electron out/main/index.js

# FALSCH - startet Parser statt App!
npx electron .
```

### 2. GPU auf Windows

`app.disableHardwareAcceleration()` ist bereits in `app/electron/main.ts` aktiv.

### 3. Parser vs. App

- Parser-Änderungen: `src/` → `npm run build`
- App-Änderungen: `app/` → `npm run electron:start`

---

## Context Files

| Datei | Inhalt |
|-------|--------|
| [context/electron-startup.md](context/electron-startup.md) | Electron Startup Troubleshooting |
| [context/code-patterns.md](context/code-patterns.md) | Code Patterns & Don'ts |
| [context/task-protocol.md](context/task-protocol.md) | Task Completion Protocol |

---

## Dokumentations-Index

| Dokument | Pfad | Beschreibung |
|----------|------|--------------|
| Troubleshooting | `docs/troubleshooting/electron-startup.md` | Electron Startup Probleme |
| Docs Governance | `docs/README.md` | Dokumentations-Regeln |
| README | `README.md` | Projekt-Dokumentation |

---

## Task Completion Protocol

Nach **jeder signifikanten Aufgabe**:

1. **Dokumentation aktualisieren** - Falls neue Erkenntnisse
2. **Context-Dateien ergänzen** - Bei neuen Patterns/Problemen
3. **Git Commit** - Mit aussagekräftiger Message

---

## Don'ts

1. **NIEMALS** `npx electron .` für die Desktop-App verwenden
2. **NIEMALS** GPU-relevanten Code ohne `disableHardwareAcceleration` testen
3. **NIEMALS** Secrets in Code committen
4. **NIEMALS** `.env` Dateien bearbeiten ohne Backup

---

## Diagnose-Befehle

```powershell
# Electron-Prozesse prüfen (Windows)
Get-Process electron | Select-Object Id, MainWindowTitle | Format-Table

# Erwartetes Ergebnis bei laufender App:
# - 3-4 Prozesse
# - Einer mit MainWindowTitle "MD++ Editor"
```
