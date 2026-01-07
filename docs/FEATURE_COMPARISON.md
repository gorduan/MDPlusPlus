# MD++ Feature-Vergleich: Ursprüngliche Ideen vs. Umsetzung

> **Erstellt**: 2025-01-05
> **Zweck**: Dokumentation aller Features aus dem ursprünglichen `E:\Claude Projekte\md++` Projekt und deren Umsetzungsstatus in MDPlusPlus.

---

## Übersicht

Das ursprüngliche md++ Projekt war ein **Planungsdokument** mit umfangreichen Spezifikationen. Dieses Dokument vergleicht die geplanten Features mit der aktuellen Implementierung.

---

## Phase 1: Core Framework

### Parser & Core

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| unified/remark Integration | ✅ | ✅ | **FERTIG** | Vollständig implementiert |
| remark-directive (:::) | ✅ | ✅ | **FERTIG** | Container-Syntax funktioniert |
| remark-attr {.class #id} | ✅ | ✅ | **FERTIG** | Via hastscript + remark-directive v4 |
| gray-matter (Frontmatter) | ✅ | ✅ | **FERTIG** | YAML-Frontmatter wird geparsed |
| remark-rehype (HTML) | ✅ | ✅ | **FERTIG** | Markdown→HTML funktioniert |

### Plugin-System

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| JSON-basierte Plugins | ✅ | ✅ | **FERTIG** | `plugins/*.json` |
| Framework-Präfix `:::framework:component` | ✅ | ⚠️ | **TEILWEISE** | Admonitions ohne Präfix, Bootstrap mit |
| Plugin-Loader | ✅ | ✅ | **FERTIG** | Lädt JSON-Definitionen |
| Plugin-Konflikt-Erkennung | ✅ | ✅ | **FERTIG** | `detectPluginConflicts()` Methode |
| Benutzerdefinierte Plugins | ✅ | ✅ | **FERTIG** | JSON-Format unterstützt |

### Beispiel-Plugins

| Plugin | Geplant | Umgesetzt | Status | Anmerkungen |
|--------|---------|-----------|--------|-------------|
| Bootstrap (Card, Alert, etc.) | ✅ | ✅ | **FERTIG** | `plugins/bootstrap.json` |
| Admonitions (Note, Tip, Warning) | ✅ | ✅ | **FERTIG** | `plugins/admonitions.json` |
| Tailwind CSS | ✅ | ✅ | **FERTIG** | `plugins/tailwind.json` |
| Material Icons | ✅ | ✅ | **FERTIG** | `![icon](google:home)` Syntax implementiert |

---

## Phase 2: Desktop Reader (Electron App)

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| Electron-App | ✅ | ✅ | **FERTIG** | Voll funktionsfähig |
| Datei öffnen (Doppelklick) | ✅ | ✅ | **FERTIG** | .md Assoziation möglich |
| HTML/Markdown Toggle | ✅ | ✅ | **FERTIG** | Source/Preview Ansichten |
| Menüleiste | ✅ | ✅ | **FERTIG** | Datei, Ansicht, etc. |
| Theme Hell/Dunkel | ✅ | ✅ | **FERTIG** | Toggle in Toolbar |
| Live-Reload bei Änderungen | ✅ | ✅ | **FERTIG** | Live-Vorschau |
| Einstellungen UI | ✅ | ⚠️ | **TEILWEISE** | Basis-Einstellungen |
| Windows Build (.exe) | ✅ | ⚠️ | **MÖGLICH** | Via electron-builder |
| macOS Build (.dmg) | ✅ | ⚠️ | **MÖGLICH** | Via electron-builder |
| Linux Build (.AppImage) | ✅ | ⚠️ | **MÖGLICH** | Via electron-builder |

---

## Erweiterte Features

### AI-Blöcke

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| `:::ai-context[hidden]` | ✅ | ✅ | **FERTIG** | Versteckter AI-Kontext |
| `:::ai-context[visible]` | ✅ | ✅ | **FERTIG** | Sichtbare Alert-Box |
| `:::ai-context[html-hidden]` | ✅ | ✅ | **FERTIG** | Komplett aus HTML entfernt, nur in aiContexts |
| Globale Überschreibung | ✅ | ❌ | **OFFEN** | `force_mode` in Settings |
| Ctrl+Shift+A Toggle | ✅ | ✅ | **FERTIG** | AI-Kontext ein/ausblenden |

### Code-Blöcke

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| Standard Code-Highlighting | ✅ | ✅ | **FERTIG** | highlight.js Integration |
| `:::parser-code-js` | ✅ | ❌ | **OFFEN** | Code zur Parse-Zeit |
| `:::html-script-js` | ✅ | ❌ | **OFFEN** | Script-Einbettung |
| Prism.js | ✅ | ❌ | **OFFEN** | Stattdessen highlight.js |

### MarkdownScript (.mdsc)

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| `:::script` Blöcke | ❌ (Neu) | ✅ | **FERTIG** | Script-Ausführung |
| `:::input` Bindung | ❌ (Neu) | ✅ | **FERTIG** | Reaktive Inputs |
| `:::slider` | ❌ (Neu) | ✅ | **FERTIG** | Slider-Komponente |
| `:::output` | ❌ (Neu) | ✅ | **FERTIG** | Script-Ausgabe |
| Sicherheitsdialog | ❌ (Neu) | ✅ | **FERTIG** | ScriptSecurityDialog |
| .mdsc Dateiendung | ❌ (Neu) | ✅ | **FERTIG** | Scripts nur in .mdsc |

### Diagramme & Visualisierung

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| Mermaid Diagramme | ✅ | ✅ | **FERTIG** | Vollständig integriert |
| Kroki API | ✅ | ✅ | **FERTIG** | 30+ Diagrammtypen (plantuml, graphviz, d2, etc.) |
| MathJax | ✅ | ⚠️ | **ANDERS** | KaTeX statt MathJax |
| Reveal.js Slides | ✅ | ✅ | **FERTIG** | Präsentationsmodus mit parseSlides() |

### CSS-Blöcke

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| `:::style` (Inline CSS) | ✅ | ✅ | **FERTIG** | `remarkStyleBlock` Plugin |
| `:::link-css` (Externe CSS) | ✅ | ✅ | **FERTIG** | `remarkStyleBlock` Plugin |

---

## Sicherheitssystem

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| Sicherheits-Profile | ✅ | ✅ | **FERTIG** | strict, warn, expert, custom |
| YAML-Konfiguration | ✅ | ✅ | **FERTIG** | `parseSecurityConfig()` in security-config.ts |
| Whitelist/Blacklist | ✅ | ✅ | **FERTIG** | trustedSources, blockedSources |
| Code-Ausführungs-Gate | ✅ | ✅ | **FERTIG** | Für MarkdownScript |
| Error-Handling im HTML | ✅ | ✅ | **FERTIG** | Alert-Boxen bei Fehlern |
| Event-Handler-Filter | ✅ | ✅ | **FERTIG** | onclick, onerror etc. werden blockiert |
| Checkbox-Matrix UI | ✅ | ❌ | **OFFEN** | Detaillierte Settings fehlen |

---

## Phase 3: MCP Integration

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| MCP-Server | ✅ | ❌ | **OFFEN** | Nicht implementiert |
| `create_markdown_document` Tool | ✅ | ❌ | **OFFEN** | - |
| `convert_to_html` Tool | ✅ | ❌ | **OFFEN** | - |
| Token-Optimierung | ✅ | ❌ | **OFFEN** | - |
| Claude Desktop Integration | ✅ | ❌ | **OFFEN** | - |

---

## Phase 3.5: Web & API Integration

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| CDN-Script | ✅ | ✅ | **FERTIG** | `dist/mdplusplus.browser.global.js` (~274KB) |
| Web Component `<markdown-pp>` | ✅ | ❌ | **OFFEN** | Nicht implementiert |
| WordPress-Plugin | ✅ | ❌ | **OFFEN** | Nicht implementiert |
| REST-API | ✅ | ❌ | **OFFEN** | Nicht implementiert |
| Docker-Image | ✅ | ❌ | **OFFEN** | Nicht implementiert |

---

## Phase 4: Full Editor

| Feature | Geplant | Umgesetzt | Status | Anmerkungen |
|---------|---------|-----------|--------|-------------|
| Monaco Editor | ✅ | ✅ | **FERTIG** | Als Source-Editor |
| Syntax-Highlighting (Editor) | ✅ | ✅ | **FERTIG** | MD++ Highlighting |
| Live-Vorschau | ✅ | ✅ | **FERTIG** | Split-View |
| WYSIWYG-Modus | ✅ | ✅ | **FERTIG** | TipTap Integration |
| Scroll-Sync | ✅ | ✅ | **FERTIG** | Bidirektional mit useScrollSync Hook |
| Plugin-Management UI | ✅ | ❌ | **OFFEN** | Nicht implementiert |
| Export als HTML | ✅ | ✅ | **FERTIG** | Mit Theme-Auswahl (Hell/Dunkel) |
| Export als PDF | ✅ | ✅ | **FERTIG** | PDF-Export verfügbar |
| Export als DOCX | ✅ | ❌ | **OFFEN** | Nicht implementiert |
| Collaboration | ✅ | ❌ | **OFFEN** | Multi-User nicht geplant |

---

## Nicht geplante aber umgesetzte Features

Diese Features wurden zusätzlich implementiert, obwohl sie im ursprünglichen Plan nicht vorgesehen waren:

| Feature | Beschreibung | Status |
|---------|--------------|--------|
| **WYSIWYG mit TipTap** | Rich-Text-Editor zusätzlich zu Monaco | ✅ FERTIG |
| **MarkdownScript (.mdsc)** | Interaktive Scripts in Markdown | ✅ FERTIG |
| **Tabellen-Editor** | Visueller Tabellen-Editor | ✅ FERTIG |
| **SCSS-basiertes Styling** | Modernes SCSS-System statt CSS | ✅ FERTIG |
| **Welcome-Datei** | Demo-Datei beim App-Start | ✅ FERTIG |
| **Callout/Admonition Syntax** | `> [!note]` GitHub-Style | ✅ FERTIG |
| **Fußnoten** | Markdown-Fußnoten | ✅ FERTIG |

---

## Zusammenfassung

### Statistik

| Kategorie | Geplant | Umgesetzt | Prozent |
|-----------|---------|-----------|---------|
| **Phase 1: Core** | 15 | 15 | 100% |
| **Phase 2: Desktop** | 12 | 10 | 83% |
| **Erweiterte Features** | 25 | 21 | 84% |
| **Sicherheit** | 8 | 7 | 88% |
| **Phase 3: MCP** | 5 | 0 | 0% |
| **Phase 3.5: Web** | 5 | 0 | 0% |
| **Phase 4: Editor** | 10 | 8 | 80% |
| **GESAMT** | ~80 | ~61 | **~76%** |

> **Update 2025-01-05**: Mehrere Features wurden neu implementiert:
> - Material Icons Plugin (`![icon](google:name)` Syntax)
> - Tailwind CSS Plugin
> - `:::style` und `:::link-css` Blöcke
> - `:::ai-context[html-hidden]` Modus
> - Plugin-Konflikt-Erkennung
> - Sicherheits-YAML Konfigurationssystem (security.yaml)
> - HTML-Export mit Theme-Auswahl
>
> **Update 2025-01-07**: Scroll-Sync implementiert:
> - Bidirektionaler Scroll-Sync zwischen Editor und Preview
> - `useScrollSync` Hook mit Debouncing und Loop-Prevention
> - Monaco Tokenizer Fixes für MD++ Syntax-Highlighting
>
> **Update 2025-01-07**: CDN-Bundle für Browser-Nutzung:
> - Browser IIFE Bundle (`dist/mdplusplus.browser.global.js`, ~274KB minified)
> - Kann via `<script>` Tag eingebunden werden
> - Globales `MDPlusPlus` Namespace mit allen Exports
> - Beispiele in `examples/cdn-usage.html` und `examples/esm-usage.html`
>
> **Update 2025-01-07**: Vollständige Attribut-Unterstützung:
> - `remark-directive` auf v4.0.0 aktualisiert
> - `hastscript` v9 für korrekte {.class #id} Konvertierung
> - Sicherheits-Filter für Event-Handler (onclick, onerror, etc.)
> - Schutz vor javascript: URLs und gefährlichen style-Attributen
>
> **Update 2025-01-07**: Kroki & Reveal.js Integration:
> - Kroki Plugin für 30+ Diagrammtypen (plantuml, graphviz, d2, erd, etc.)
> - Reveal.js Slides Plugin für Präsentationen
> - `parseSlides()` und `generateRevealHtml()` Funktionen
> - Unterstützt horizontale und vertikale Slides
> - Speaker Notes und Slide-Attribute

### Prioritäten für zukünftige Entwicklung

1. ~~**Hoch**: Material Icons~~ ✅ Implementiert
2. ~~**Hoch**: Vollständige remark-attr Integration~~ ✅ Implementiert (hastscript + remark-directive v4)
3. **Mittel**: MCP-Server für AI-Integration
4. ~~**Mittel**: Scroll-Sync zwischen Editor und Preview~~ ✅ Implementiert
5. ~~**Niedrig**: Tailwind CSS Plugin~~ ✅ Implementiert
6. ~~**Niedrig**: Kroki/Reveal.js Integration~~ ✅ Implementiert
7. ~~**Niedrig**: CDN-Bundle für Browser-Nutzung~~ ✅ Implementiert
8. **Optional**: WordPress-Plugin

---

## Quellen

Die ursprünglichen Spezifikationen stammen aus:

- `E:\Claude Projekte\md++\README.md`
- `E:\Claude Projekte\md++\IMPLEMENTATION.md`
- `E:\Claude Projekte\md++\INTEGRATION.md`
- `E:\Claude Projekte\md++\docs\00_PROJEKT_ÜBERSICHT.md`
- `E:\Claude Projekte\md++\docs\01_SYNTAX_SPEZIFIKATION.md`
- `E:\Claude Projekte\md++\docs\02_PLUGIN_SYSTEM.md`
- `E:\Claude Projekte\md++\docs\03_SICHERHEITSSYSTEM.md`
- `E:\Claude Projekte\md++\docs\04_PROJEKTPLAN.md`
- `E:\Claude Projekte\md++\docs\05_LASTENHEFT.md`
- `E:\Claude Projekte\md++\docs\06_TOOLMATRIX.md`

---

**Version**: 1.0.0
**Erstellt**: 2025-01-05
