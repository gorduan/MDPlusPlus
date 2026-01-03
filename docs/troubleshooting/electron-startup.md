# Electron App Startup Troubleshooting

## Problem: Electron-Fenster erscheint nicht / App startet nicht sichtbar

### Symptome
- Electron-Prozesse laufen (sichtbar in Task-Manager)
- Kein Fenster erscheint in der Taskleiste
- Eventuell kurzes schwarzes Fenster, das sofort verschwindet
- GPU-Fehler in der Konsole: `GPU process exited unexpectedly`

### Ursache

Das Hauptproblem war, dass `npx electron .` den falschen Entry Point verwendet.

**package.json hat zwei verschiedene Zwecke:**
1. **NPM-Paket** (Parser-Library): `"main": "./dist/index.js"`
2. **Electron-App**: Entry Point ist `out/main/index.js` (nach electron-vite build)

Wenn man `npx electron .` ausführt, sucht Electron nach dem `main`-Feld in package.json und findet die Parser-Library statt der Electron-App.

### Lösung

#### 1. Korrekter Startbefehl

```bash
# FALSCH - verwendet Parser-Library als Entry Point
npx electron .

# RICHTIG - verwendet die gebaute Electron-App
npx electron out/main/index.js

# ODER mit npm script
npm run electron:start
```

#### 2. GPU-Crashes auf Windows beheben

In `app/electron/main.ts` am Anfang hinzufügen:

```typescript
import { app } from 'electron';

// Force software rendering to fix GPU crashes on Windows
app.disableHardwareAcceleration();
```

#### 3. NPM Scripts (package.json)

```json
{
  "scripts": {
    "electron:dev": "electron-vite dev",
    "electron:start": "electron-vite build && electron out/main/index.js",
    "electron:build": "electron-vite build && electron-builder"
  }
}
```

### Diagnose-Befehle

```powershell
# Electron-Prozesse mit Fenstertitel anzeigen
Get-Process electron -ErrorAction SilentlyContinue | Select-Object Id, MainWindowTitle | Format-Table -AutoSize

# Prozesse mit Pfad anzeigen (um VS Code von der App zu unterscheiden)
Get-Process electron -ErrorAction SilentlyContinue | Select-Object Id, MainWindowTitle, Path | Format-Table -AutoSize
```

**Erwartetes Ergebnis bei funktionierender App:**
- 3-4 Electron-Prozesse
- Einer davon mit MainWindowTitle (z.B. "MD++ Editor")

**Anzeichen für Probleme:**
- Nur 1 Prozess = App crasht sofort
- Alle Prozesse ohne MainWindowTitle = Fenster wird nicht erstellt

### Wichtige Hinweise

1. **VS Code verwendet auch Electron** - Bei der Prozess-Analyse darauf achten, dass man die richtigen Prozesse prüft (Path enthält "MDPlusPlus")

2. **electron-vite dev vs. build**: Der Dev-Modus kann anders funktionieren als der Production-Build. Im Zweifel erst mit `electron:start` testen.

3. **Preload-Script**: Bei Problemen kann man das Preload-Script temporär deaktivieren um zu testen ob es die Ursache ist:
   ```typescript
   webPreferences: {
     // preload: join(__dirname, '../preload/index.mjs'),  // Disabled for testing
   }
   ```

### Referenz

- Issue gelöst am: 2026-01-01
- Betroffene Dateien:
  - `app/electron/main.ts`
  - `package.json`
  - `electron.vite.config.ts`
