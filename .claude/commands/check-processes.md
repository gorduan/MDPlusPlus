# Electron Prozesse prüfen (Windows)

```powershell
Get-Process electron -ErrorAction SilentlyContinue | Select-Object Id, MainWindowTitle | Format-Table -AutoSize
```

## Erwartetes Ergebnis

```
   Id MainWindowTitle
   -- ---------------
12345 MD++ Editor      ← Hauptfenster
12346                  ← GPU Process
12347                  ← Renderer Process
```

## Probleme erkennen

| Symptom | Bedeutung |
|---------|-----------|
| Nur 1 Prozess | App crasht sofort |
| Kein MainWindowTitle | Fenster nicht erstellt |
| Viele Prozesse ohne Titel | Mehrere VS Code Instanzen (ignorieren) |

## Prozesse mit Pfad anzeigen

```powershell
Get-Process electron | Select-Object Id, MainWindowTitle, Path | Format-Table -AutoSize
```

Filtert VS Code heraus (Path enthält "MDPlusPlus").
