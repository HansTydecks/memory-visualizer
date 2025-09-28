class BinaryAsciiVisualizer {
    constructor() {
        this.currentValue = 202; // Start with 0
        this.currentMission = 0;
        this.completedMissions = new Set(); // Track completed missions
        this.hintsViewed = new Set(); // Track viewed hints for missions
        this.modulesViewed = new Set(); // Track viewed modules for missions
        this.missions = [
            {
                text: "🔍 Willkommen! Klicke auf die Glühbirne 💡 neben den Schaltern, um herauszufinden, was diese Schalter mit Computern zu tun haben!",
                check: () => this.hintsViewed && this.hintsViewed.has('switches'),
                success: "Super! Jetzt weißt du, dass Computer nur mit 0 und 1 arbeiten - genau wie diese Schalter die man ein- und ausschalten kann!",
                timer: 8
            },
            {
                text: "Schalte alle Schalter aus (alle auf 0) und zeige die Dezimalzahl 0 an!",
                check: () => this.currentValue === 0,
                success: "Perfekt! Alle Bits sind aus - das ergibt die Dezimalzahl 0!",
                timer: 5
            },
            {
                text: "Lasse dir die Dezimalzahl 1 anzeigen!",
                check: () => this.currentValue === 1,
                success: "Richtig! Die Dezimalzahl 1 braucht nur das erste Bit (ganz rechts)!",
                timer: 5
            },
            {
                text: "Lasse dir die Dezimalzahl 2 anzeigen!",
                check: () => this.currentValue === 2,
                success: "Die Dezimalzahl 2 braucht nur das zweite Bit!",
                timer: 4
            },
            {
                text: "Lasse dir die Dezimalzahl 3 anzeigen!",
                check: () => this.currentValue === 3,
                success: "Super! Die 3 ist 2 + 1, also Bit 0 und Bit 1!",
                timer: 4
            },
            {
                text: "Lasse dir die Dezimalzahl 4 anzeigen!",
                check: () => this.currentValue === 4,
                success: "Die Dezimalzahl 4 braucht nur das dritte Bit! Fällt dir das Muster auf?",
                timer: 5
            },
            {
                text: "Lasse dir die Dezimalzahl 5 anzeigen!",
                check: () => this.currentValue === 5,
                success: "Toll! Die 5 ist 4 + 1, also Bit 0 und Bit 2!",
                timer: 4
            },
            {
                text: "Lasse dir die Dezimalzahl 7 anzeigen!",
                check: () => this.currentValue === 7,
                success: "Die 7 ist 4 + 2 + 1, also die ersten drei Bits!",
                timer: 4
            },
            {
                text: "Lasse dir die Dezimalzahl 8 anzeigen!",
                check: () => this.currentValue === 8,
                success: "Die Dezimalzahl 8 braucht nur das vierte Bit!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 10 anzeigen!",
                check: () => this.currentValue === 10,
                success: "Die 10 ist 8 + 2!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 15 anzeigen!",
                check: () => this.currentValue === 15,
                success: "Die 15 braucht die ersten vier Bits (8+4+2+1)!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 16 anzeigen!",
                check: () => this.currentValue === 16,
                success: "Die 16 braucht nur das fünfte Bit!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 20 anzeigen!",
                check: () => this.currentValue === 20,
                success: "Die 20 ist 16 + 4!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 25 anzeigen!",
                check: () => this.currentValue === 25,
                success: "Die 25 ist 16 + 8 + 1!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 31 anzeigen!",
                check: () => this.currentValue === 31,
                success: "Die 31 braucht die ersten fünf Bits!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 32 anzeigen!",
                check: () => this.currentValue === 32,
                success: "Die 32 braucht nur das sechste Bit!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 42 anzeigen!",
                check: () => this.currentValue === 42,
                success: "Die 42 ist 32 + 8 + 2!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 50 anzeigen!",
                check: () => this.currentValue === 50,
                success: "Die 50 ist 32 + 16 + 2!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 64 anzeigen!",
                check: () => this.currentValue === 64,
                success: "Die 64 braucht nur das siebte Bit!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 77 anzeigen!",
                check: () => this.currentValue === 77,
                success: "Die 77 ist 64 + 8 + 4 + 1!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 100 anzeigen!",
                check: () => this.currentValue === 100,
                success: "Die 100 ist 64 + 32 + 4!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 127 anzeigen!",
                check: () => this.currentValue === 127,
                success: "Die 127 braucht alle Bits außer dem höchsten Bit 7!",
                timer: 4
            },
            {
                text: "Lasse dir die Dezimalzahl 128 anzeigen!",
                check: () => this.currentValue === 128,
                success: "Die 128 braucht nur das höchste Bit 7!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 150 anzeigen!",
                check: () => this.currentValue === 150,
                success: "Die 150 ist 128 + 16 + 4 + 2!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 185 anzeigen!",
                check: () => this.currentValue === 185,
                success: "Die 185 ist 128 + 32 + 16 + 8 + 1!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 200 anzeigen!",
                check: () => this.currentValue === 200,
                success: "Die 200 ist 128 + 64 + 8!",
                timer: 3
            },
            {
                text: "Lasse dir die Dezimalzahl 243 anzeigen!",
                check: () => this.currentValue === 243,
                success: "Die 243 ist 128 + 64 + 32 + 16 + 2 + 1!",
                timer: 3
            },
            {
                text: "Zum Abschluss: Klicke auf die Glühbirne 💡 bei 'Bit 0-7', um die Erklärung der Bit-Positionen zu entdecken!",
                check: () => this.hintsViewed && this.hintsViewed.has('bits'),
                success: "🎉 Herzlichen Glückwunsch! � Du bist jetzt ein wahrer Binär-Dezimal-Meister! Du hast alle Missionen erfolgreich abgeschlossen und verstehst jetzt perfekt, wie Computer mit Bits rechnen und diese zu Dezimalzahlen umwandeln! 🏆",
                timer: 10
            }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createMissionButtons();
        this.initializeHintBulbs();
        this.initializeModuleStates();
        this.updateDisplay();
        this.updateMission();
    }

    initializeHintBulbs() {
        // Add the main output hint bulb
        this.addOutputHintBulb('output-hint', 'output', '.ascii-output');
    }

    initializeModuleStates() {
        // Initialize all module states based on their checkboxes
        const moduleToggles = document.querySelectorAll('.module-toggle input[type="checkbox"]');
        moduleToggles.forEach(toggle => {
            this.toggleModule(toggle);
        });
    }

    setupEventListeners() {
        // Bit switches
        const switches = document.querySelectorAll('.switch input[type="checkbox"]');
        switches.forEach(switchEl => {
            switchEl.addEventListener('change', (e) => {
                this.updateValueFromSwitches();
            });
        });

        // Module toggles
        const moduleToggles = document.querySelectorAll('.module-toggle input[type="checkbox"]');
        moduleToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.toggleModule(e.target);
            });
        });

        // Hint System
        document.addEventListener('click', (e) => {
            if (e.target.id === 'bits-hint') {
                this.showHint('bits');
            } else if (e.target.id === 'switches-hint') {
                this.showHint('switches');
            } else if (e.target.id === 'output-hint') {
                this.showHint('output');
            }
        });

        document.getElementById('close-hint').addEventListener('click', () => {
            this.hideHint();
        });

        // Mission System
        document.getElementById('continue-mission').addEventListener('click', () => {
            this.nextMission();
        });

        // Mission button clicks (event delegation)
        document.getElementById('mission-buttons').addEventListener('click', (e) => {
            if (e.target.classList.contains('mission-btn') && !e.target.classList.contains('locked')) {
                const missionIndex = parseInt(e.target.dataset.mission);
                this.selectMission(missionIndex);
            }
        });

        // Modal close on outside click
        document.getElementById('hint-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideHint();
            }
        });

        document.getElementById('mission-modal').addEventListener('click', (e) => {
            // Mission Modal kann nicht durch Außenklick geschlossen werden
            // Nur über den Button möglich
        });

        // Help System
        document.getElementById('mission-help-btn').addEventListener('click', () => {
            this.showHelpRequest();
        });

        document.getElementById('help-yes').addEventListener('click', () => {
            this.startHelpTimer();
        });

        document.getElementById('help-no').addEventListener('click', () => {
            // Byte wird traurig wenn Hilfe abgelehnt wird
            const helpByte = document.getElementById('help-request-byte');
            if (helpByte && helpByte.querySelector('img')) {
                helpByte.querySelector('img').src = 'Byte_mascot/Byte_Sad.png';
                setTimeout(() => {
                    helpByte.querySelector('img').src = 'Byte_mascot/Byte_normal.png';
                }, 1000);
            }
            
            setTimeout(() => {
                this.hideHelpRequest();
            }, 500);
        });

        document.getElementById('close-help-explanation').addEventListener('click', () => {
            this.hideHelpExplanation();
        });

        // Help modal close on outside click
        document.getElementById('help-request-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideHelpRequest();
            }
        });

        document.getElementById('help-explanation-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideHelpExplanation();
            }
        });
    }

    updateValueFromSwitches() {
        let value = 0;
        const switches = document.querySelectorAll('.switch input[type="checkbox"]');
        
        switches.forEach(switchEl => {
            const bit = parseInt(switchEl.dataset.bit);
            if (switchEl.checked) {
                value += Math.pow(2, bit);
            }
        });

        this.currentValue = value;
        this.updateOutputs();
        this.updateLEDs();
        this.updateDecimalValues(); // Neue Funktion hinzufügen
        this.animateChange();
        this.checkMission();
    }

    setValue(value) {
        this.currentValue = Math.max(0, Math.min(255, value));
        this.updateSwitches();
        this.updateOutputs();
        this.updateLEDs();
        this.updateDecimalValues(); // Auch hier hinzufügen
        this.animateChange();
        this.checkMission();
    }

    updateSwitches() {
        const switches = document.querySelectorAll('.switch input[type="checkbox"]');
        
        switches.forEach(switchEl => {
            const bit = parseInt(switchEl.dataset.bit);
            const bitValue = Math.pow(2, bit);
            switchEl.checked = (this.currentValue & bitValue) !== 0;
        });
    }

    updateOutputs() {
        // ASCII character with color coding
        const asciiChar = document.getElementById('ascii-char');
        
        // Remove all existing classes
        asciiChar.className = 'ascii-char';
        
        if (this.currentValue >= 32 && this.currentValue <= 126) {
            // Printable ASCII characters
            asciiChar.textContent = String.fromCharCode(this.currentValue);
            
            // Apply color coding based on character type
            if (this.currentValue >= 48 && this.currentValue <= 57) {
                // Digits 0-9
                asciiChar.classList.add('digit');
            } else if ((this.currentValue >= 65 && this.currentValue <= 90) || 
                      (this.currentValue >= 97 && this.currentValue <= 122)) {
                // Letters A-Z, a-z
                asciiChar.classList.add('letter');
            } else {
                // Special characters (33-47, 58-64, 91-96, 123-126)
                asciiChar.classList.add('special');
            }
        } else {
            // Control characters (0-31, 127+)
            asciiChar.classList.add('control');
            
            if (this.currentValue === 0) {
                asciiChar.textContent = 'NULL';
            } else if (this.currentValue === 9) {
                asciiChar.textContent = 'TAB';
            } else if (this.currentValue === 10) {
                asciiChar.textContent = 'LF';
            } else if (this.currentValue === 13) {
                asciiChar.textContent = 'CR';
            } else if (this.currentValue === 32) {
                asciiChar.textContent = 'SPACE';
                asciiChar.classList.remove('control');
                asciiChar.classList.add('special');
            } else if (this.currentValue === 127) {
                asciiChar.textContent = 'DEL';
            } else if (this.currentValue < 32) {
                asciiChar.textContent = `CTRL+${String.fromCharCode(this.currentValue + 64)}`;
            } else {
                asciiChar.textContent = `[${this.currentValue}]`;
            }
        }

        // Binary representation
        const binaryValue = document.getElementById('binary-value');
        binaryValue.textContent = this.currentValue.toString(2).padStart(8, '0');

        // Decimal value
        const decimalValue = document.getElementById('decimal-value');
        decimalValue.textContent = this.currentValue;

        // Grayscale
        const grayscaleBox = document.getElementById('grayscale-box');
        const grayscaleInfo = document.getElementById('grayscale-info');
        const grayValue = Math.round((this.currentValue / 255) * 255);
        grayscaleBox.style.backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        grayscaleInfo.textContent = `${this.currentValue}/255`;
    }

    updateLEDs() {
        const leds = document.querySelectorAll('.led');
        
        leds.forEach(led => {
            const bit = parseInt(led.dataset.bit);
            const bitValue = Math.pow(2, bit);
            
            if ((this.currentValue & bitValue) !== 0) {
                led.classList.add('on');
                led.textContent = '1';
            } else {
                led.classList.remove('on');
                led.textContent = '0';
            }
        });
    }

    updateDecimalValues() {
        // Update decimal values visibility based on switch states
        const switches = document.querySelectorAll('.switch input[type="checkbox"]');
        const decimalValues = document.querySelectorAll('.decimal-values .value');
        
        switches.forEach((switchEl, index) => {
            const bit = parseInt(switchEl.dataset.bit);
            // Find corresponding decimal value (bit 7 = index 0, bit 6 = index 1, etc.)
            const valueIndex = 7 - bit;
            const valueElement = decimalValues[valueIndex];
            
            if (valueElement) {
                if (switchEl.checked) {
                    valueElement.style.opacity = '1';
                    valueElement.style.visibility = 'visible';
                } else {
                    valueElement.style.opacity = '0.15';
                    valueElement.style.visibility = 'visible';
                }
            }
        });
    }

    toggleModule(toggle) {
        const moduleId = toggle.id.replace('-toggle', '-module');
        let module = document.getElementById(moduleId);
        
        // Special handling for ASCII mode
        if (toggle.id === 'ascii-mode-toggle') {
            module = document.querySelector('.ascii-output');
        }
        
        if (module) {
            if (toggle.checked) {
                module.classList.remove('hidden');
                this.showModuleHints(toggle.id);
                
                // Track module viewing for missions
                if (toggle.id === 'decimal-values-toggle') {
                    this.modulesViewed.add('decimal-values');
                }
            } else {
                module.classList.add('hidden');
                this.hideModuleHints(toggle.id);
            }
        }
        
        // Check mission after any toggle change (for missions that depend on toggle states)
        this.checkMission();
    }

    showModuleHints(toggleId) {
        // Add hint bulbs for specific modules
        if (toggleId === 'decimal-values-toggle') {
            this.addModuleHintBulbUnder('decimal-values-hint', 'dezimalwerte', '.decimal-values');
        } else if (toggleId === 'power-values-toggle') {
            this.addModuleHintBulbUnder('power-values-hint', 'zweierpotenzen', '.power-values');
        } else if (toggleId === 'grayscale-toggle') {
            this.addOutputHintBulb('grayscale-hint', 'graustufen', '.grayscale-output');
        } else if (toggleId === 'decimal-output-toggle') {
            this.addOutputHintBulb('decimal-output-hint', 'dezimalausgabe', '.decimal-output');
        } else if (toggleId === 'binary-output-toggle') {
            this.addOutputHintBulb('binary-output-hint', 'binärausgabe', '.binary-output');
        }
    }

    hideModuleHints(toggleId) {
        // Remove hint bulbs for specific modules
        const hintMap = {
            'decimal-values-toggle': 'decimal-values-hint',
            'power-values-toggle': 'power-values-hint',
            'grayscale-toggle': 'grayscale-hint',
            'decimal-output-toggle': 'decimal-output-hint',
            'binary-output-toggle': 'binary-output-hint'
        };
        
        const hintId = hintMap[toggleId];
        if (hintId) {
            const bulb = document.getElementById(hintId);
            if (bulb) {
                // Also remove container if it exists
                const container = bulb.closest('.module-hint-container');
                if (container) {
                    container.remove();
                } else {
                    bulb.remove();
                }
            }
        }
    }

    addModuleHintBulbUnder(id, type, selector) {
        const existing = document.getElementById(id);
        if (existing) return;

        const container = document.querySelector(selector);
        if (!container) return;

        // Create hint container
        const hintContainer = document.createElement('div');
        hintContainer.className = 'module-hint-container';

        const bulb = document.createElement('button');
        bulb.id = id;
        bulb.className = 'hint-bulb module-hint';
        bulb.innerHTML = '💡';
        bulb.title = `Was ist ${type}?`;
        bulb.addEventListener('click', () => this.showHint(type.toLowerCase()));

        // Nur die Glühbirne hinzufügen, kein Text-Label
        hintContainer.appendChild(bulb);
        container.appendChild(hintContainer);
    }

    addOutputHintBulb(id, type, selector) {
        const existing = document.getElementById(id);
        if (existing) return;

        const container = document.querySelector(selector);
        if (!container) return;

        const bulb = document.createElement('button');
        bulb.id = id;
        bulb.className = 'hint-bulb';
        bulb.innerHTML = '💡';
        bulb.title = `Was ist ${type}?`;
        bulb.style.position = 'absolute';
        bulb.style.left = '10px';
        bulb.style.top = '10px';
        bulb.addEventListener('click', () => this.showHint(type.toLowerCase()));

        container.appendChild(bulb);
    }

    updateDisplay() {
        this.updateSwitches();
        this.updateOutputs();
        this.updateLEDs();
        this.updateDecimalValues(); // Auch hier hinzufügen
    }

    animateChange() {
        // Add animation class to outputs
        const animatedElements = document.querySelectorAll('.ascii-char, .output-value');
        animatedElements.forEach(el => {
            el.classList.add('changed');
            setTimeout(() => {
                el.classList.remove('changed');
            }, 300);
        });
    }

    // Utility method for educational purposes
    getBitRepresentation() {
        return {
            decimal: this.currentValue,
            binary: this.currentValue.toString(2).padStart(8, '0'),
            ascii: this.currentValue >= 32 && this.currentValue <= 126 
                ? String.fromCharCode(this.currentValue) 
                : '[Steuerzeichen]',
            bits: Array.from({length: 8}, (_, i) => ({
                position: 7 - i,
                value: (this.currentValue & Math.pow(2, 7 - i)) !== 0 ? 1 : 0,
                decimal: Math.pow(2, 7 - i)
            }))
        };
    }

    // ASCII Table Methods
    createAsciiTable() {
        const table = document.getElementById('ascii-table');
        
        // Header
        const headerRow = table.insertRow();
        ['Dec', 'Bin', 'Char', 'Dec', 'Bin', 'Char', 'Dec', 'Bin', 'Char', 'Dec', 'Bin', 'Char'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        // Erstelle 32 Zeilen (0-31 in der ersten Spalte, 32-63 in der zweiten, etc.)
        for (let row = 0; row < 32; row++) {
            const tr = table.insertRow();
            
            // 4 Spaltengruppen (Dec, Bin, Char) für die Werte 0-31, 32-63, 64-95, 96-127
            for (let col = 0; col < 4; col++) {
                const value = row + (col * 32);
                
                // Dec Spalte
                const decCell = tr.insertCell();
                decCell.textContent = value;
                decCell.className = 'ascii-dec';
                
                // Bin Spalte
                const binCell = tr.insertCell();
                binCell.textContent = value.toString(2).padStart(8, '0');
                binCell.className = 'ascii-bin';
                
                // Char Spalte
                const charCell = tr.insertCell();
                
                if (value < 32) {
                    // Steuerzeichen
                    charCell.className = 'ascii-control';
                    if (value === 0) { charCell.textContent = 'NULL'; }
                    else if (value === 1) { charCell.textContent = 'SOH'; }
                    else if (value === 2) { charCell.textContent = 'STX'; }
                    else if (value === 3) { charCell.textContent = 'ETX'; }
                    else if (value === 4) { charCell.textContent = 'EOT'; }
                    else if (value === 5) { charCell.textContent = 'ENQ'; }
                    else if (value === 6) { charCell.textContent = 'ACK'; }
                    else if (value === 7) { charCell.textContent = 'BELL'; }
                    else if (value === 8) { charCell.textContent = 'BS'; }
                    else if (value === 9) { charCell.textContent = 'TAB'; }
                    else if (value === 10) { charCell.textContent = 'LF'; }
                    else if (value === 11) { charCell.textContent = 'VT'; }
                    else if (value === 12) { charCell.textContent = 'FF'; }
                    else if (value === 13) { charCell.textContent = 'CR'; }
                    else if (value === 14) { charCell.textContent = 'SO'; }
                    else if (value === 15) { charCell.textContent = 'SI'; }
                    else if (value === 16) { charCell.textContent = 'DLE'; }
                    else if (value === 17) { charCell.textContent = 'DC1'; }
                    else if (value === 18) { charCell.textContent = 'DC2'; }
                    else if (value === 19) { charCell.textContent = 'DC3'; }
                    else if (value === 20) { charCell.textContent = 'DC4'; }
                    else if (value === 21) { charCell.textContent = 'NAK'; }
                    else if (value === 22) { charCell.textContent = 'SYN'; }
                    else if (value === 23) { charCell.textContent = 'ETB'; }
                    else if (value === 24) { charCell.textContent = 'CAN'; }
                    else if (value === 25) { charCell.textContent = 'EM'; }
                    else if (value === 26) { charCell.textContent = 'SUB'; }
                    else if (value === 27) { charCell.textContent = 'ESC'; }
                    else if (value === 28) { charCell.textContent = 'FS'; }
                    else if (value === 29) { charCell.textContent = 'GS'; }
                    else if (value === 30) { charCell.textContent = 'RS'; }
                    else if (value === 31) { charCell.textContent = 'US'; }
                } else if (value === 32) {
                    charCell.className = 'ascii-special';
                    charCell.textContent = 'Space';
                } else if (value >= 48 && value <= 57) {
                    // Ziffern
                    charCell.className = 'ascii-digit';
                    charCell.textContent = String.fromCharCode(value);
                } else if ((value >= 65 && value <= 90) || (value >= 97 && value <= 122)) {
                    // Buchstaben
                    charCell.className = 'ascii-letter';
                    charCell.textContent = String.fromCharCode(value);
                } else if (value === 127) {
                    charCell.className = 'ascii-control';
                    charCell.textContent = 'DEL';
                } else if (value <= 127) {
                    // Sonderzeichen
                    charCell.className = 'ascii-special';
                    charCell.textContent = String.fromCharCode(value);
                } else {
                    // Außerhalb des ASCII-Bereichs
                    charCell.className = 'ascii-extended';
                    charCell.textContent = '—';
                }
            }
        }
    }

    showAsciiTable() {
        document.getElementById('ascii-table-modal').classList.add('active');
    }

    hideAsciiTable() {
        document.getElementById('ascii-table-modal').classList.remove('active');
    }

    // Hint System
    showHint(type) {
        const hints = {
            bits: "Ein Bit ist die kleinste Informationseinheit im Computer - es kann nur 0 oder 1 sein, wie ein Lichtschalter der an oder aus ist. 8 Bits zusammen nennt man ein Byte!",
            switches: "Diese Schalter zeigen, wie Computer funktionieren: Jeder Schalter kann nur AN (1) oder AUS (0) sein - genau wie die winzigen elektronischen Schalter im Computer. Sie lassen entweder Strom fließen, oder eben nicht. Das ist alles was der Computer braucht um Buchstaben und Zahlen zu codieren.",
            output: "Hier siehst du, was Menschen verstehen können! Der Computer wandelt die 0en und 1en in Buchstaben, Zahlen oder andere Zeichen um, die wir lesen können. Dazu nutzt er den ASCII-Code aus der Tabelle. Dort schaut er nach wenn er ein Byte bekommt.",
            dezimalwerte: "Diese Zahlen zeigen, wie viel jede Position wert ist. Computer rechnen mit dem Zweiersystem - jede Position ist doppelt so viel wert wie die nächste!",
            zweierpotenzen: "Das sind Potenzen von 2! Jede Position hat einen anderen Wert: 2⁰=1, 2¹=2, 2²=4, 2³=8... Das ist die Mathematik hinter dem Binärsystem!",
            graustufen: "Dieselben Bits können auch Farben darstellen! Hier siehst du, wie hell oder dunkel ein Grauton wäre - 0 ist schwarz, 255 ist weiß!",
            dezimalausgabe: "Das ist die Dezimalzahl, die deine Bit-Kombination darstellt. Computer können dieselben Bits auf verschiedene Weise interpretieren!",
            binärausgabe: "Das ist die Binärdarstellung deiner Bits als Zahlenfolge. So 'sieht' der Computer deine Eingabe: nur 0en und 1en!"
        };

        const content = hints[type] || "Hier könnte ein Hinweis stehen!";
        document.getElementById('hint-content').textContent = content;
        document.getElementById('hint-modal').classList.add('active');
        
        // Byte Animation beim Hint zeigen
        const hintByte = document.getElementById('hint-byte');
        if (hintByte) {
            hintByte.classList.add('celebrating');
            setTimeout(() => {
                hintByte.classList.remove('celebrating');
            }, 600);
        }
        
        // Store the current hint type for tracking when modal is closed
        this.currentHintType = type;
    }

    hideHint() {
        document.getElementById('hint-modal').classList.remove('active');
        
        // Track that this hint was viewed for mission purposes when modal is closed
        if (this.currentHintType) {
            this.hintsViewed.add(this.currentHintType);
            this.checkMission(); // Check if viewing this hint completes a mission
            this.currentHintType = null; // Reset
        }
    }

    // Mission System
    createMissionButtons() {
        const buttonsContainer = document.getElementById('mission-buttons');
        
        this.missions.forEach((mission, index) => {
            const button = document.createElement('button');
            button.className = 'mission-btn';
            button.dataset.mission = index;
            button.title = `Mission ${index + 1}`;
            
            // Set initial state
            if (index === 0) {
                button.classList.add('current');
                button.textContent = index + 1;
            } else {
                button.classList.add('locked');
                button.textContent = index + 1;
            }
            
            buttonsContainer.appendChild(button);
        });
    }

    updateMissionButtons() {
        const buttons = document.querySelectorAll('.mission-btn');
        
        buttons.forEach((button, index) => {
            // Reset classes
            button.classList.remove('completed', 'current', 'locked');
            
            if (this.completedMissions.has(index)) {
                button.classList.add('completed');
                button.textContent = ''; // Haken wird über CSS eingefügt
                
                // Füge Hover-Tooltip mit binärer Lösung hinzu
                const mission = this.missions[index];
                const targetValue = this.getMissionTargetValue(mission);
                if (targetValue !== null) {
                    const binaryValue = targetValue.toString(2).padStart(8, '0');
                    const character = targetValue >= 32 && targetValue <= 126 ? String.fromCharCode(targetValue) : 'Steuerzeichen';
                    button.title = `✓ Mission ${index + 1} gelöst\nZeichen: '${character}'\nDezimal: ${targetValue}\nBinär: ${binaryValue}\n\n💬 Erklärung:\n${mission.success}`;
                } else {
                    // Für Hint-Missionen ohne ASCII-Wert
                    button.title = `✓ Mission ${index + 1} gelöst\nHinweis erfolgreich gelesen!\n\n💬 Erklärung:\n${mission.success}`;
                }
            } else if (index === this.currentMission) {
                button.classList.add('current');
                button.textContent = index + 1;
                button.title = `Mission ${index + 1} - Aktuell`;
            } else if (index <= this.getMaxUnlockedMission()) {
                // Unlocked but not current
                button.textContent = index + 1;
                button.title = `Mission ${index + 1} - Verfügbar`;
            } else {
                button.classList.add('locked');
                button.textContent = index + 1;
                button.title = `Mission ${index + 1} - Gesperrt`;
            }
        });
    }

    getMissionTargetValue(mission) {
        // Extrahiere den Zielwert aus der Mission-Check-Funktion
        const checkString = mission.check.toString();
        const match = checkString.match(/this\.currentValue === (\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    getMaxUnlockedMission() {
        // Finde die höchste freigeschaltete Mission
        let maxUnlocked = 0;
        for (let i = 0; i < this.missions.length; i++) {
            if (this.completedMissions.has(i)) {
                maxUnlocked = Math.max(maxUnlocked, i + 1);
            }
        }
        return Math.min(maxUnlocked, this.missions.length - 1);
    }

    selectMission(missionIndex) {
        const maxUnlocked = this.getMaxUnlockedMission();
        
        // Erlaube Auswahl von Mission 0, abgeschlossenen Missionen und der nächsten freigeschalteten Mission
        if (missionIndex === 0 || this.completedMissions.has(missionIndex) || missionIndex <= maxUnlocked) {
            this.currentMission = missionIndex;
            this.updateMission();
            this.updateMissionButtons();
        }
    }

    updateMission() {
        if (this.currentMission < this.missions.length) {
            document.getElementById('mission-content').textContent = this.missions[this.currentMission].text;
        } else {
            document.getElementById('mission-content').textContent = "🎉 Alle Missionen erfüllt! Du bist jetzt ein ASCII-Experte!";
        }
        this.updateMissionButtons();
        this.updateHelpButtonVisibility();
    }

    checkMission() {
        // Wenn alle Missionen abgeschlossen sind, keine weiteren Checks/Animationen ausführen
        if (this.completedMissions.size >= this.missions.length) {
            return;
        }

        if (this.currentMission < this.missions.length) {
            const mission = this.missions[this.currentMission];
            // Nur beim ersten Erfüllen der Mission Erfolg anzeigen
            if (mission.check() && !this.completedMissions.has(this.currentMission)) {
                this.completedMissions.add(this.currentMission);
                this.showMissionSuccess(mission.success);
            }
        }
        
        // Spezielle Behandlung für die finale Mission (automatisch erfüllen wenn vorherige Mission abgeschlossen)
        const finalMissionIndex = this.missions.length - 1;
        if (this.currentMission === finalMissionIndex - 1 &&
            this.completedMissions.has(finalMissionIndex - 1) &&
            !this.completedMissions.has(finalMissionIndex)) {
            // Automatisch zur finalen Mission wechseln und erfüllen
            setTimeout(() => {
                // Doppelte Ausführung verhindern
                if (!this.completedMissions.has(finalMissionIndex)) {
                    this.currentMission = finalMissionIndex;
                    this.completedMissions.add(finalMissionIndex);
                    this.updateMission();
                    this.showMissionSuccess(this.missions[finalMissionIndex].success);
                }
            }, 1000);
        }
    }

    showMissionSuccess(message) {
        const mission = this.missions[this.currentMission];
        const timer = mission.timer || 3; // Standard 3 Sekunden
        
        document.getElementById('mission-result').textContent = message;
        document.getElementById('mission-modal').classList.add('active');
        
        // Byte Animation bei Mission Success
        const missionByte = document.getElementById('mission-byte');
        missionByte.classList.add('celebrating');
        setTimeout(() => {
            missionByte.classList.remove('celebrating');
        }, 600);
        
        // Verstecke den Weiter-Button und zeige Progress Bar
        const continueBtn = document.getElementById('continue-mission');
        continueBtn.style.display = 'none';
        
        // Progress Bar erstellen
        const progressContainer = document.createElement('div');
        progressContainer.id = 'mission-progress-container';
        progressContainer.style.cssText = `
            width: 100%;
            height: 8px;
            background-color: var(--border-color);
            border-radius: 4px;
            margin: 20px 0;
            overflow: hidden;
            position: relative;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.id = 'mission-progress-bar';
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            border-radius: 4px;
            transition: width 0.1s ease;
            box-shadow: 0 0 10px var(--accent-color);
        `;
        
        progressContainer.appendChild(progressBar);
        continueBtn.parentNode.insertBefore(progressContainer, continueBtn);
        
        // Progress animation
        let progress = 0;
        const increment = 100 / (timer * 10); // 10 Updates pro Sekunde
        
        const progressInterval = setInterval(() => {
            progress += increment;
            progressBar.style.width = Math.min(progress, 100) + '%';
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                progressContainer.remove();
                continueBtn.style.display = 'block';
            }
        }, 100);
        
        // Konfetti für Mission 15 (Index 14, Ende der ASCII-Missionen) und letzte Mission
        if (this.currentMission === 14 || this.currentMission === this.missions.length - 1) {
            this.showConfetti();
        }
    }

    showConfetti() {
        // Extra Byte Animation bei Confetti
        const missionByte = document.getElementById('mission-byte');
        if (missionByte) {
            missionByte.classList.add('celebrating');
            // Erweiterte Animation für besondere Erfolge
            setTimeout(() => {
                missionByte.classList.remove('celebrating');
                missionByte.classList.add('celebrating');
            }, 300);
            setTimeout(() => {
                missionByte.classList.remove('celebrating');
            }, 1200);
        }
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.innerHTML = ['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)];
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-50px';
                confetti.style.fontSize = '20px';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '10000';
                confetti.style.animation = 'confetti-fall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }

    nextMission() {
        document.getElementById('mission-modal').classList.remove('active');
        
        // Springe zur nächsten unvollständigen Mission oder bleibe bei der aktuellen
        let nextMission = this.currentMission;
        for (let i = this.currentMission + 1; i < this.missions.length; i++) {
            if (!this.completedMissions.has(i)) {
                nextMission = i;
                break;
            }
        }
        
        this.currentMission = nextMission;
        this.updateMission();
    }

    // Help System
    updateHelpButtonVisibility() {
        const helpBtn = document.getElementById('mission-help-btn');
        // Button ab Mission 20 (Index 20, das ist "Lasse dir die Dezimalzahl 8 anzeigen!")
        if (this.currentMission >= 20) {
            helpBtn.classList.remove('hidden');
        } else {
            helpBtn.classList.add('hidden');
        }
    }

    showHelpRequest() {
        document.getElementById('help-request-modal').classList.add('active');
        
        // Byte "denkt nach" Animation
        const helpByte = document.getElementById('help-request-byte');
        if (helpByte && helpByte.querySelector('img')) {
            helpByte.querySelector('img').src = 'Byte_mascot/Byte_Thinking.png';
        }
        
        // Reset button states
        document.getElementById('help-yes').style.display = 'block';
        document.getElementById('help-no').style.display = 'block';
        document.getElementById('help-progress-container').style.display = 'none';
    }

    hideHelpRequest() {
        document.getElementById('help-request-modal').classList.remove('active');
    }

    startHelpTimer() {
        // Hide buttons and show progress
        document.getElementById('help-yes').style.display = 'none';
        document.getElementById('help-no').style.display = 'none';
        
        const progressContainer = document.getElementById('help-progress-container');
        progressContainer.style.display = 'block';
        progressContainer.innerHTML = `
            <div style="width: 100%; height: 8px; background-color: var(--border-color); border-radius: 4px; margin: 20px 0; overflow: hidden;">
                <div id="help-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--primary-color), var(--accent-color)); border-radius: 4px; transition: width 0.1s ease;"></div>
            </div>
            <p>Bereite die Erklärung vor... ⏳</p>
        `;

        // Progress animation
        let progress = 0;
        const increment = 100 / 50; // 5 Sekunden, 10 Updates pro Sekunde
        
        const progressInterval = setInterval(() => {
            progress += increment;
            const progressBar = document.getElementById('help-progress-bar');
            if (progressBar) {
                progressBar.style.width = Math.min(progress, 100) + '%';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.hideHelpRequest();
                this.showHelpExplanation();
            }
        }, 100);
    }

    showHelpExplanation() {
        const mission = this.missions[this.currentMission];
        const targetValue = this.getMissionTargetValue(mission);
        
        if (targetValue !== null) {
            const explanation = this.generateHelpExplanation(targetValue);
            document.getElementById('help-explanation-content').innerHTML = explanation;
            document.getElementById('help-explanation-modal').classList.add('active');
            
            // Byte wechselt zu "erklärend" und animiert
            const explanationByte = document.getElementById('help-explanation-byte');
            if (explanationByte && explanationByte.querySelector('img')) {
                explanationByte.querySelector('img').src = 'Byte_mascot/Byte_Happy.png';
                explanationByte.classList.add('celebrating');
                setTimeout(() => {
                    explanationByte.classList.remove('celebrating');
                }, 600);
            }
        }
    }

    hideHelpExplanation() {
        document.getElementById('help-explanation-modal').classList.remove('active');
    }

    generateHelpExplanation(targetValue) {
        const binaryString = targetValue.toString(2).padStart(8, '0');
        const steps = [];
        
        // Analyse welche Bits gesetzt werden müssen
        const setBits = [];
        for (let i = 0; i < 8; i++) {
            if (binaryString[7 - i] === '1') {
                setBits.push({
                    position: i,
                    value: Math.pow(2, i),
                    label: `Bit ${i}`
                });
            }
        }

        let explanation = `
            <h4>🎯 Ziel: Dezimalzahl ${targetValue} einstellen</h4>
            <p>Du musst die Schalter so umschalten, dass zusammen ${targetValue} herauskommt!</p>
        `;

        if (setBits.length === 1) {
            const bit = setBits[0];
            explanation += `
                <div class="step">
                    <span class="step-number">1️⃣</span>
                    <strong>Schalte nur einen Schalter ein:</strong><br>
                    Schalte ${bit.label} EIN (nach oben). Das ist der Schalter mit dem Wert ${bit.value}.<br>
                    Alle anderen Schalter bleiben AUS (nach unten).
                </div>
                <p>🧮 <strong>Rechnung:</strong> ${bit.value} = ${targetValue}</p>
            `;
        } else {
            explanation += `
                <div class="step">
                    <span class="step-number">1️⃣</span>
                    <strong>Schalte diese Schalter EIN (nach oben):</strong><br>
            `;
            
            setBits.forEach((bit, index) => {
                explanation += `• ${bit.label} (Wert: ${bit.value})`;
                if (index < setBits.length - 1) explanation += '<br>';
            });
            
            explanation += `
                </div>
                <div class="step">
                    <span class="step-number">2️⃣</span>
                    <strong>Alle anderen Schalter bleiben AUS (nach unten)</strong>
                </div>
            `;
            
            const calculation = setBits.map(bit => bit.value).join(' + ');
            explanation += `<p>🧮 <strong>Rechnung:</strong> ${calculation} = ${targetValue}</p>`;
        }

        explanation += `
            <div class="step">
                <span class="step-number">💡</span>
                <strong>Tipp:</strong> 
                Schaue dir die Dezimalwerte unter den Schaltern an! 
                Du musst die Zahlen finden, die zusammen ${targetValue} ergeben.
            </div>
        `;

        return explanation;
    }

    // Method to demonstrate specific educational examples
    showExample(type) {
        switch(type) {
            case 'letters':
                // Show A-Z sequence
                let current = 65; // 'A'
                const letterInterval = setInterval(() => {
                    this.setValue(current);
                    current++;
                    if (current > 90) { // 'Z'
                        clearInterval(letterInterval);
                    }
                }, 500);
                break;
                
            case 'powers':
                // Show powers of 2
                const powers = [1, 2, 4, 8, 16, 32, 64, 128];
                let powerIndex = 0;
                const powerInterval = setInterval(() => {
                    this.setValue(powers[powerIndex]);
                    powerIndex++;
                    if (powerIndex >= powers.length) {
                        clearInterval(powerInterval);
                    }
                }, 800);
                break;
                
            case 'count':
                // Count from 0 to 255
                let count = 0;
                const countInterval = setInterval(() => {
                    this.setValue(count);
                    count++;
                    if (count > 255) {
                        clearInterval(countInterval);
                    }
                }, 100);
                break;
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new BinaryAsciiVisualizer();
    
    // Make it globally accessible for debugging/educational purposes
    window.binaryVisualizer = visualizer;
    
    // Add keyboard shortcuts for educational demonstrations
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    visualizer.showExample('letters');
                    break;
                case '2':
                    e.preventDefault();
                    visualizer.showExample('powers');
                    break;
                case '3':
                    e.preventDefault();
                    visualizer.showExample('count');
                    break;
                case '0':
                    e.preventDefault();
                    visualizer.setValue(0);
                    break;
            }
        }
    });
    
    // Add helpful console message for teachers
    console.log(`
🎓 Binär-ASCII-Visualizer geladen!

Tastenkürzel für Demonstrationen:
- Strg+1: Buchstaben A-Z zeigen
- Strg+2: Zweierpotenzen zeigen  
- Strg+3: Von 0 bis 255 zählen
- Strg+0: Reset auf 0

Verfügbare Methoden:
- binaryVisualizer.setValue(zahl) - Setzt einen bestimmten Wert
- binaryVisualizer.getBitRepresentation() - Zeigt aktuelle Bit-Darstellung
- binaryVisualizer.showExample('letters'|'powers'|'count') - Demonstrationen

Beispiel: binaryVisualizer.setValue(72) setzt den Wert auf 'H'
    `);
});

// Add some helpful global functions for educational use
window.setBinary = function(binaryString) {
    if (!/^[01]{1,8}$/.test(binaryString)) {
        console.error('Bitte geben Sie eine gültige Binärzahl mit maximal 8 Stellen ein (nur 0 und 1)');
        return;
    }
    const decimal = parseInt(binaryString, 2);
    window.binaryVisualizer.setValue(decimal);
};

window.setCharacter = function(char) {
    if (typeof char !== 'string' || char.length !== 1) {
        console.error('Bitte geben Sie genau ein Zeichen ein');
        return;
    }
    const ascii = char.charCodeAt(0);
    if (ascii > 255) {
        console.error('Zeichen ist nicht im ASCII-Bereich (0-255)');
        return;
    }
    window.binaryVisualizer.setValue(ascii);
};

// Export for potential future module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BinaryAsciiVisualizer;
}
