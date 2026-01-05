# Test 06: Mathematische Formeln (KaTeX)

> **Kategorie:** Math/LaTeX
> **Dateien:**
> - `src/parser.ts` - remarkMath Plugin, createCodeBlockPlugin
> - `app/renderer/src/components/Preview.tsx` - KaTeX Rendering
> - `app/renderer/src/styles/global.css` - .math Styles (Zeile ~970)
> **Feature:** enableMath

---

## 6.1 Inline-Mathematik

### Test: Einfache Inline-Formel
**Eingabe:**
```markdown
Die Formel $E = mc^2$ ist berühmt.
```

**Erwartung:** Formel inline gerendert
**CSS-Klassen:** `math math-inline`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Die Formel $E = mc^2$ ist berühmt.

---

### Test: Mehrere Inline-Formeln
**Eingabe:**
```markdown
Sei $a = 5$ und $b = 3$, dann ist $a + b = 8$.
```

**Erwartung:** Alle Formeln inline gerendert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Sei $a = 5$ und $b = 3$, dann ist $a + b = 8$.

---

### Test: Griechische Buchstaben
**Eingabe:**
```markdown
Winkel: $\alpha$, $\beta$, $\gamma$, $\theta$, $\pi$, $\omega$
```

**Erwartung:** Griechische Symbole
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Winkel: $\alpha$, $\beta$, $\gamma$, $\theta$, $\pi$, $\omega$

---

### Test: Brüche inline
**Eingabe:**
```markdown
Ein Bruch: $\frac{1}{2}$ oder $\frac{a+b}{c-d}$
```

**Erwartung:** Bruch-Darstellung
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Ein Bruch: $\frac{1}{2}$ oder $\frac{a+b}{c-d}$

---

## 6.2 Display-Mathematik (Block)

### Test: Einfache Block-Formel
**Eingabe:**
```markdown
$$
E = mc^2
$$
```

**Erwartung:** Zentrierte Formel in eigener Zeile
**CSS-Klassen:** `math math-display`
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
E = mc^2
$$

---

### Test: Quadratische Formel
**Eingabe:**
```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

**Erwartung:** Vollständige quadratische Formel
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

---

### Test: Summenformel
**Eingabe:**
```markdown
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

**Erwartung:** Summenzeichen mit Grenzen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

---

### Test: Integrale
**Eingabe:**
```markdown
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**Erwartung:** Integralzeichen mit Grenzen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

---

### Test: Matrix
**Eingabe:**
```markdown
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$
```

**Erwartung:** 2x2 Matrix mit Klammern
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

---

### Test: Größere Matrix
**Eingabe:**
```markdown
$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
$$
```

**Erwartung:** 3x3 Matrix mit eckigen Klammern
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
$$

---

## 6.3 Komplexe Formeln

### Test: Mehrzeilige Gleichung
**Eingabe:**
```markdown
$$
\begin{aligned}
f(x) &= x^2 + 2x + 1 \\
     &= (x + 1)^2
\end{aligned}
$$
```

**Erwartung:** Ausgerichtete Gleichungen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
\begin{aligned}
f(x) &= x^2 + 2x + 1 \\
     &= (x + 1)^2
\end{aligned}
$$

---

### Test: Fallunterscheidung
**Eingabe:**
```markdown
$$
|x| = \begin{cases}
x & \text{wenn } x \geq 0 \\
-x & \text{wenn } x < 0
\end{cases}
$$
```

**Erwartung:** Fallunterscheidung mit Klammer
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
|x| = \begin{cases}
x & \text{wenn } x \geq 0 \\
-x & \text{wenn } x < 0
\end{cases}
$$

---

### Test: Grenzwert
**Eingabe:**
```markdown
$$
\lim_{x \to \infty} \frac{1}{x} = 0
$$
```

**Erwartung:** Limes-Notation
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
$$
\lim_{x \to \infty} \frac{1}{x} = 0
$$

---

## 6.4 Math-Code-Block (Alternative Syntax)

### Test: math Code-Block
**Eingabe:**
````markdown
```math
\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}
```
````

**Erwartung:** Wie $$ Block gerendert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```math
\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}
```

---

### Test: latex Code-Block
**Eingabe:**
````markdown
```latex
\oint_C \mathbf{E} \cdot d\mathbf{l} = -\frac{d\Phi_B}{dt}
```
````

**Erwartung:** Wie $$ Block gerendert
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```latex
\oint_C \mathbf{E} \cdot d\mathbf{l} = -\frac{d\Phi_B}{dt}
```

---

## 6.5 Edge Cases

### Test: Dollar in normalem Text
**Eingabe:**
```markdown
Das kostet $50 oder 50$ Dollar.
```

**Erwartung:** Dollar-Zeichen als Text, NICHT als Formel
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Das kostet $50 oder 50$ Dollar.

---

### Test: Escaped Dollar
**Eingabe:**
```markdown
Preis: \$100
```

**Erwartung:** Dollar-Zeichen escaped
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Preis: \$100

---

### Test: Leere Formel
**Eingabe:**
```markdown
Leere Formel: $$
```

**Erwartung:** Kein Fehler, leere Ausgabe
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Leere Formel: $$

---

## Zusammenfassung

| Test | Status | Problem-Datei |
|------|--------|---------------|
| 6.1 Einfache Inline | [ ] | |
| 6.1 Mehrere Inline | [ ] | |
| 6.1 Griechisch | [ ] | |
| 6.1 Brüche | [ ] | |
| 6.2 Block Einfach | [ ] | |
| 6.2 Quadratisch | [ ] | |
| 6.2 Summe | [ ] | |
| 6.2 Integral | [ ] | |
| 6.2 Matrix | [ ] | |
| 6.2 Große Matrix | [ ] | |
| 6.3 Mehrzeilig | [ ] | |
| 6.3 Fallunterscheidung | [ ] | |
| 6.3 Grenzwert | [ ] | |
| 6.4 math Block | [ ] | |
| 6.4 latex Block | [ ] | |
| 6.5 Dollar Text | [ ] | |
| 6.5 Escaped | [ ] | |
| 6.5 Leere Formel | [ ] | |

**Gesamt:** ____ / 18 PASS

---

## Bekannte Probleme bei diesem Test

| Problem | Datei zum Bearbeiten |
|---------|---------------------|
| | |
