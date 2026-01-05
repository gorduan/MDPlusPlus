# Test 03: Admonitions Plugin

> **Kategorie:** Plugin: Admonitions
> **Dateien:**
> - `plugins/admonitions.json` - Komponenten-Definition
> - `src/parser.ts` - Directive-Verarbeitung, closeCalloutBlocks
> - `app/renderer/src/scss/components/_admonitions.scss` - SCSS-Styles
> **Feature:** enableDirectives, enableCallouts

---

## 3.1 Direkte Admonition-Syntax (:::type)

### Test: Note
**Eingabe:**
```markdown
:::note
Dies ist eine Notiz.
:::
```

**Erwartung:** Blaue Box mit linkem Border
**CSS-Klassen:** `admonition admonition-note`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::note
Dies ist eine Notiz.
:::

---

### Test: Info
**Eingabe:**
```markdown
:::info
Dies ist eine Info-Box.
:::
```

**Erwartung:** Blaue Box
**CSS-Klassen:** `admonition admonition-info`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::info
Dies ist eine Info-Box.
:::

---

### Test: Tip
**Eingabe:**
```markdown
:::tip
Dies ist ein Tipp.
:::
```

**Erwartung:** Grüne Box
**CSS-Klassen:** `admonition admonition-tip`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::tip
Dies ist ein Tipp.
:::

---

### Test: Warning
**Eingabe:**
```markdown
:::warning
Dies ist eine Warnung.
:::
```

**Erwartung:** Orange/Gelbe Box
**CSS-Klassen:** `admonition admonition-warning`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::warning
Dies ist eine Warnung.
:::

---

### Test: Danger
**Eingabe:**
```markdown
:::danger
Dies ist gefährlich!
:::
```

**Erwartung:** Rote Box
**CSS-Klassen:** `admonition admonition-danger`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::danger
Dies ist gefährlich!
:::

---

### Test: Success
**Eingabe:**
```markdown
:::success
Operation erfolgreich!
:::
```

**Erwartung:** Grüne Box
**CSS-Klassen:** `admonition admonition-success`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::success
Operation erfolgreich!
:::

---

## 3.2 Plugin-Prefix-Syntax (:::admonitions_type)

### Test: Mit Plugin-Prefix
**Eingabe:**
```markdown
:::admonitions_note
Notiz mit explizitem Plugin-Prefix.
:::
```

**Erwartung:** Gleiche blaue Box wie :::note
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::admonitions_note
Notiz mit explizitem Plugin-Prefix.
:::

---

### Test: Colon-Syntax (:::admonitions:note)
**Eingabe:**
```markdown
:::admonitions:tip
Tipp mit Colon-Syntax.
:::
```

**Erwartung:** Wird zu :::admonitions_tip konvertiert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::admonitions:tip
Tipp mit Colon-Syntax.
:::

---

## 3.3 Generische Admonition mit type-Attribut

### Test: admonition{type="note"}
**Eingabe:**
```markdown
:::admonition{type="note"}
Generische Admonition mit type-Attribut.
:::
```

**Erwartung:** Blaue Box (admonition admonition-note)
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::admonition{type="note"}
Generische Admonition mit type-Attribut.
:::

---

### Test: admonition{type="warning" title="Achtung"}
**Eingabe:**
```markdown
:::admonition{type="warning" title="Achtung"}
Warnung mit Titel-Attribut.
:::
```

**Erwartung:** Orange Box, Titel wird als Attribut gesetzt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::admonition{type="warning" title="Achtung"}
Warnung mit Titel-Attribut.
:::

---

## 3.4 GitHub/Obsidian Callout-Syntax

### Test: > [!NOTE]
**Eingabe:**
```markdown
> [!NOTE]
> Dies ist eine GitHub-style Notiz.
> Mit mehreren Zeilen.
```

**Erwartung:** Wird zu :::admonitions_note konvertiert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
> [!NOTE]
> Dies ist eine GitHub-style Notiz.
> Mit mehreren Zeilen.

---

### Test: > [!WARNING]
**Eingabe:**
```markdown
> [!WARNING]
> Vorsicht bei diesem Schritt!
```

**Erwartung:** Orange Warn-Box
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
> [!WARNING]
> Vorsicht bei diesem Schritt!

---

### Test: > [!TIP] mit Titel
**Eingabe:**
```markdown
> [!TIP] Hilfreicher Hinweis
> Hier steht der Inhalt des Tipps.
```

**Erwartung:** Grüne Box mit Titel
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
> [!TIP] Hilfreicher Hinweis
> Hier steht der Inhalt des Tipps.

---

### Test: > [!DANGER]
**Eingabe:**
```markdown
> [!DANGER]
> Diese Aktion kann nicht rückgängig gemacht werden!
```

**Erwartung:** Rote Box
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
> [!DANGER]
> Diese Aktion kann nicht rückgängig gemacht werden!

---

## 3.5 Markdown in Admonitions

### Test: Formatierung in Admonition
**Eingabe:**
```markdown
:::note
**Fett**, *kursiv*, `code` und ~~durchgestrichen~~.
:::
```

**Erwartung:** Markdown wird korrekt gerendert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::note
**Fett**, *kursiv*, `code` und ~~durchgestrichen~~.
:::

---

### Test: Liste in Admonition
**Eingabe:**
```markdown
:::tip
Tipps:
- Erster Tipp
- Zweiter Tipp
- Dritter Tipp
:::
```

**Erwartung:** Liste innerhalb der Box
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::tip
Tipps:
- Erster Tipp
- Zweiter Tipp
- Dritter Tipp
:::

---

### Test: Code-Block in Admonition
**Eingabe:**
```markdown
:::warning
Beispiel-Code:
```javascript
// Nicht so machen!
eval(userInput);
```
:::
```

**Erwartung:** Code-Block innerhalb der Warnung
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::warning
Beispiel-Code:
```javascript
// Nicht so machen!
eval(userInput);
```
:::

---

## 3.6 Alle Admonition-Typen

**Alle Typen in einer Übersicht:**

:::note
Note - Blaue Box
:::

:::info
Info - Blaue Box
:::

:::tip
Tip - Grüne Box
:::

:::hint
Hint - Grüne Box (wie Tip)
:::

:::important
Important - Lila Box
:::

:::warning
Warning - Orange Box
:::

:::caution
Caution - Orange Box (wie Warning)
:::

:::danger
Danger - Rote Box
:::

:::error
Error - Rote Box (wie Danger)
:::

:::success
Success - Grüne Box
:::

:::question
Question - Blau/Lila Box
:::

:::quote
Quote - Graue Box
:::

:::example
Example - Cyan Box
:::

:::abstract
Abstract - Cyan Box
:::

:::bug
Bug - Pink Box
:::

---

## Zusammenfassung

| Test | Status | Problem-Datei |
|------|--------|---------------|
| 3.1 :::note | [ ] | |
| 3.1 :::info | [ ] | |
| 3.1 :::tip | [ ] | |
| 3.1 :::warning | [ ] | |
| 3.1 :::danger | [ ] | |
| 3.1 :::success | [ ] | |
| 3.2 :::admonitions_note | [ ] | |
| 3.2 :::admonitions:tip | [ ] | |
| 3.3 {type="note"} | [ ] | |
| 3.3 {type="warning" title=} | [ ] | |
| 3.4 > [!NOTE] | [ ] | |
| 3.4 > [!WARNING] | [ ] | |
| 3.4 > [!TIP] mit Titel | [ ] | |
| 3.4 > [!DANGER] | [ ] | |
| 3.5 Formatierung | [ ] | |
| 3.5 Liste | [ ] | |
| 3.5 Code-Block | [ ] | |
| 3.6 Alle 15 Typen | [ ] | |

**Gesamt:** ____ / 18 PASS

---

## Bekannte Probleme bei diesem Test

| Problem | Datei zum Bearbeiten |
|---------|---------------------|
| | |
