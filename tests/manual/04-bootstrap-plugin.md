# Test 04: Bootstrap Plugin

> **Kategorie:** Plugin: Bootstrap
> **Dateien:**
> - `plugins/bootstrap.json` - Komponenten-Definition
> - `src/parser.ts` - Directive-Verarbeitung
> - `app/renderer/src/scss/components/_cards.scss` - Card SCSS-Styles
> - `app/renderer/src/scss/components/_buttons.scss` - Button SCSS-Styles
> **Feature:** enableDirectives

---

## 4.1 Alert-Komponente

### Test: Alert ohne Variante
**Eingabe:**
```markdown
:::alert
Standard Alert ohne Variante.
:::
```

**Erwartung:** Alert mit Standard-Styling
**CSS-Klassen:** `alert`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::alert
Standard Alert ohne Variante.
:::

---

### Test: Alert Primary
**Eingabe:**
```markdown
:::alert{variant="primary"}
Primary Alert
:::
```

**Erwartung:** Alert mit primärer Akzentfarbe
**CSS-Klassen:** `alert alert-primary`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::alert{variant="primary"}
Primary Alert
:::

---

### Test: Alert Success
**Eingabe:**
```markdown
:::alert{variant="success"}
Erfolg! Die Operation war erfolgreich.
:::
```

**Erwartung:** Grüner Alert
**CSS-Klassen:** `alert alert-success`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::alert{variant="success"}
Erfolg! Die Operation war erfolgreich.
:::

---

### Test: Alert Warning
**Eingabe:**
```markdown
:::alert{variant="warning"}
Achtung! Bitte beachten.
:::
```

**Erwartung:** Gelb/Orange Alert
**CSS-Klassen:** `alert alert-warning`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::alert{variant="warning"}
Achtung! Bitte beachten.
:::

---

### Test: Alert Danger
**Eingabe:**
```markdown
:::alert{variant="danger"}
Fehler! Etwas ist schief gelaufen.
:::
```

**Erwartung:** Roter Alert
**CSS-Klassen:** `alert alert-danger`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::alert{variant="danger"}
Fehler! Etwas ist schief gelaufen.
:::

---

### Test: Alert Info
**Eingabe:**
```markdown
:::alert{variant="info"}
Information: Hier ist ein Hinweis.
:::
```

**Erwartung:** Blauer Alert
**CSS-Klassen:** `alert alert-info`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::alert{variant="info"}
Information: Hier ist ein Hinweis.
:::

---

### Test: Alert mit Plugin-Prefix
**Eingabe:**
```markdown
:::bootstrap_alert{variant="success"}
Alert mit explizitem bootstrap_ Prefix.
:::
```

**Erwartung:** Gleich wie :::alert{variant="success"}
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::bootstrap_alert{variant="success"}
Alert mit explizitem bootstrap_ Prefix.
:::

---

## 4.2 Card-Komponente

### Test: Einfache Card
**Eingabe:**
```markdown
:::card
Einfache Card ohne Zusätze.
:::
```

**Erwartung:** Box mit Rahmen
**CSS-Klassen:** `card`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::card
Einfache Card ohne Zusätze.
:::

---

### Test: Card mit Klassen
**Eingabe:**
```markdown
:::card{.shadow .rounded}
Card mit Schatten und runden Ecken.
:::
```

**Erwartung:** Card mit zusätzlichen CSS-Klassen
**CSS-Klassen:** `card shadow rounded`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::card{.shadow .rounded}
Card mit Schatten und runden Ecken.
:::

---

### Test: Card mit Titel
**Eingabe:**
```markdown
:::card
### Karten-Titel
Inhalt der Karte mit **Markdown**.

- Punkt 1
- Punkt 2
:::
```

**Erwartung:** Card mit H3-Überschrift und Liste
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::card
### Karten-Titel
Inhalt der Karte mit **Markdown**.

- Punkt 1
- Punkt 2
:::

---

### Test: Card mit bootstrap_ Prefix
**Eingabe:**
```markdown
:::bootstrap_card
Card mit explizitem Prefix.
:::
```

**Erwartung:** Gleich wie :::card
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::bootstrap_card
Card mit explizitem Prefix.
:::

---

## 4.3 Badge-Komponente

### Test: Inline Badge
**Eingabe:**
```markdown
Status: :badge{variant="success"}[Aktiv] und :badge{variant="warning"}[Ausstehend]
```

**Erwartung:** Kleine farbige Tags inline
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Status: :badge{variant="success"}[Aktiv] und :badge{variant="warning"}[Ausstehend]

---

### Test: Badge Varianten
**Eingabe:**
```markdown
:badge{variant="primary"}[Primary]
:badge{variant="secondary"}[Secondary]
:badge{variant="success"}[Success]
:badge{variant="danger"}[Danger]
:badge{variant="warning"}[Warning]
:badge{variant="info"}[Info]
```

**Erwartung:** 6 verschiedenfarbige Badges
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:badge{variant="primary"}[Primary]
:badge{variant="secondary"}[Secondary]
:badge{variant="success"}[Success]
:badge{variant="danger"}[Danger]
:badge{variant="warning"}[Warning]
:badge{variant="info"}[Info]

---

## 4.4 Container/Grid

### Test: Container
**Eingabe:**
```markdown
:::container
Inhalt in einem Container.
:::
```

**Erwartung:** Zentrierter Container mit max-width
**CSS-Klassen:** `container`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::container
Inhalt in einem Container.
:::

---

### Test: Row und Col
**Eingabe:**
```markdown
:::row
:::col{.col-6}
Linke Spalte (50%)
:::

:::col{.col-6}
Rechte Spalte (50%)
:::
:::
```

**Erwartung:** Zwei Spalten nebeneinander
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::row
:::col{.col-6}
Linke Spalte (50%)
:::

:::col{.col-6}
Rechte Spalte (50%)
:::
:::

---

## 4.5 Button-Komponente

### Test: Buttons
**Eingabe:**
```markdown
:::button{variant="primary"}
Primary Button
:::

:::button{variant="success"}
Success Button
:::

:::button{variant="outline-primary"}
Outline Button
:::
```

**Erwartung:** Gestylte Buttons
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
:::button{variant="primary"}
Primary Button
:::

:::button{variant="success"}
Success Button
:::

:::button{variant="outline-primary"}
Outline Button
:::

---

## 4.6 Alle Alert-Varianten

**Übersicht aller Alert-Varianten:**

:::alert{variant="primary"}
Primary
:::

:::alert{variant="secondary"}
Secondary
:::

:::alert{variant="success"}
Success
:::

:::alert{variant="danger"}
Danger
:::

:::alert{variant="warning"}
Warning
:::

:::alert{variant="info"}
Info
:::

:::alert{variant="light"}
Light
:::

:::alert{variant="dark"}
Dark
:::

---

## Zusammenfassung

| Test | Status | Problem-Datei |
|------|--------|---------------|
| 4.1 Alert Standard | [ ] | |
| 4.1 Alert Primary | [ ] | |
| 4.1 Alert Success | [ ] | |
| 4.1 Alert Warning | [ ] | |
| 4.1 Alert Danger | [ ] | |
| 4.1 Alert Info | [ ] | |
| 4.1 Alert mit Prefix | [ ] | |
| 4.2 Card Einfach | [ ] | |
| 4.2 Card mit Klassen | [ ] | |
| 4.2 Card mit Titel | [ ] | |
| 4.2 Card mit Prefix | [ ] | |
| 4.3 Inline Badge | [ ] | |
| 4.3 Badge Varianten | [ ] | |
| 4.4 Container | [ ] | |
| 4.4 Row/Col | [ ] | |
| 4.5 Buttons | [ ] | |
| 4.6 Alle Varianten | [ ] | |

**Gesamt:** ____ / 17 PASS

---

## Bekannte Probleme bei diesem Test

| Problem | Datei zum Bearbeiten |
|---------|---------------------|
| | |
