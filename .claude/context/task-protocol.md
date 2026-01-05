# Task Completion Protocol

> Nach **jeder signifikanten Aufgabe** (Features, Fixes, Refactorings) dieses Protokoll befolgen.

---

## Nach Abschluss einer Aufgabe

### 1. Dokumentation prüfen

- [ ] Neue Erkenntnisse in `.claude/context/` dokumentiert?
- [ ] Troubleshooting-Docs aktualisiert falls nötig?
- [ ] README.md noch aktuell?

### 2. Re-Entry Point erstellen

Falls die Aufgabe komplex war oder unterbrochen wurde:

**Option A:** Start-Guide erstellen
```
docs/[FEATURE]_START_GUIDE.md
```

**Option B:** Nächsten Schritt dokumentieren
```markdown
## Nächster Schritt
- Was wurde gemacht
- Was ist der nächste Schritt
- Relevante Dateien
```

### 3. Git Commit

```bash
# Feature Commit
git add [geänderte-dateien]
git commit -m "feat(scope): Kurze Beschreibung

- Detaillierte Änderung 1
- Detaillierte Änderung 2

🤖 Generated with Claude Code"

# Dokumentations-Commit (falls separat)
git add docs/ .claude/
git commit -m "docs: Update documentation for [feature]"
```

---

## Wann anwenden

- [x] Nach jedem Feature/Fix/Refactoring
- [x] Am Ende einer Arbeitssession (auch wenn unvollständig)
- [x] Vor Wechsel zu anderem Feature
- [ ] NICHT für Mini-Fixes (<30min, einzelne Datei)

---

## /compact Mode Protocol

### VOR dem Fortfahren nach /compact

1. **Lies `.claude/CLAUDE.md`** - Kritische Patterns auffrischen
2. **Prüfe aktuelle Arbeit** - Was wurde zuletzt gemacht?
3. **Suche Re-Entry Point** - `docs/[FEATURE]_START_GUIDE.md`

### VOR dem Auslösen von /compact

- [ ] Aktuelle Arbeit dokumentiert
- [ ] Änderungen committed oder gestashed
- [ ] Re-Entry Point existiert
- [ ] Nächster Schritt klar beschrieben

---

## User Summary Template

Nach Abschluss einer Aufgabe:

```markdown
## Zusammenfassung

| Was | Beschreibung |
|-----|--------------|
| Aufgabe | [Was wurde gemacht] |
| Dateien | `file1.ts`, `file2.ts` |
| Status | ✅ Abgeschlossen |

## Dokumentation aktualisiert
- `.claude/context/[file].md`
- `docs/[file].md`

## Nächste Session
[Copy-paste Prompt für nächste Session]
```
