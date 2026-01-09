# Kroki Diagrams Plugin

## Overview

The Kroki plugin integrates with [Kroki.io](https://kroki.io/), a unified API for creating diagrams from text. It supports over 30 diagram types including PlantUML, Graphviz, D2, Structurizr, BPMN, Excalidraw, and many more. Diagrams are rendered server-side and returned as images.

## Features

- **30+ Diagram Types** - Support for numerous diagramming languages
- **Server-Side Rendering** - No client-side JavaScript required
- **SVG Output** - Scalable vector graphics by default
- **Self-Hostable** - Use public server or host your own
- **Caching** - Optional diagram caching for performance
- **Fallback** - Graceful error handling

## Supported Diagram Types

### Architecture & UML
| Language | Description |
|----------|-------------|
| `plantuml` | UML diagrams (class, sequence, etc.) |
| `c4plantuml` | C4 architecture diagrams |
| `structurizr` | Structurizr DSL diagrams |
| `nomnoml` | UML-like diagrams |
| `umlet` | UML modeling tool |

### Flowcharts & Graphs
| Language | Description |
|----------|-------------|
| `graphviz` / `dot` | Graph visualization |
| `d2` | Declarative diagramming |
| `mermaid-kroki` | Mermaid via Kroki |
| `pikchr` | PIC-like diagrams |
| `svgbob` | ASCII art to SVG |

### Business & Process
| Language | Description |
|----------|-------------|
| `bpmn` | Business Process Model |
| `actdiag` | Activity diagrams |
| `seqdiag` | Sequence diagrams |
| `blockdiag` | Block diagrams |

### Network & Infrastructure
| Language | Description |
|----------|-------------|
| `nwdiag` | Network diagrams |
| `packetdiag` | Packet format diagrams |
| `rackdiag` | Rack diagrams |

### Data & Charts
| Language | Description |
|----------|-------------|
| `vega` | Vega visualization |
| `vegalite` | Vega-Lite visualization |
| `wavedrom` | Digital timing diagrams |
| `bytefield` | Byte field diagrams |

### Database & ER
| Language | Description |
|----------|-------------|
| `dbml` | Database markup language |
| `erd` | Entity relationship diagrams |

### Other
| Language | Description |
|----------|-------------|
| `excalidraw` | Hand-drawn style diagrams |
| `ditaa` | ASCII art diagrams |
| `wireviz` | Wiring harness diagrams |
| `diagramsnet` | Draw.io diagrams |
| `tikz` | LaTeX TikZ graphics |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `serverUrl` | `https://kroki.io` | Kroki server URL |
| `format` | `svg` | Output format (svg, png, pdf) |
| `cacheDiagrams` | `true` | Enable diagram caching |
| `fallbackOnError` | `true` | Show source on error |

## Self-Hosting

You can host your own Kroki server for:
- Privacy and security
- Faster rendering
- Offline usage
- Custom configurations

See [Kroki Installation Guide](https://docs.kroki.io/kroki/setup/install/)

## Requirements

- MD++ Editor version 1.0.0 or higher
- Internet connection (for public Kroki server)

## External Resources

- [Kroki Documentation](https://docs.kroki.io/)
- [Kroki Live Editor](https://kroki.io/)
- [Kroki GitHub](https://github.com/yuzutech/kroki)
