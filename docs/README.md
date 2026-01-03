# Dokumentations-Governance

> **PFLICHTLEKTÜRE** für alle Subagents und Claude Code Sessions.

---

## Ordnerstruktur

```
docs/
├── README.md                    # Diese Datei (Governance)
├── troubleshooting/             # Problemlösungen
│   └── electron-startup.md      # Electron Startup Probleme
├── guides/                      # Entwickler-Anleitungen
└── archive/                     # Abgeschlossene Dokumente
```

---

## Regeln

### Regel 1: Korrekte Ordnerzuweisung

| Dokumenttyp | Zielordner | Beispiel |
|-------------|------------|----------|
| Troubleshooting | `troubleshooting/` | electron-startup.md |
| Entwickler-Guides | `guides/` | DEVELOPMENT.md |
| Archivierte Docs | `archive/` | Nach Abschluss |

### Regel 2: Core Files (Root of docs/)

**NUR diese gehören direkt in `docs/`:**
- `README.md` - Diese Governance-Datei

**Alles andere muss in einen Unterordner.**

### Regel 3: Namenskonventionen

```
TROUBLESHOOTING:  lowercase-with-hyphens.md
GUIDES:           UPPERCASE_NAME.md
```

---

## Archivierungsregeln

| Trigger | Zielordner |
|---------|------------|
| Problem dauerhaft gelöst | `archive/` |
| Guide veraltet | `archive/` |

---

## Qualitäts-Checkliste

Vor dem Committen neuer Dokumentation:

- [ ] Im richtigen Ordner?
- [ ] Namenskonvention befolgt?
- [ ] Links funktionieren?
- [ ] In `.claude/CLAUDE.md` referenziert?
