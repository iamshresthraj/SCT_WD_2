// QuantumCalc Calculator Logic

// State management
let inputString = '0';
let formulaString = '';
let lastEvaluated = false;
let soundEnabled = localStorage.getItem('calc_sound') === 'true';
let activeTheme = localStorage.getItem('calc_theme') || 'dark';
let activeMode = localStorage.getItem('calc_mode') || 'basic'; // basic or scientific
let history = JSON.parse(localStorage.getItem('calc_history')) || [];

// DOM Elements
const displayFormula = document.getElementById('display-formula');
const displayInput = document.getElementById('display-input');
const calculatorCard = document.getElementById('calculator-card');
const keypadScientific = document.getElementById('keypad-scientific');
const modeSlider = document.getElementById('mode-slider');
const modeBasic = document.getElementById('mode-basic');
const modeSci = document.getElementById('mode-sci');
const btnSound = document.getElementById('btn-sound');
const soundOnIcon = btnSound.querySelector('.sound-on-icon');
const soundOffIcon = btnSound.querySelector('.sound-off-icon');
const historyDrawer = document.getElementById('history-drawer');
const btnHistory = document.getElementById('btn-history');
const btnCloseHistory = document.getElementById('btn-close-history');
const btnClearHistory = document.getElementById('btn-clear-history');
const historyList = document.getElementById('history-list');

// Initialize State
document.addEventListener('DOMContentLoaded', () => {
    // Set Theme
    if (activeTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    // Set Mode
    if (activeMode === 'scientific') {
        calculatorCard.classList.add('scientific');
        keypadScientific.classList.remove('hidden');
        modeBasic.classList.remove('active');
        modeSci.classList.add('active');
    }

    // Set Sound Button Icon
    updateSoundIcon();

    // Render Display
    updateDisplay();

    // Render History
    renderHistory();

    // Add Click Listeners to All Keypad Buttons
    setupKeypadListeners();

    // Add Header Controls Listeners
    setupHeaderListeners();

    // Keyboard Listeners
    window.addEventListener('keydown', handleKeyboardInput);
});

// Setup Click Sound Feedback using Web Audio API (completely self-contained)
function playClickSound() {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        // Pitch drop effect for natural click feel
        oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.04);
    } catch (error) {
        console.warn('Audio Context failed:', error);
    }
}

// Toggle Sound
function updateSoundIcon() {
    if (soundEnabled) {
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
    } else {
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    }
}

// Update the Display content
function updateDisplay() {
    displayInput.textContent = inputString;
    displayFormula.textContent = formulaString;
    
    // Scroll displays to the right so new inputs are always visible
    displayInput.scrollLeft = displayInput.scrollWidth;
    displayFormula.scrollLeft = displayFormula.scrollWidth;
}

// Header Listeners (Theme, Mode, Sound, History)
function setupHeaderListeners() {
    // Sound Toggle
    btnSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('calc_sound', soundEnabled);
        updateSoundIcon();
        playClickSound();
    });

    // Mode Switcher Basic / Scientific
    const toggleMode = (mode) => {
        if (activeMode === mode) return;
        activeMode = mode;
        localStorage.setItem('calc_mode', mode);
        playClickSound();

        if (mode === 'scientific') {
            calculatorCard.classList.add('scientific');
            keypadScientific.classList.remove('hidden');
            modeBasic.classList.remove('active');
            modeSci.classList.add('active');
        } else {
            calculatorCard.classList.remove('scientific');
            keypadScientific.classList.add('hidden');
            modeBasic.classList.add('active');
            modeSci.classList.remove('active');
        }
    };

    modeBasic.addEventListener('click', () => toggleMode('basic'));
    modeSci.addEventListener('click', () => toggleMode('scientific'));
    document.getElementById('mode-switcher-container').addEventListener('click', (e) => {
        if (e.target.id === 'mode-switcher-container') {
            toggleMode(activeMode === 'basic' ? 'scientific' : 'basic');
        }
    });

    // History Toggle
    btnHistory.addEventListener('click', () => {
        playClickSound();
        historyDrawer.classList.add('open');
    });

    btnCloseHistory.addEventListener('click', () => {
        playClickSound();
        historyDrawer.classList.remove('open');
    });

    btnClearHistory.addEventListener('click', () => {
        playClickSound();
        history = [];
        localStorage.removeItem('calc_history');
        renderHistory();
    });

    // Theme Switcher (Double click logo or clicking title/header space can act as double-layer visual trigger. Let's make it logo click!)
    document.querySelector('.logo').addEventListener('click', () => {
        playClickSound();
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            activeTheme = 'dark';
        } else {
            document.body.classList.add('light-theme');
            activeTheme = 'light';
        }
        localStorage.setItem('calc_theme', activeTheme);
    });
}

// Setup listeners for all calculator buttons
function setupKeypadListeners() {
    const buttons = document.querySelectorAll('.btn, .btn-equals');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            playClickSound();
            
            const val = button.getAttribute('data-val');
            const action = button.getAttribute('data-action');
            
            if (val) {
                handleValueInput(val);
            } else if (action) {
                handleActionInput(action);
            } else if (button.id === 'btn-equals') {
                evaluate();
            }
        });
    });
}

// Process direct values (numbers, operators, constants, functions)
function handleValueInput(val) {
    if (lastEvaluated) {
        // If an operation is pressed right after evaluating, keep the result as base.
        // Otherwise, reset display for a fresh number entry.
        const isOperator = ['+', '-', '×', '÷', '^', '%'].includes(val);
        if (isOperator) {
            formulaString = inputString;
        } else {
            formulaString = '';
            inputString = '';
        }
        lastEvaluated = false;
    }

    if (inputString === '0' && val !== '.' && !['+', '-', '×', '÷', '^', '%', ')', '!'].includes(val)) {
        // Replace initial zero unless it's a decimal point or operator
        inputString = val;
    } else {
        // Prevent double decimals in the current typing sequence
        if (val === '.') {
            const parts = inputString.split(/[\+\-\×\÷\^%()]/);
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('.')) return;
        }
        inputString += val;
    }
    updateDisplay();
}

// Process operations (AC, DEL, Sign Toggle)
function handleActionInput(action) {
    if (action === 'clear') {
        inputString = '0';
        formulaString = '';
        lastEvaluated = false;
    } else if (action === 'delete') {
        if (lastEvaluated) {
            formulaString = '';
            lastEvaluated = false;
        } else {
            deleteLast();
        }
    } else if (action === 'toggle-sign') {
        toggleSign();
    }
    updateDisplay();
}

// Handle Backspace deleting correctly (block deleting function words)
function deleteLast() {
    if (inputString.endsWith('sin(') || inputString.endsWith('cos(') || inputString.endsWith('tan(') || inputString.endsWith('log(')) {
        inputString = inputString.slice(0, -4);
    } else if (inputString.endsWith('ln(')) {
        inputString = inputString.slice(0, -3);
    } else if (inputString.endsWith('√(')) {
        inputString = inputString.slice(0, -2);
    } else {
        inputString = inputString.slice(0, -1);
    }

    if (inputString === '') {
        inputString = '0';
    }
}

// Toggle sign of last operand
function toggleSign() {
    if (lastEvaluated) {
        if (inputString !== '0' && !['Error', 'Division by Zero', 'Overflow', 'Syntax Error'].includes(inputString)) {
            if (inputString.startsWith('-')) {
                inputString = inputString.slice(1);
            } else {
                inputString = '-' + inputString;
            }
        }
        return;
    }

    if (inputString === '0') return;

    // Search for pattern of negative-parenthesized number at end of string
    const negativeMatch = inputString.match(/\(-\(([0-9.πe]+)\)\)$/);
    if (negativeMatch) {
        // Revert (-X) to X
        inputString = inputString.slice(0, -negativeMatch[0].length) + negativeMatch[1];
    } else {
        // Match trailing number or constant
        const trailingNumMatch = inputString.match(/([0-9.πe]+)$/);
        if (trailingNumMatch) {
            const num = trailingNumMatch[1];
            inputString = inputString.slice(0, -num.length) + `(-(${num}))`;
        }
    }
}

// Evaluate Mathematical Expression safely
function evaluate() {
    if (inputString === 'Error' || inputString === 'Division by Zero' || inputString === 'Syntax Error') {
        return;
    }

    let expr = inputString;
    formulaString = expr + ' =';

    try {
        const resultVal = evaluateExpression(expr);
        const formattedResult = formatResult(resultVal);
        
        // Save to history list if it's a valid equation
        if (expr !== formattedResult && !['Error', 'Division by Zero', 'Syntax Error', 'Overflow'].includes(formattedResult)) {
            saveHistoryItem(expr, formattedResult);
        }
        
        inputString = formattedResult;
    } catch (err) {
        console.error(err);
        inputString = 'Syntax Error';
    }
    
    lastEvaluated = true;
    updateDisplay();
}

// Mathematical Expression Safe Parsing Engine
function evaluateExpression(expr) {
    // 1. Symbol translations
    let parsed = expr
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/π/g, 'PI')
        .replace(/e/g, 'E')
        .replace(/\^/g, '**');

    // 2. Parse Factorials: e.g., 5! or (3+2)! -> fact(5) / fact(3+2)
    let prev;
    do {
        prev = parsed;
        // Match digits or matched brackets preceding a exclamation sign
        parsed = parsed.replace(/([0-9.πe]+|\([^)]+\))!/g, 'fact($1)');
    } while (parsed !== prev);

    // 3. Strict token validation for security (ensure no arbitrary code execution)
    // Strip out all legal variables, function calls, numbers, operators, brackets, spaces
    const residual = parsed
        .replace(/sin|cos|tan|ln|log|sqrt|fact|PI|E/g, '')
        .replace(/[0-9.+\-*/%()\s,]|(\*\*)/g, '');

    if (residual.trim().length > 0) {
        throw new Error('Forbidden token in evaluation.');
    }

    // 4. Safe sandbox setup with Function constructor
    // Math functions in degrees
    const PI = Math.PI;
    const E = Math.E;
    const sin = (x) => {
        // Fix rounding issues: sin(180) should be 0, sin(360) is 0
        const rad = (x * PI) / 180;
        const val = Math.sin(rad);
        return Math.abs(val) < 1e-14 ? 0 : val;
    };
    const cos = (x) => {
        // Fix rounding issues: cos(90) should be 0, cos(270) is 0
        const rad = (x * PI) / 180;
        const val = Math.cos(rad);
        return Math.abs(val) < 1e-14 ? 0 : val;
    };
    const tan = (x) => {
        // tan(90) is undefined/Infinity
        if ((x - 90) % 180 === 0) return Infinity;
        const rad = (x * PI) / 180;
        const val = Math.tan(rad);
        return Math.abs(val) < 1e-14 ? 0 : val;
    };
    const ln = (x) => Math.log(x);
    const log = (x) => Math.log10(x);
    const sqrt = (x) => {
        if (x < 0) throw new Error('Negative Square Root');
        return Math.sqrt(x);
    };
    const fact = (n) => {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
    };

    // Execute safe sandboxed evaluation
    const evaluator = new Function(
        'sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'fact', 'PI', 'E',
        `return (${parsed});`
    );

    return evaluator(sin, cos, tan, ln, log, sqrt, fact, PI, E);
}

// Clean floating decimals and parse overflows
function formatResult(val) {
    if (val === null || val === undefined || isNaN(val)) {
        return 'Error';
    }
    if (val === Infinity || val === -Infinity) {
        return 'Division by Zero';
    }

    const str = val.toString();
    if (str.includes('e')) {
        return str;
    }

    // Clean JavaScript float calculation errors (e.g. 0.1 + 0.2)
    if (Number.isFinite(val) && !Number.isInteger(val)) {
        const rounded = parseFloat(val.toFixed(10));
        return rounded.toString();
    }

    if (str.length > 14) {
        return val.toExponential(8);
    }

    return str;
}

// Keyboard Input Processing with UI button feedback highlight
function handleKeyboardInput(e) {
    let key = e.key;
    let buttonId = null;

    // Map Keyboard Key to Button ID and action
    if (key >= '0' && key <= '9') {
        buttonId = `btn-${key}`;
        handleValueInput(key);
    } else if (key === '.') {
        buttonId = 'btn-decimal';
        handleValueInput('.');
    } else if (key === '+') {
        buttonId = 'btn-add';
        handleValueInput('+');
    } else if (key === '-') {
        buttonId = 'btn-subtract';
        handleValueInput('-');
    } else if (key === '*') {
        buttonId = 'btn-multiply';
        handleValueInput('×');
    } else if (key === '/') {
        e.preventDefault(); // Stop page find in browser
        buttonId = 'btn-divide';
        handleValueInput('÷');
    } else if (key === '%') {
        buttonId = 'btn-percent';
        handleValueInput('%');
    } else if (key === '^') {
        buttonId = 'btn-power';
        handleValueInput('^');
    } else if (key === '!') {
        buttonId = 'btn-fact';
        handleValueInput('!');
    } else if (key === '(') {
        buttonId = 'btn-open-paren';
        handleValueInput('(');
    } else if (key === ')') {
        buttonId = 'btn-close-paren';
        handleValueInput(')');
    } else if (key === 'Enter' || key === '=') {
        buttonId = 'btn-equals';
        evaluate();
    } else if (key === 'Backspace') {
        buttonId = 'btn-del';
        handleActionInput('delete');
    } else if (key === 'Escape' || key === 'Delete') {
        buttonId = 'btn-ac';
        handleActionInput('clear');
    } else if (key.toLowerCase() === 's') {
        buttonId = 'btn-sin';
        handleValueInput('sin(');
    } else if (key.toLowerCase() === 'c') {
        buttonId = 'btn-cos';
        handleValueInput('cos(');
    } else if (key.toLowerCase() === 't') {
        buttonId = 'btn-tan';
        handleValueInput('tan(');
    } else if (key.toLowerCase() === 'l') {
        buttonId = 'btn-ln';
        handleValueInput('ln(');
    } else if (key.toLowerCase() === 'g') {
        buttonId = 'btn-log';
        handleValueInput('log(');
    } else if (key.toLowerCase() === 'p') {
        buttonId = 'btn-pi';
        handleValueInput('π');
    } else if (key.toLowerCase() === 'e') {
        buttonId = 'btn-e';
        handleValueInput('e');
    } else if (key.toLowerCase() === 'q') {
        buttonId = 'btn-sqrt';
        handleValueInput('√(');
    }

    // Trigger visual button active state
    if (buttonId) {
        const btnNode = document.getElementById(buttonId);
        if (btnNode) {
            playClickSound();
            btnNode.classList.add('keyboard-active');
            setTimeout(() => {
                btnNode.classList.remove('keyboard-active');
            }, 120);
        }
    }
}

// History Storage Logic
function saveHistoryItem(formula, result) {
    // Avoid double logs
    if (history.length > 0 && history[0].formula === formula) return;

    history.unshift({ formula, result });
    
    // Limit to 20 calculations
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('calc_history', JSON.stringify(history));
    renderHistory();
}

// Render History items inside the side drawer panel
function renderHistory() {
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history-msg">No history yet</div>';
        return;
    }

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.setAttribute('data-index', index);
        
        historyItem.innerHTML = `
            <div class="history-item-formula">${item.formula}</div>
            <div class="history-item-result">${item.result}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            playClickSound();
            inputString = item.result;
            formulaString = item.formula + ' =';
            lastEvaluated = true;
            updateDisplay();
            historyDrawer.classList.remove('open');
        });
        
        historyList.appendChild(historyItem);
    });
}
