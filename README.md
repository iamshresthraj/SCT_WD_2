# QuantumCalc - Premium Basic & Scientific Calculator

QuantumCalc is a modern, fully functional basic and scientific web-based calculator. Designed with premium dark glassmorphism styling, clean micro-interactions, responsive sizing, sound feedback, calculations history, and extensive keyboard mappings, it represents a high-fidelity tool for classroom, engineering, or everyday use.

## Features

- **Dual Modes (Basic & Scientific)**: Toggle seamlessly between a clean basic keypad and an expanded scientific layout containing trigonometric, logarithmic, factorial, power, and square root operations.
- **Dynamic Glassmorphic UI**: Beautiful, layered translucent panels with custom background gradient blobs that drift smoothly via CSS animations.
- **Dual Themes**: Supports both a sleek violet-dark space theme (default) and a clean frost-white glass theme (click on the **QuantumCalc** logo text in the header to switch).
- **Sound Feedback**: Generates realistic mechanical clicks using Web Audio API synthesis (can be toggled on/off in the header controls). No external assets required.
- **Math Parsing Engine**: Clean token-based parsing that supports nested operations, factorials, parenthetical signs, and correctly handles errors (e.g. Division by Zero, Syntax Error) without crashes.
- **Evaluation History**: Stores the last 20 calculations locally. View them by sliding open the history drawer. Click any past calculation to restore it to the display screen, or clear history completely.
- **Keyboard Shortcuts**: Native support for numpad and alphabet keys, complete with active press feedback animations for the buttons.

---

## Keyboard Hotkey Guide

QuantumCalc maps physical keyboard keys to its on-screen buttons:

| Keyboard Key | Action / Button |
| :--- | :--- |
| `0` - `9` | Digits |
| `.` | Decimal Point |
| `+` | Plus ($+$) |
| `-` | Minus ($-$) |
| `*` | Multiply ($\times$) |
| `/` | Divide ($\div$) |
| `%` | Percent ($\%$) |
| `^` | Power ($^$) |
| `!` | Factorial ($!$) |
| `(` , `)` | Parentheses |
| `Enter` or `=` | Equal ($=$) |
| `Backspace` | Delete (DEL) |
| `Escape` or `Delete` | Clear (AC) |
| `s` | `sin` |
| `c` | `cos` |
| `t` | `tan` |
| `l` | `ln` |
| `g` | `log` |
| `p` | `π` |
| `e` | `e` |
| `q` | Square Root ($\sqrt{}$) |

---

## File Structure

```text
├── index.html   # Main layout and semantic HTML structure
├── styles.css   # Custom CSS Variables, Glassmorphism, Animations, Responsive layouts
├── script.js    # Sound Synthesis, Input Handler, Parser & LocalStorage History
└── README.md    # Documentation and usage guide
```

---

## Technologies Used

- **HTML5**: Semantic tags, accessibility (ARIA attributes), SEO optimization.
- **CSS3**: CSS Custom Variables, Backdrop blur filters, Keyframe animations, Responsive Flex/Grid containers.
- **Vanilla JavaScript (ES6+)**: Custom mathematical tokenizer/evaluator, Web Audio API synthesizers, local storage persistence, DOM event managers.

---

## Getting Started

1. Clone or download this directory:
   ```bash
   git clone https://github.com/iamshresthraj/SCT_WD_2.git
   ```
2. Open `index.html` in any modern web browser to run the application immediately. No web server or dependency installation is needed.
