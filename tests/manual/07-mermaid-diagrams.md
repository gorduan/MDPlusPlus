# Test 07: Mermaid Diagramme

> **Kategorie:** Mermaid Diagramme
> **Dateien:**
> - `src/parser.ts` - createCodeBlockPlugin (mermaid handling)
> - `app/renderer/src/components/Preview.tsx` - Mermaid Rendering
> - `app/renderer/src/scss/components/_mermaid.scss` - Mermaid SCSS-Styles
> **Feature:** enableMermaid

---

## 7.1 Flowchart

### Test: Einfacher Flowchart
**Eingabe:**
````markdown
```mermaid
flowchart TD
    A[Start] --> B[Ende]
```
````

**Erwartung:** Zwei Boxen mit Pfeil
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
flowchart TD
    A[Start] --> B[Ende]
```

---

### Test: Flowchart mit Verzweigung
**Eingabe:**
````markdown
```mermaid
flowchart TD
    A[Start] --> B{Frage?}
    B -->|Ja| C[Aktion 1]
    B -->|Nein| D[Aktion 2]
    C --> E[Ende]
    D --> E
```
````

**Erwartung:** Raute für Entscheidung, beschriftete Pfeile
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
flowchart TD
    A[Start] --> B{Frage?}
    B -->|Ja| C[Aktion 1]
    B -->|Nein| D[Aktion 2]
    C --> E[Ende]
    D --> E
```

---

### Test: Flowchart LR (links-rechts)
**Eingabe:**
````markdown
```mermaid
flowchart LR
    A[Input] --> B[Process] --> C[Output]
```
````

**Erwartung:** Horizontaler Flow
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
flowchart LR
    A[Input] --> B[Process] --> C[Output]
```

---

## 7.2 Sequenzdiagramm

### Test: Einfaches Sequenzdiagramm
**Eingabe:**
````markdown
```mermaid
sequenceDiagram
    Alice->>Bob: Hallo Bob!
    Bob-->>Alice: Hallo Alice!
```
````

**Erwartung:** Zwei Teilnehmer mit Nachrichten
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
sequenceDiagram
    Alice->>Bob: Hallo Bob!
    Bob-->>Alice: Hallo Alice!
```

---

### Test: Sequenzdiagramm mit Participants
**Eingabe:**
````markdown
```mermaid
sequenceDiagram
    participant User
    participant App
    participant Server

    User->>App: Klick
    App->>Server: Request
    Server-->>App: Response
    App-->>User: Anzeige
```
````

**Erwartung:** Drei Teilnehmer mit Nachrichtenfluss
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
sequenceDiagram
    participant User
    participant App
    participant Server

    User->>App: Klick
    App->>Server: Request
    Server-->>App: Response
    App-->>User: Anzeige
```

---

## 7.3 Pie Chart

### Test: Einfacher Pie Chart
**Eingabe:**
````markdown
```mermaid
pie title Projektaufteilung
    "Parser" : 40
    "Editor" : 35
    "Tests" : 25
```
````

**Erwartung:** Kreisdiagramm mit 3 Segmenten
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
pie title Projektaufteilung
    "Parser" : 40
    "Editor" : 35
    "Tests" : 25
```

---

## 7.4 Gantt Chart

### Test: Gantt Diagramm
**Eingabe:**
````markdown
```mermaid
gantt
    title Projektplan
    dateFormat  YYYY-MM-DD
    section Phase 1
    Design           :a1, 2024-01-01, 30d
    Implementierung  :a2, after a1, 45d
    section Phase 2
    Testing          :2024-03-01, 20d
    Deployment       :2024-03-21, 10d
```
````

**Erwartung:** Gantt-Chart mit Zeitbalken
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
gantt
    title Projektplan
    dateFormat  YYYY-MM-DD
    section Phase 1
    Design           :a1, 2024-01-01, 30d
    Implementierung  :a2, after a1, 45d
    section Phase 2
    Testing          :2024-03-01, 20d
    Deployment       :2024-03-21, 10d
```

---

## 7.5 Class Diagram

### Test: Klassendiagramm
**Eingabe:**
````markdown
```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
```
````

**Erwartung:** UML-Klassendiagramm mit Vererbung
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog
```

---

## 7.6 State Diagram

### Test: Zustandsdiagramm
**Eingabe:**
````markdown
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Done : complete
    Processing --> Error : fail
    Error --> Idle : reset
    Done --> [*]
```
````

**Erwartung:** Zustandsdiagramm mit Übergängen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Done : complete
    Processing --> Error : fail
    Error --> Idle : reset
    Done --> [*]
```

---

## 7.7 ER Diagram

### Test: Entity-Relationship Diagramm
**Eingabe:**
````markdown
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "is ordered"
```
````

**Erwartung:** ER-Diagramm mit Beziehungen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "is ordered"
```

---

## 7.8 Mindmap

### Test: Mindmap
**Eingabe:**
````markdown
```mermaid
mindmap
  root((MD++))
    Parser
      Markdown
      Directives
      Plugins
    Editor
      Monaco
      WYSIWYG
    Preview
      HTML
      Mermaid
      KaTeX
```
````

**Erwartung:** Mindmap mit zentralem Knoten
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
mindmap
  root((MD++))
    Parser
      Markdown
      Directives
      Plugins
    Editor
      Monaco
      WYSIWYG
    Preview
      HTML
      Mermaid
      KaTeX
```

---

## 7.9 Edge Cases

### Test: Syntax-Fehler
**Eingabe:**
````markdown
```mermaid
flowchart INVALID
    broken syntax here
```
````

**Erwartung:** Fehler wird angezeigt (kein Crash)
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
flowchart INVALID
    broken syntax here
```

---

### Test: Leeres Mermaid
**Eingabe:**
````markdown
```mermaid
```
````

**Erwartung:** Kein Crash, evtl. leere Ausgabe
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
```

---

### Test: Mermaid mit Sonderzeichen
**Eingabe:**
````markdown
```mermaid
flowchart LR
    A["Start (Anfang)"] --> B["Ende & Schluss"]
```
````

**Erwartung:** Sonderzeichen in Anführungszeichen
**Ergebnis:** [ ] PASS / [ ] FAIL

**Ausgabe:**
```mermaid
flowchart LR
    A["Start (Anfang)"] --> B["Ende & Schluss"]
```

---

## Zusammenfassung

| Test | Status | Problem-Datei |
|------|--------|---------------|
| 7.1 Flowchart Einfach | [ ] | |
| 7.1 Flowchart Verzweigung | [ ] | |
| 7.1 Flowchart LR | [ ] | |
| 7.2 Sequenz Einfach | [ ] | |
| 7.2 Sequenz Participants | [ ] | |
| 7.3 Pie Chart | [ ] | |
| 7.4 Gantt | [ ] | |
| 7.5 Class Diagram | [ ] | |
| 7.6 State Diagram | [ ] | |
| 7.7 ER Diagram | [ ] | |
| 7.8 Mindmap | [ ] | |
| 7.9 Syntax-Fehler | [ ] | |
| 7.9 Leeres Mermaid | [ ] | |
| 7.9 Sonderzeichen | [ ] | |

**Gesamt:** ____ / 14 PASS

---

## Bekannte Probleme bei diesem Test

| Problem | Datei zum Bearbeiten |
|---------|---------------------|
| | |
