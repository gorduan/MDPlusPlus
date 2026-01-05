# Electron Startup Protocol

> **KRITISCH** - Diese Datei enthält die Lösung für das häufigste Problem mit der MD++ Electron App.

---

## Das Problem

Die Electron App startet, aber kein Fenster erscheint.

### Symptome

- Electron-Prozesse laufen (sichtbar in Task-Manager)
- Kein Fenster in der Taskleiste
- Eventuell kurzes schwarzes Fenster, das verschwindet
- Nur 1 statt 3-4 Electron-Prozesse

---

## Die Ursache

**package.json hat zwei Entry Points:**

```json
{
  "main": "./dist/index.js"  // ← Parser Library (NPM Package)
}
```

**Electron App Entry Point:**
```
out/main/index.js  // ← Nach electron-vite build
```

**Problem:** `npx electron .` verwendet `main` aus package.json → lädt Parser statt App!

---

## Die Lösung

### Korrekter Befehl

```bash
# RICHTIG
npm run electron:start

# ODER manuell
npx electron-vite build && node scripts/start-electron.js
```

### Falscher Befehl

```bash
# FALSCH - verwendet Parser als Entry Point
npx electron .

# FALSCH - funktioniert nicht aus VSCode/Claude Code wegen ELECTRON_RUN_AS_NODE
npx electron out/main/index.js
```

---

## ELECTRON_RUN_AS_NODE Problem

### Das Problem

Wenn `ELECTRON_RUN_AS_NODE=1` gesetzt ist (z.B. durch VSCode oder Claude Code), verhält sich Electron wie ein normaler Node.js-Prozess. Dann liefert `require("electron")` nur den Pfad zur `electron.exe` statt der Electron API.

### Symptome

- `electron.app` ist `undefined`
- `TypeError: Cannot read properties of undefined (reading 'disableHardwareAcceleration')`
- `require("electron")` gibt einen String-Pfad zurück statt ein Objekt

### Lösung

Der Start-Script `scripts/start-electron.js` entfernt die Umgebungsvariable automatisch:

```javascript
// WICHTIG: Vor dem Electron-Start
delete process.env.ELECTRON_RUN_AS_NODE;
```

---

## GPU Crashes auf Windows

Falls GPU-Fehler auftreten (`GPU process exited unexpectedly`):

```typescript
// app/electron/main.ts - Bereits implementiert!
import { app } from 'electron';

app.disableHardwareAcceleration();
```

---

## Diagnose

```powershell
# Prozesse prüfen
Get-Process electron | Select-Object Id, MainWindowTitle | Format-Table

# Erwartetes Ergebnis:
#    Id MainWindowTitle
#    -- ---------------
# 12345 MD++ Editor      ← Fenster sichtbar
# 12346                  ← GPU Process
# 12347                  ← Renderer Process
```

**Nur 1 Prozess ohne Titel?** → App crasht, falscher Entry Point oder GPU-Problem.

---

## Checkliste bei Problemen

- [ ] `npm run electron:start` verwendet (nicht `npx electron .`)
- [ ] `app.disableHardwareAcceleration()` in main.ts vorhanden
- [ ] `out/main/index.js` existiert (nach Build)
- [ ] Keine anderen Electron-Instanzen blockieren

---

## Referenz

- **Gelöst am:** 2026-01-01
- **Betroffene Dateien:** `app/electron/main.ts`, `package.json`
- **Ursprüngliches Problem:** Stundenlange Debug-Session wegen falschem Entry Point
