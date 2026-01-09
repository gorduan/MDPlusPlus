# KaTeX Math Syntax Reference

## Basic Usage

### Inline Math

Wrap expressions with single dollar signs for inline math:

```markdown
The famous equation $E = mc^2$ changed physics forever.
```

Result: The famous equation *E = mc²* changed physics forever.

### Display Math

Use double dollar signs for centered, block-level equations:

```markdown
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

### Code Block Math

Use fenced code blocks with `math`, `latex`, or `katex`:

````markdown
```math
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
```
````

---

## Basic Expressions

### Arithmetic Operations

| Syntax | Result | Description |
|--------|--------|-------------|
| `a + b` | a + b | Addition |
| `a - b` | a − b | Subtraction |
| `a \times b` | a × b | Multiplication (cross) |
| `a \cdot b` | a · b | Multiplication (dot) |
| `a \div b` | a ÷ b | Division |
| `\frac{a}{b}` | a/b | Fraction |
| `a^b` | a^b | Superscript/power |
| `a_b` | a_b | Subscript |
| `a^{bc}` | a^(bc) | Grouped superscript |
| `a_{bc}` | a_(bc) | Grouped subscript |
| `a^b_c` | Combined | Both super and subscript |

### Examples

```markdown
$x^2 + y^2 = z^2$
$\frac{x+1}{x-1}$
$a^{2n+1}$
$x_1, x_2, \ldots, x_n$
```

---

## Greek Letters

### Lowercase

| Syntax | Letter | Syntax | Letter |
|--------|--------|--------|--------|
| `\alpha` | α | `\nu` | ν |
| `\beta` | β | `\xi` | ξ |
| `\gamma` | γ | `\pi` | π |
| `\delta` | δ | `\rho` | ρ |
| `\epsilon` | ε | `\sigma` | σ |
| `\zeta` | ζ | `\tau` | τ |
| `\eta` | η | `\upsilon` | υ |
| `\theta` | θ | `\phi` | φ |
| `\iota` | ι | `\chi` | χ |
| `\kappa` | κ | `\psi` | ψ |
| `\lambda` | λ | `\omega` | ω |
| `\mu` | μ | | |

### Uppercase

| Syntax | Letter | Syntax | Letter |
|--------|--------|--------|--------|
| `\Gamma` | Γ | `\Phi` | Φ |
| `\Delta` | Δ | `\Psi` | Ψ |
| `\Theta` | Θ | `\Omega` | Ω |
| `\Lambda` | Λ | `\Pi` | Π |
| `\Sigma` | Σ | | |

### Example

```markdown
$\alpha + \beta = \gamma$
$\Delta x = x_2 - x_1$
$\Sigma F = ma$
```

---

## Fractions and Roots

### Fractions

```markdown
$\frac{numerator}{denominator}$
$\frac{1}{2}$
$\frac{x+1}{x-1}$
$\frac{\partial f}{\partial x}$
```

### Nested Fractions

```markdown
$\frac{1}{1+\frac{1}{x}}$
```

### Display Style Fraction

```markdown
$\displaystyle\frac{a}{b}$
```

### Roots

```markdown
$\sqrt{x}$           <!-- Square root -->
$\sqrt[3]{x}$        <!-- Cube root -->
$\sqrt[n]{x}$        <!-- nth root -->
$\sqrt{x^2 + y^2}$   <!-- Complex expression -->
```

---

## Sums, Products, and Integrals

### Summation

```markdown
$\sum_{i=1}^{n} x_i$
$$\sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}$$
```

### Product

```markdown
$\prod_{i=1}^{n} x_i$
$$\prod_{i=1}^{n} i = n!$$
```

### Integrals

```markdown
$\int f(x) dx$                      <!-- Indefinite -->
$\int_a^b f(x) dx$                  <!-- Definite -->
$\int_0^\infty e^{-x} dx$           <!-- Improper -->
$\iint f(x,y) dxdy$                 <!-- Double -->
$\iiint f(x,y,z) dxdydz$            <!-- Triple -->
$\oint_C F \cdot dr$                <!-- Contour -->
```

### Limits

```markdown
$\lim_{x \to \infty} f(x)$
$\lim_{x \to 0^+} \frac{1}{x} = \infty$
$\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e$
```

---

## Functions

### Standard Functions

| Syntax | Function |
|--------|----------|
| `\sin x` | sin x |
| `\cos x` | cos x |
| `\tan x` | tan x |
| `\cot x` | cot x |
| `\sec x` | sec x |
| `\csc x` | csc x |
| `\arcsin x` | arcsin x |
| `\arccos x` | arccos x |
| `\arctan x` | arctan x |
| `\sinh x` | sinh x |
| `\cosh x` | cosh x |
| `\tanh x` | tanh x |
| `\log x` | log x |
| `\ln x` | ln x |
| `\exp x` | exp x |
| `\min` | min |
| `\max` | max |
| `\gcd` | gcd |
| `\deg` | deg |
| `\det` | det |
| `\dim` | dim |
| `\ker` | ker |
| `\Pr` | Pr |

### Examples

```markdown
$\sin^2 x + \cos^2 x = 1$
$\ln(e^x) = x$
$\log_{10} 100 = 2$
$\max(a, b)$
```

---

## Brackets and Delimiters

### Basic Brackets

| Syntax | Result |
|--------|--------|
| `(x)` | (x) |
| `[x]` | [x] |
| `\{x\}` | {x} |
| `\langle x \rangle` | ⟨x⟩ |
| `\lvert x \rvert` | \|x\| |
| `\lVert x \rVert` | ‖x‖ |
| `\lfloor x \rfloor` | ⌊x⌋ |
| `\lceil x \rceil` | ⌈x⌉ |

### Auto-sizing Brackets

Use `\left` and `\right` for auto-sizing:

```markdown
$\left( \frac{a}{b} \right)$
$\left[ \sum_{i=1}^{n} x_i \right]$
$\left\{ \frac{1}{2} \right\}$
$\left| \frac{a}{b} \right|$
```

### Manual Sizing

```markdown
$\big( \Big( \bigg( \Bigg($
$\big[ \Big[ \bigg[ \Bigg[$
```

---

## Matrices and Arrays

### Basic Matrix

```markdown
$$
\begin{matrix}
a & b \\
c & d
\end{matrix}
$$
```

### Matrix with Brackets

```markdown
$$
\begin{pmatrix}    <!-- Parentheses -->
a & b \\
c & d
\end{pmatrix}
$$

$$
\begin{bmatrix}    <!-- Square brackets -->
a & b \\
c & d
\end{bmatrix}
$$

$$
\begin{vmatrix}    <!-- Vertical bars (determinant) -->
a & b \\
c & d
\end{vmatrix}
$$

$$
\begin{Bmatrix}    <!-- Curly braces -->
a & b \\
c & d
\end{Bmatrix}
$$
```

### Larger Matrix

```markdown
$$
\begin{pmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{pmatrix}
$$
```

### Augmented Matrix

```markdown
$$
\left[\begin{array}{cc|c}
1 & 2 & 3 \\
4 & 5 & 6
\end{array}\right]
$$
```

---

## Equations and Alignment

### Aligned Equations

```markdown
$$
\begin{aligned}
x + y &= 10 \\
2x - y &= 5
\end{aligned}
$$
```

### Multi-step Derivation

```markdown
$$
\begin{aligned}
(a+b)^2 &= (a+b)(a+b) \\
        &= a^2 + ab + ba + b^2 \\
        &= a^2 + 2ab + b^2
\end{aligned}
$$
```

### Cases

```markdown
$$
f(x) = \begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}
$$
```

---

## Set Notation

### Set Symbols

| Syntax | Symbol | Meaning |
|--------|--------|---------|
| `\in` | ∈ | Element of |
| `\notin` | ∉ | Not element of |
| `\subset` | ⊂ | Proper subset |
| `\subseteq` | ⊆ | Subset or equal |
| `\supset` | ⊃ | Proper superset |
| `\supseteq` | ⊇ | Superset or equal |
| `\cup` | ∪ | Union |
| `\cap` | ∩ | Intersection |
| `\emptyset` | ∅ | Empty set |
| `\setminus` | \ | Set difference |

### Number Sets

| Syntax | Symbol | Meaning |
|--------|--------|---------|
| `\mathbb{N}` | ℕ | Natural numbers |
| `\mathbb{Z}` | ℤ | Integers |
| `\mathbb{Q}` | ℚ | Rational numbers |
| `\mathbb{R}` | ℝ | Real numbers |
| `\mathbb{C}` | ℂ | Complex numbers |

### Examples

```markdown
$x \in \mathbb{R}$
$A \cup B$
$\{x \in \mathbb{R} : x > 0\}$
$A \cap B = \emptyset$
```

---

## Logic Symbols

| Syntax | Symbol | Meaning |
|--------|--------|---------|
| `\forall` | ∀ | For all |
| `\exists` | ∃ | There exists |
| `\nexists` | ∄ | Does not exist |
| `\land` | ∧ | Logical and |
| `\lor` | ∨ | Logical or |
| `\lnot` | ¬ | Logical not |
| `\Rightarrow` | ⇒ | Implies |
| `\Leftrightarrow` | ⇔ | If and only if |
| `\therefore` | ∴ | Therefore |
| `\because` | ∵ | Because |

### Examples

```markdown
$\forall x \in \mathbb{R}, x^2 \geq 0$
$\exists n \in \mathbb{N} : n > 100$
$p \land q \Rightarrow r$
```

---

## Relations and Comparisons

| Syntax | Symbol | Meaning |
|--------|--------|---------|
| `=` | = | Equal |
| `\neq` | ≠ | Not equal |
| `<` | < | Less than |
| `>` | > | Greater than |
| `\leq` | ≤ | Less or equal |
| `\geq` | ≥ | Greater or equal |
| `\ll` | ≪ | Much less than |
| `\gg` | ≫ | Much greater than |
| `\approx` | ≈ | Approximately |
| `\sim` | ∼ | Similar |
| `\equiv` | ≡ | Equivalent |
| `\propto` | ∝ | Proportional |

---

## Arrows

| Syntax | Symbol |
|--------|--------|
| `\rightarrow` | → |
| `\leftarrow` | ← |
| `\leftrightarrow` | ↔ |
| `\Rightarrow` | ⇒ |
| `\Leftarrow` | ⇐ |
| `\Leftrightarrow` | ⇔ |
| `\uparrow` | ↑ |
| `\downarrow` | ↓ |
| `\mapsto` | ↦ |
| `\to` | → |

---

## Calculus

### Derivatives

```markdown
$\frac{dy}{dx}$                    <!-- Leibniz notation -->
$\frac{d^2y}{dx^2}$                <!-- Second derivative -->
$\frac{\partial f}{\partial x}$    <!-- Partial derivative -->
$\nabla f$                         <!-- Gradient -->
$f'(x)$                            <!-- Prime notation -->
$\dot{x}$                          <!-- Newton notation -->
$\ddot{x}$                         <!-- Second derivative -->
```

### Common Derivatives

```markdown
$$
\frac{d}{dx}(x^n) = nx^{n-1}
$$

$$
\frac{d}{dx}(e^x) = e^x
$$

$$
\frac{d}{dx}(\sin x) = \cos x
$$
```

### Integration Examples

```markdown
$$
\int x^n dx = \frac{x^{n+1}}{n+1} + C
$$

$$
\int e^x dx = e^x + C
$$

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$
```

---

## Text in Math

```markdown
$x = 5 \text{ if } y > 0$
$\text{Area} = \pi r^2$
$f(x) \text{ is continuous}$
```

---

## Formatting

### Bold and Italic

```markdown
$\mathbf{bold}$        <!-- Bold -->
$\mathit{italic}$      <!-- Italic (default) -->
$\mathrm{roman}$       <!-- Roman/upright -->
$\mathsf{sans}$        <!-- Sans-serif -->
$\mathtt{typewriter}$  <!-- Monospace -->
$\mathcal{CALLIGRAPHY}$ <!-- Calligraphic -->
$\mathfrak{Fraktur}$   <!-- Fraktur -->
```

### Spacing

| Command | Description |
|---------|-------------|
| `\,` | Thin space |
| `\:` | Medium space |
| `\;` | Thick space |
| `\!` | Negative thin space |
| `\quad` | Large space |
| `\qquad` | Very large space |

```markdown
$a\,b$    <!-- Thin space -->
$a\quad b$ <!-- Large space -->
```

---

## Complete Examples

### Quadratic Formula

```markdown
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

### Euler's Identity

```markdown
$$
e^{i\pi} + 1 = 0
$$
```

### Taylor Series

```markdown
$$
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots
$$
```

### Maxwell's Equations

```markdown
$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$
```

### Schrödinger Equation

```markdown
$$
i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t) = \hat{H}\Psi(\mathbf{r},t)
$$
```

---

## Best Practices

1. **Use display mode for complex equations** - Better readability
2. **Use `\text{}` for words in equations** - Proper spacing
3. **Use aligned environments** - For multi-line derivations
4. **Test in preview** - KaTeX can be strict with syntax
5. **Escape special characters** - Use `\{`, `\}`, `\$` as needed
