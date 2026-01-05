# Test 08: Code-Blöcke

> **Kategorie:** Code-Blöcke und Syntax-Highlighting
> **Dateien:**
> - `src/parser.ts` - Code-Block Verarbeitung
> - `app/renderer/src/components/Preview.tsx` - Code Rendering
> - `app/renderer/src/styles/global.css` - pre/code Styles
> **Feature:** Basis-Feature (immer aktiv)

---

## 8.1 Sprach-Highlighting

### Test: JavaScript
**Eingabe:**
````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return true;
}

const result = greet('World');
```
````

**Erwartung:** Syntax-Highlighting für JS
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return true;
}

const result = greet('World');
```

---

### Test: TypeScript
**Eingabe:**
````markdown
```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'Alice',
  age: 30
};
```
````

**Erwartung:** TypeScript-Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'Alice',
  age: 30
};
```

---

### Test: Python
**Eingabe:**
````markdown
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))
```
````

**Erwartung:** Python-Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))
```

---

### Test: CSS
**Eingabe:**
````markdown
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1e1e1e;
}

.button:hover {
  opacity: 0.8;
}
```
````

**Erwartung:** CSS-Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1e1e1e;
}

.button:hover {
  opacity: 0.8;
}
```

---

### Test: HTML
**Eingabe:**
````markdown
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</body>
</html>
```
````

**Erwartung:** HTML-Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</body>
</html>
```

---

### Test: JSON
**Eingabe:**
````markdown
```json
{
  "name": "MD++",
  "version": "0.5.0",
  "features": ["parser", "editor", "preview"],
  "enabled": true
}
```
````

**Erwartung:** JSON-Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```json
{
  "name": "MD++",
  "version": "0.5.0",
  "features": ["parser", "editor", "preview"],
  "enabled": true
}
```

---

### Test: Bash/Shell
**Eingabe:**
````markdown
```bash
#!/bin/bash
echo "Starting..."
npm run build
if [ $? -eq 0 ]; then
  echo "Success!"
else
  echo "Failed!"
  exit 1
fi
```
````

**Erwartung:** Shell-Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```bash
#!/bin/bash
echo "Starting..."
npm run build
if [ $? -eq 0 ]; then
  echo "Success!"
else
  echo "Failed!"
  exit 1
fi
```

---

### Test: SQL
**Eingabe:**
````markdown
```sql
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.total > 100
ORDER BY orders.total DESC;
```
````

**Erwartung:** SQL-Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```sql
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.total > 100
ORDER BY orders.total DESC;
```

---

## 8.2 Code ohne Sprache

### Test: Ohne Sprachangabe
**Eingabe:**
````markdown
```
Dies ist Code ohne Sprache.
Nur Monospace-Schrift.
```
````

**Erwartung:** Monospace, kein Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```
Dies ist Code ohne Sprache.
Nur Monospace-Schrift.
```

---

### Test: Plaintext
**Eingabe:**
````markdown
```text
Explizit als Text markiert.
Kein Highlighting erwartet.
```
````

**Erwartung:** Kein Highlighting
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```text
Explizit als Text markiert.
Kein Highlighting erwartet.
```

---

## 8.3 Inline Code

### Test: Einfacher Inline Code
**Eingabe:**
```markdown
Nutze `npm install` zum Installieren.
```

**Erwartung:** Monospace mit Hintergrund
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Nutze `npm install` zum Installieren.

---

### Test: Inline Code mit Backticks
**Eingabe:**
```markdown
Code mit Backtick: ``code mit ` backtick``
```

**Erwartung:** Backtick im Code dargestellt
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
Code mit Backtick: ``code mit ` backtick``

---

## 8.4 Edge Cases

### Test: Sehr langer Code
**Eingabe:**
````markdown
```javascript
const veryLongVariableName = "This is a very long string that might cause horizontal scrolling in the code block container";
```
````

**Erwartung:** Horizontales Scrollen möglich
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```javascript
const veryLongVariableName = "This is a very long string that might cause horizontal scrolling in the code block container";
```

---

### Test: Code mit Sonderzeichen
**Eingabe:**
````markdown
```javascript
const symbols = "<>&\"'`${}[]|\\";
```
````

**Erwartung:** Sonderzeichen korrekt escaped
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```javascript
const symbols = "<>&\"'`${}[]|\\";
```

---

### Test: Leerer Code-Block
**Eingabe:**
````markdown
```javascript
```
````

**Erwartung:** Leerer Block (kein Fehler)
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```javascript
```

---

### Test: Code mit nur Leerzeichen
**Eingabe:**
````markdown
```

```
````

**Erwartung:** Leerzeichen erhalten
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```

```

---

## Zusammenfassung

| Test | Status | Problem-Datei |
|------|--------|---------------|
| 8.1 JavaScript | [ ] | |
| 8.1 TypeScript | [ ] | |
| 8.1 Python | [ ] | |
| 8.1 CSS | [ ] | |
| 8.1 HTML | [ ] | |
| 8.1 JSON | [ ] | |
| 8.1 Bash | [ ] | |
| 8.1 SQL | [ ] | |
| 8.2 Ohne Sprache | [ ] | |
| 8.2 Plaintext | [ ] | |
| 8.3 Inline Code | [ ] | |
| 8.3 Inline Backticks | [ ] | |
| 8.4 Langer Code | [ ] | |
| 8.4 Sonderzeichen | [ ] | |
| 8.4 Leerer Block | [ ] | |
| 8.4 Nur Leerzeichen | [ ] | |

**Gesamt:** ____ / 16 PASS

---

## Bekannte Probleme bei diesem Test

| Problem | Datei zum Bearbeiten |
|---------|---------------------|
| | |
