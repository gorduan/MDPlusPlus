# MD++ Test Suite - Manueller Test Index

> Dieses Dokument listet alle Test-Dateien und deren erwartete Ergebnisse auf.
> Markiere Tests als PASS/FAIL und notiere Probleme.

---

## Test-Übersicht

| Test-Datei | Kategorie | Status | Probleme |
|------------|-----------|--------|----------|
| [01-markdown-basics.md](01-markdown-basics.md) | Kern-Markdown | [ ] | |
| [02-gfm-features.md](02-gfm-features.md) | GitHub Flavored MD | [ ] | |
| [03-admonitions-plugin.md](03-admonitions-plugin.md) | Plugin: Admonitions | [ ] | |
| [04-bootstrap-plugin.md](04-bootstrap-plugin.md) | Plugin: Bootstrap | [ ] | |
| [05-ai-context.md](05-ai-context.md) | AI Context Blocks | [ ] | |
| [06-math-katex.md](06-math-katex.md) | Mathematik/KaTeX | [ ] | |
| [07-mermaid-diagrams.md](07-mermaid-diagrams.md) | Mermaid Diagramme | [ ] | |
| [08-code-blocks.md](08-code-blocks.md) | Code-Blöcke | [ ] | |
| [09-mixed-content.md](09-mixed-content.md) | Gemischte Inhalte | [ ] | |
| [10-edge-cases.md](10-edge-cases.md) | Grenzfälle | [ ] | |
| [11-scripts.mdsc](11-scripts.mdsc) | MarkdownScript | [ ] | |

---

## Legende

- `[x]` = PASS - Funktioniert wie erwartet
- `[ ]` = Nicht getestet
- `[!]` = FAIL - Problem gefunden
- `[~]` = Teilweise - Einige Tests fehlgeschlagen

---

## Kritische Dateien zum Bearbeiten

### Parser (src/)
| Datei | Verantwortlich für | Letzte Änderung |
|-------|-------------------|-----------------|
| `src/parser.ts` | Haupt-Parser, Directives, Callouts | closeCalloutBlocks Fix |
| `src/index.ts` | Export, MDPlusPlus Klasse | |
| `src/types.ts` | TypeScript Typen | |

### Plugins (plugins/)
| Datei | Verantwortlich für |
|-------|-------------------|
| `plugins/admonitions.json` | Note, Tip, Warning, Danger, etc. |
| `plugins/bootstrap.json` | Alert, Card, Badge, Container, etc. |

### Renderer (app/renderer/src/)
| Datei | Verantwortlich für |
|-------|-------------------|
| `app/renderer/src/components/Preview.tsx` | HTML-Vorschau |
| `app/renderer/src/styles/global.css` | Alle CSS-Styles |

### Electron (app/electron/)
| Datei | Verantwortlich für |
|-------|-------------------|
| `app/electron/main.ts` | Haupt-Prozess, IPC |
| `app/electron/preload.ts` | IPC Bridge |

---

## Test-Protokoll

### Datum: ____.____.____

**Tester:** ________________

**Version:** ________________

#### Zusammenfassung:
- Tests bestanden: ____ / 11
- Tests fehlgeschlagen: ____
- Kritische Fehler: ____

#### Notizen:
```
(Hier Notizen eintragen)
```

---

## Bekannte Probleme

| ID | Beschreibung | Datei | Status |
|----|--------------|-------|--------|
| #1 | | | |
| #2 | | | |
| #3 | | | |

---

## Anleitung

1. Öffne jede Test-Datei in MD++ Editor
2. Vergleiche Editor (Source) mit Preview
3. Prüfe alle markierten Erwartungen
4. Markiere Status in der Tabelle oben
5. Dokumentiere Probleme im "Bekannte Probleme" Abschnitt
