# Test 01: Markdown Basics

> **Kategorie:** Kern-Markdown (immer aktiv)
> **Datei:** `src/parser.ts`
> **Feature:** Basis Markdown-Syntax

---

## 1.1 Textformatierung

### Test: Fett
**Eingabe:**
```markdown
**fetter Text**
__auch fett__
```

**Erwartung:** Text erscheint fett
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
**fetter Text**
__auch fett__

---

### Test: Kursiv
**Eingabe:**
```markdown
*kursiver Text*
_auch kursiv_
```

**Erwartung:** Text erscheint kursiv
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
*kursiver Text*
_auch kursiv_

---

### Test: Fett und Kursiv kombiniert
**Eingabe:**
```markdown
***fett und kursiv***
___auch beides___
**_gemischt_**
```

**Erwartung:** Text erscheint fett UND kursiv
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
***fett und kursiv***
___auch beides___
**_gemischt_**

---

## 1.2 Überschriften

### Test: Alle Überschriftenebenen
**Eingabe:**
```markdown
# H1 Überschrift
## H2 Überschrift
### H3 Überschrift
#### H4 Überschrift
##### H5 Überschrift
###### H6 Überschrift
```

**Erwartung:** 6 verschiedene Größen, alle mit Anker-Links
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
# H1 Überschrift
## H2 Überschrift
### H3 Überschrift
#### H4 Überschrift
##### H5 Überschrift
###### H6 Überschrift

---

## 1.3 Listen

### Test: Ungeordnete Liste
**Eingabe:**
```markdown
- Punkt A
- Punkt B
  - Verschachtelt 1
  - Verschachtelt 2
- Punkt C
```

**Erwartung:** Bullet Points mit korrekter Einrückung
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
- Punkt A
- Punkt B
  - Verschachtelt 1
  - Verschachtelt 2
- Punkt C

---

### Test: Geordnete Liste
**Eingabe:**
```markdown
1. Erster Punkt
2. Zweiter Punkt
   1. Verschachtelt A
   2. Verschachtelt B
3. Dritter Punkt
```

**Erwartung:** Nummerierte Liste mit korrekter Einrückung
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
1. Erster Punkt
2. Zweiter Punkt
   1. Verschachtelt A
   2. Verschachtelt B
3. Dritter Punkt

---

## 1.4 Links

### Test: Inline Link
**Eingabe:**
```markdown
[Link zu Google](https://google.com)
[Link mit Titel](https://google.com "Google Startseite")
```

**Erwartung:** Klickbare Links, Titel als Tooltip
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
[Link zu Google](https://google.com)
[Link mit Titel](https://google.com "Google Startseite")

---

### Test: Automatische Links
**Eingabe:**
```markdown
https://example.com
www.example.com
```

**Erwartung:** Automatisch als klickbare Links erkannt (GFM)
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
https://example.com
www.example.com

---

## 1.5 Bilder

### Test: Bild mit Alt-Text
**Eingabe:**
```markdown
![Alt Text](https://placehold.co/150)
![Bild mit Titel](https://placehold.co/100 "Titel")
```

**Erwartung:** Bilder werden angezeigt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
![Alt Text](https://placehold.co/150)
![Bild mit Titel](https://placehold.co/100 "Titel")

---

## 1.6 Blockquotes

### Test: Einfaches Zitat
**Eingabe:**
```markdown
> Dies ist ein Zitat.
> Es geht über mehrere Zeilen.
```

**Erwartung:** Eingerücktes Zitat mit vertikalem Strich
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
> Dies ist ein Zitat.
> Es geht über mehrere Zeilen.

---

### Test: Verschachteltes Zitat
**Eingabe:**
```markdown
> Äußeres Zitat
>> Verschachteltes Zitat
>>> Dreifach verschachtelt
```

**Erwartung:** Mehrfach eingerückte Zitate
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
> Äußeres Zitat
>> Verschachteltes Zitat
>>> Dreifach verschachtelt

---

## 1.7 Inline Code

### Test: Inline Code
**Eingabe:**
```markdown
Nutze `console.log()` zum Debuggen.
Backticks in Code: ``code mit ` backtick``
```

**Erwartung:** Monospace-Schrift mit Hintergrund
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Nutze `console.log()` zum Debuggen.
Backticks in Code: ``code mit ` backtick``

---

## 1.8 Horizontale Linie

### Test: Trennlinien
**Eingabe:**
```markdown
---
***
___
```

**Erwartung:** Drei horizontale Linien
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**

---

***

___

---

## 1.9 Escaping

### Test: Escape-Zeichen
**Eingabe:**
```markdown
\*nicht kursiv\*
\[kein Link\](test)
\# keine Überschrift
```

**Erwartung:** Zeichen werden literal angezeigt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
\*nicht kursiv\*
\[kein Link\](test)
\# keine Überschrift

---

## Zusammenfassung

| Test | Status |
|------|--------|
| 1.1 Fett | [ ] |
| 1.1 Kursiv | [ ] |
| 1.1 Fett+Kursiv | [ ] |
| 1.2 Überschriften | [ ] |
| 1.3 Ungeordnete Liste | [ ] |
| 1.3 Geordnete Liste | [ ] |
| 1.4 Links | [ ] |
| 1.4 Auto-Links | [ ] |
| 1.5 Bilder | [ ] |
| 1.6 Blockquotes | [ ] |
| 1.6 Verschachtelt | [ ] |
| 1.7 Inline Code | [ ] |
| 1.8 Horizontale Linie | [ ] |
| 1.9 Escaping | [ ] |

**Gesamt:** ____ / 14 PASS
