# Test 05: AI Context Blocks

> **Kategorie:** MD++ Exklusiv - AI Context
> **Dateien:**
> - `src/parser.ts` - handleAIContext Funktion (Zeile ~818)
> - `app/renderer/src/styles/global.css` - .mdpp-ai-context Styles
> - `app/renderer/src/components/App.tsx` - AI Toggle (Ctrl+Shift+A)
> **Feature:** enableAIContext

---

## 5.1 Versteckter AI-Kontext

### Test: Versteckter Kontext (Standard)
**Eingabe:**
```markdown
:::ai-context
Dieser Kontext ist nur für KI sichtbar.
Menschen sehen diesen Block nicht.
:::
```

**Erwartung:** Block ist versteckt (CSS: hidden)
**CSS-Klassen:** `mdpp-ai-context hidden`
**Toggle:** Ctrl+Shift+A zeigt/versteckt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context
Dieser Kontext ist nur für KI sichtbar.
Menschen sehen diesen Block nicht.
:::

---

### Test: Explizit versteckt
**Eingabe:**
```markdown
:::ai-context{visibility=hidden}
Explizit versteckter Kontext.
:::
```

**Erwartung:** Block ist versteckt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context{visibility=hidden}
Explizit versteckter Kontext.
:::

---

## 5.2 Sichtbarer AI-Kontext

### Test: Sichtbarer Kontext
**Eingabe:**
```markdown
:::ai-context{visibility=visible}
Dieser Kontext ist für Menschen UND KI sichtbar.
:::
```

**Erwartung:** Block ist sichtbar, spezielles Styling
**CSS-Klassen:** `mdpp-ai-context` (ohne hidden)
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context{visibility=visible}
Dieser Kontext ist für Menschen UND KI sichtbar.
:::

---

## 5.3 Markdown in AI-Kontext

### Test: Formatierter AI-Kontext
**Eingabe:**
```markdown
:::ai-context{visibility=visible}
## Projektkontekt

**Wichtig:** Der Benutzer arbeitet an einem Markdown-Editor.

### Technologien:
- TypeScript
- React
- Electron

### Hinweise für AI:
1. Erkläre Konzepte klar
2. Gib Code-Beispiele
3. Verweise auf Dokumentation
:::
```

**Erwartung:** Markdown wird korrekt gerendert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context{visibility=visible}
## Projektkontekt

**Wichtig:** Der Benutzer arbeitet an einem Markdown-Editor.

### Technologien:
- TypeScript
- React
- Electron

### Hinweise für AI:
1. Erkläre Konzepte klar
2. Gib Code-Beispiele
3. Verweise auf Dokumentation
:::

---

## 5.4 Toggle-Funktionalität

### Test: Ctrl+Shift+A Toggle
**Schritte:**
1. Öffne diese Datei in MD++
2. Prüfe ob versteckte AI-Blöcke unsichtbar sind
3. Drücke Ctrl+Shift+A
4. Prüfe ob versteckte AI-Blöcke jetzt sichtbar sind
5. Drücke erneut Ctrl+Shift+A
6. Prüfe ob sie wieder versteckt sind

**Ergebnis:** [ ] PASS / [ ] FAIL

---

### Test: AI-Button in Toolbar
**Schritte:**
1. Suche den "AI" Button in der Toolbar
2. Klicke darauf
3. Prüfe ob AI-Kontext-Blöcke angezeigt werden

**Ergebnis:** [ ] PASS / [ ] FAIL

---

## 5.5 Mehrere AI-Kontexte

### Test: Mehrere Blöcke
**Eingabe:**
```markdown
:::ai-context
Erster versteckter Kontext.
:::

Normaler Text dazwischen.

:::ai-context{visibility=visible}
Sichtbarer Kontext.
:::

Noch mehr normaler Text.

:::ai-context
Zweiter versteckter Kontext.
:::
```

**Erwartung:** 2 versteckt, 1 sichtbar
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context
Erster versteckter Kontext.
:::

Normaler Text dazwischen.

:::ai-context{visibility=visible}
Sichtbarer Kontext.
:::

Noch mehr normaler Text.

:::ai-context
Zweiter versteckter Kontext.
:::

---

## 5.6 AI-Kontext mit Attributen

### Test: Zusätzliche Attribute
**Eingabe:**
```markdown
:::ai-context{visibility=visible id="context-1" role="system"}
Kontext mit zusätzlichen Attributen.
:::
```

**Erwartung:** Attribute werden im HTML übernommen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context{visibility=visible id="context-1" role="system"}
Kontext mit zusätzlichen Attributen.
:::

---

## 5.7 Edge Cases

### Test: Leerer AI-Kontext
**Eingabe:**
```markdown
:::ai-context
:::
```

**Erwartung:** Leerer Block (kein Fehler)
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context
:::

---

### Test: AI-Kontext mit nur Leerzeichen
**Eingabe:**
```markdown
:::ai-context

:::
```

**Erwartung:** Block mit Whitespace
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::ai-context

:::

---

## Zusammenfassung

| Test | Status | Problem-Datei |
|------|--------|---------------|
| 5.1 Versteckt (Standard) | [ ] | |
| 5.1 Explizit hidden | [ ] | |
| 5.2 Sichtbar | [ ] | |
| 5.3 Formatierter Inhalt | [ ] | |
| 5.4 Ctrl+Shift+A Toggle | [ ] | |
| 5.4 AI-Button | [ ] | |
| 5.5 Mehrere Blöcke | [ ] | |
| 5.6 Zusätzliche Attribute | [ ] | |
| 5.7 Leerer Block | [ ] | |
| 5.7 Nur Leerzeichen | [ ] | |

**Gesamt:** ____ / 10 PASS

---

## Bekannte Probleme bei diesem Test

| Problem | Datei zum Bearbeiten |
|---------|---------------------|
| | |
