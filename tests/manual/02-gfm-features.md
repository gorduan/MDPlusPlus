# Test 02: GitHub Flavored Markdown (GFM)

> **Kategorie:** GFM Features
> **Datei:** `src/parser.ts` (remarkGfm Plugin)
> **Feature:** enableGfm (Standard: aktiv)

---

## 2.1 Tabellen

### Test: Einfache Tabelle
**Eingabe:**
```markdown
| Spalte 1 | Spalte 2 | Spalte 3 |
|----------|----------|----------|
| A1       | A2       | A3       |
| B1       | B2       | B3       |
```

**Erwartung:** Formatierte Tabelle mit Header
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
| Spalte 1 | Spalte 2 | Spalte 3 |
|----------|----------|----------|
| A1       | A2       | A3       |
| B1       | B2       | B3       |

---

### Test: Tabelle mit Ausrichtung
**Eingabe:**
```markdown
| Links | Zentriert | Rechts |
|:------|:---------:|-------:|
| L1    | Z1        | R1     |
| L2    | Z2        | R2     |
```

**Erwartung:** Korrekte Text-Ausrichtung pro Spalte
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
| Links | Zentriert | Rechts |
|:------|:---------:|-------:|
| L1    | Z1        | R1     |
| L2    | Z2        | R2     |

---

### Test: Tabelle mit Markdown-Inhalt
**Eingabe:**
```markdown
| Feature | Syntax | Beschreibung |
|---------|--------|--------------|
| **Fett** | `**text**` | Fetter Text |
| *Kursiv* | `*text*` | Kursiver Text |
| `Code` | \`code\` | Inline Code |
```

**Erwartung:** Markdown in Zellen wird gerendert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
| Feature | Syntax | Beschreibung |
|---------|--------|--------------|
| **Fett** | `**text**` | Fetter Text |
| *Kursiv* | `*text*` | Kursiver Text |
| `Code` | \`code\` | Inline Code |

---

## 2.2 Task-Listen (Checkboxen)

### Test: Task-Liste
**Eingabe:**
```markdown
- [x] Erledigte Aufgabe
- [ ] Offene Aufgabe
- [x] Noch eine erledigte
- [ ] Noch eine offene
```

**Erwartung:** Checkboxen, angehakte sind ausgefüllt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
- [x] Erledigte Aufgabe
- [ ] Offene Aufgabe
- [x] Noch eine erledigte
- [ ] Noch eine offene

---

### Test: Verschachtelte Task-Liste
**Eingabe:**
```markdown
- [x] Hauptaufgabe
  - [x] Unteraufgabe 1
  - [ ] Unteraufgabe 2
- [ ] Andere Hauptaufgabe
  - [ ] Deren Unteraufgabe
```

**Erwartung:** Korrekte Verschachtelung mit Checkboxen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
- [x] Hauptaufgabe
  - [x] Unteraufgabe 1
  - [ ] Unteraufgabe 2
- [ ] Andere Hauptaufgabe
  - [ ] Deren Unteraufgabe

---

## 2.3 Durchstreichen

### Test: Durchgestrichener Text
**Eingabe:**
```markdown
~~durchgestrichener Text~~
Normaler Text mit ~~durchgestrichenem~~ Wort.
```

**Erwartung:** Text mit Durchstreichung
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
~~durchgestrichener Text~~
Normaler Text mit ~~durchgestrichenem~~ Wort.

---

## 2.4 Autolinks

### Test: URL-Autolinks
**Eingabe:**
```markdown
https://github.com
http://example.com
www.google.com
```

**Erwartung:** Automatisch verlinkt (klickbar)
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
https://github.com
http://example.com
www.google.com

---

### Test: E-Mail-Autolinks
**Eingabe:**
```markdown
test@example.com
support@mdplusplus.dev
```

**Erwartung:** E-Mail-Adressen als mailto:-Links
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
test@example.com
support@mdplusplus.dev

---

## 2.5 Fußnoten

### Test: Einfache Fußnote
**Eingabe:**
```markdown
Text mit einer Fußnote[^1].

[^1]: Dies ist der Fußnoteninhalt.
```

**Erwartung:** Hochgestellte Zahl, Fußnote am Ende
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Text mit einer Fußnote[^1].

[^1]: Dies ist der Fußnoteninhalt.

---

### Test: Mehrere Fußnoten
**Eingabe:**
```markdown
Erster Verweis[^a] und zweiter Verweis[^b].

[^a]: Erste Fußnote.
[^b]: Zweite Fußnote mit **Markdown**.
```

**Erwartung:** Beide Fußnoten korrekt verlinkt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Erster Verweis[^a] und zweiter Verweis[^b].

[^a]: Erste Fußnote.
[^b]: Zweite Fußnote mit **Markdown**.

---

### Test: Lange Fußnote
**Eingabe:**
```markdown
Text mit langer Fußnote[^long].

[^long]: Dies ist eine längere Fußnote.

    Sie kann mehrere Absätze haben.

    Und sogar Code:
    ```javascript
    console.log("Hello");
    ```
```

**Erwartung:** Mehrzeilige Fußnote mit Code
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Text mit langer Fußnote[^long].

[^long]: Dies ist eine längere Fußnote.

    Sie kann mehrere Absätze haben.

    Und sogar Code:
    ```javascript
    console.log("Hello");
    ```

---

## Zusammenfassung

| Test | Status |
|------|--------|
| 2.1 Einfache Tabelle | [ ] |
| 2.1 Tabelle Ausrichtung | [ ] |
| 2.1 Tabelle mit Markdown | [ ] |
| 2.2 Task-Liste | [ ] |
| 2.2 Verschachtelte Tasks | [ ] |
| 2.3 Durchstreichen | [ ] |
| 2.4 URL-Autolinks | [ ] |
| 2.4 E-Mail-Autolinks | [ ] |
| 2.5 Einfache Fußnote | [ ] |
| 2.5 Mehrere Fußnoten | [ ] |
| 2.5 Lange Fußnote | [ ] |

**Gesamt:** ____ / 11 PASS
