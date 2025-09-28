class MemoryVisualizer {
    constructor() {
        this.files = [];
        this.media = [];
        this.currentMission = 0;
        this.completedMissions = new Set();
        this.selectedFileType = 'text'; // Default file type
        this.simulationState = {
            active: false,
            currentMediaIndex: -1,
            filledSpace: 0
        };
        
        // Mission definitions adapted from the binary visualizer
        this.missions = [
            {
                text: "📱 Schritt-für-Schritt:\n\n1️⃣ Öffne die Galerie auf deinem Handy ODER öffne die Kamera-App und schieße ein beliebiges Foto\n\n2️⃣ Gehe zur Galerie und wähle das Foto aus\n\n3️⃣ Tippe auf 'Details' oder das ℹ️-Symbol\n\n4️⃣ Notiere dir die Dateigröße (z.B. 5,3 MB)\n\n5️⃣ Erstelle hier eine Bilddatei mit genau dieser Größe!",
                check: () => this.files.length > 0 && this.files.some(f => f.type === 'image'),
                success: "Super! Du hast dein erstes digitales Foto erfasst! Jetzt siehst du, wie viel Speicher ein einziges Bild braucht. Diese Information muss im Arbeitsplatz festgehalten werden!",
                timer: 6
            },
            {
                text: "💿 Jetzt Speichermedium hinzufügen!\n\n1️⃣ Stehe auf und schaue dir eine echte CD genau an\n\n2️⃣ Finde die Speicherkapazität auf der CD-Hülle oder der CD selbst (meist steht dort '700 MB' oder '650 MB')\n\n3️⃣ Füge die CD mit der korrekten Kapazität als Speichermedium hinzu!",
                check: () => this.media.length > 0,
                success: "Perfekt! Jetzt siehst du, wie viele deiner Dateien auf eine CD passen würden! Die CD hat standardmäßig 700 MB Speicherplatz.",
                timer: 6
            },
            {
                text: "🎵 Füge jetzt eine Musikdatei hinzu! Schaue in deiner Musik-App nach der Größe eines Songs und trage sie ein. Tipp: Ein typischer Song hat etwa 3-5 MB.",
                check: () => this.files.some(f => f.type === 'music'),
                success: "Toll! Musikdateien sind oft viel größer als Textdateien. Das merkst du bestimmt schon!",
                timer: 5
            },
            {
                text: "🎯 Experimentiere mit der Simulation! Klicke auf 'CD füllen' und schaue, wie sich der Balken füllt!",
                check: () => this.simulationState.filledSpace > 0,
                success: "Großartig! Du siehst jetzt live, wie Speicher gefüllt wird!",
                timer: 4
            },
            {
                text: "📱 Füge eine weitere Datei hinzu - diesmal eine Textdatei! Wie groß ist wohl ein einfacher Brief?",
                check: () => this.files.some(f => f.type === 'text'),
                success: "Interessant! Textdateien sind meist winzig im Vergleich zu Bildern und Musik!",
                timer: 4
            },
            {
                text: "🎬 Jetzt wird's spannend! Füge ein Video hinzu. Schaue nach, wie groß eine Videodatei auf deinem Handy ist!",
                check: () => this.files.some(f => f.type === 'video'),
                success: "Wow! Videos brauchen enorm viel Speicher - viel mehr als alles andere!",
                timer: 5
            },
            {
                text: "� Zeit für das nächste Speichermedium! Jetzt kannst du eine DVD hinzufügen. Finde heraus, wie viel Speicher eine DVD hat!",
                check: () => this.media.length > 1,
                success: "Fantastisch! Siehst du, wie sich alle Balken automatisch anpassen? Größere Medien lassen die anderen kleiner erscheinen!",
                timer: 6
            },
            {
                text: "🏆 Abschluss-Challenge! Du bist jetzt ein Speicher-Experte! Experimentiere frei mit verschiedenen Dateien und Medien. Probiere die Simulation mit verschiedenen Speichermedien aus und entdecke die Unterschiede!",
                check: () => this.files.length >= 4 && this.media.length >= 2,
                success: "🎉 Herzlichen Glückwunsch! Du verstehst jetzt perfekt, wie unterschiedlich groß Dateien und Speichermedien sind! Du bist ein wahrer Speicher-Meister! 🏆",
                timer: 8
            }
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.createMissionButtons();
        this.updateVisualization();
        this.updateMission();
    }

    bindEvents() {
        // File type selection
        const fileTypeButtons = document.querySelectorAll('.file-type-btn');
        fileTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectFileType(e.target.dataset.type));
        });

        // File management
        document.getElementById('add-file-btn').addEventListener('click', () => this.addFile());
        document.getElementById('file-size').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addFile();
        });
        
        // Media management
        document.getElementById('add-media-btn').addEventListener('click', () => this.addMedia());
        document.getElementById('media-capacity').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMedia();
        });
        
        // Mission system
        document.getElementById('continue-mission').addEventListener('click', () => this.nextMission());
        document.getElementById('mission-help-btn').addEventListener('click', () => this.showHelpRequest());
        document.getElementById('help-yes').addEventListener('click', () => this.showHelp());
        document.getElementById('help-no').addEventListener('click', () => this.hideHelpRequest());
        document.getElementById('close-help-explanation').addEventListener('click', () => this.hideHelp());
    }

    // File type selection
    selectFileType(type) {
        this.selectedFileType = type;
        
        // Update button states
        document.querySelectorAll('.file-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
    }

    // Mission System (adapted from binary visualizer)
    createMissionButtons() {
        const container = document.getElementById('mission-buttons');
        container.innerHTML = '';

        this.missions.forEach((mission, index) => {
            const button = document.createElement('button');
            button.className = 'mission-btn';
            button.textContent = index + 1;
            button.title = `Mission ${index + 1}`;
            
            // Set button state
            if (index === this.currentMission) {
                button.classList.add('current');
            } else if (this.completedMissions.has(index)) {
                button.classList.add('completed');
            } else if (index > this.getMaxUnlockedMission()) {
                button.classList.add('locked');
            }
            
            if (!button.classList.contains('locked')) {
                button.addEventListener('click', () => this.selectMission(index));
            }

            container.appendChild(button);
        });
    }

    getMaxUnlockedMission() {
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
        
        if (missionIndex === 0 || this.completedMissions.has(missionIndex) || missionIndex <= maxUnlocked) {
            this.currentMission = missionIndex;
            this.updateMission();
            this.createMissionButtons();
        }
    }

    updateMission() {
        if (this.currentMission < this.missions.length) {
            document.getElementById('mission-content').innerHTML = this.missions[this.currentMission].text.replace(/\n/g, '<br>');
            document.getElementById('mission-counter').textContent = `${this.currentMission + 1} / ${this.missions.length}`;
        } else {
            document.getElementById('mission-content').textContent = "🎉 Alle Missionen erfüllt! Du bist jetzt ein Speicher-Experte!";
        }
        
        this.createMissionButtons();
        this.updateHelpButtonVisibility();
    }

    checkMission() {
        if (this.completedMissions.size >= this.missions.length) {
            return;
        }

        if (this.currentMission < this.missions.length) {
            const mission = this.missions[this.currentMission];
            if (mission.check() && !this.completedMissions.has(this.currentMission)) {
                this.completedMissions.add(this.currentMission);
                this.showMissionSuccess(mission.success, mission.timer);
            }
        }
    }

    showMissionSuccess(message, timer = 3) {
        document.getElementById('mission-result').textContent = message;
        document.getElementById('mission-modal').classList.add('active');
        
        // Byte Animation
        const missionByte = document.getElementById('mission-success-byte');
        missionByte.classList.add('celebrating');
        setTimeout(() => {
            missionByte.classList.remove('celebrating');
        }, 600);
        
        // Show confetti for final mission
        if (this.currentMission === this.missions.length - 1) {
            this.showConfetti();
        }
    }

    showConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.innerHTML = ['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)];
                confetti.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}vw;
                    top: -50px;
                    font-size: 20px;
                    pointer-events: none;
                    z-index: 10000;
                    animation: confetti-fall 3s linear forwards;
                `;
                
                // Add confetti animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes confetti-fall {
                        to {
                            transform: translateY(100vh) rotate(360deg);
                            opacity: 0;
                        }
                    }
                `;
                if (!document.querySelector('style[data-confetti]')) {
                    style.setAttribute('data-confetti', 'true');
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 100);
        }
    }

    nextMission() {
        document.getElementById('mission-modal').classList.remove('active');
        
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

    updateHelpButtonVisibility() {
        const helpBtn = document.getElementById('mission-help-btn');
        if (this.currentMission >= 3) { // Show help from mission 4 onwards
            helpBtn.classList.remove('hidden');
        } else {
            helpBtn.classList.add('hidden');
        }
    }

    showHelpRequest() {
        document.getElementById('help-request-modal').classList.add('active');
    }

    hideHelpRequest() {
        document.getElementById('help-request-modal').classList.remove('active');
    }

    showHelp() {
        this.hideHelpRequest();
        let helpText = "Hier sind einige Tipps für diese Mission:\n\n";
        
        const mission = this.missions[this.currentMission];
        if (this.currentMission === 0) {
            helpText = "📱 Öffne deine Foto-App auf dem Handy und schaue bei den Details eines Fotos nach der Dateigröße. Diese findest du meist in den Eigenschaften oder Informationen des Bildes.";
        } else if (this.currentMission === 1) {
            helpText = "🎵 Öffne deine Musik-App und schaue bei den Details eines Songs nach. Die Dateigröße steht meist bei den Eigenschaften oder Informationen.";
        } else if (this.currentMission === 2) {
            helpText = "💿 Eine CD hat normalerweise 650-700 MB Speicherplatz. Du kannst auch auf der CD selbst nachschauen - dort steht oft die Kapazität drauf!";
        } else if (this.currentMission === 3) {
            helpText = "🎯 Klicke auf den Button 'CD füllen' unter der Visualisierung. Du siehst dann, wie sich der Balken der CD langsam füllt!";
        } else {
            helpText = "💡 Experimentiere mit verschiedenen Dateitypen und Größen. Beobachte, wie sich die Visualisierung ändert!";
        }
        
        document.getElementById('help-explanation-content').innerHTML = `<p>${helpText}</p>`;
        document.getElementById('help-explanation-modal').classList.add('active');
    }

    hideHelp() {
        document.getElementById('help-explanation-modal').classList.remove('active');
    }

    // File Management System
    addFile() {
        const type = this.selectedFileType;
        const size = parseFloat(document.getElementById('file-size').value);
        const unit = document.getElementById('file-unit').value;

        if (!size || size <= 0) {
            this.showError('Bitte gib eine gültige Dateigröße ein.');
            return;
        }

        const sizeInBytes = this.convertToBytes(size, unit);
        
        // Validate realistic file sizes
        if (!this.validateFileSize(type, sizeInBytes, size, unit)) {
            return; // Validation failed, error message already shown
        }

        const file = {
            id: Date.now(),
            name: this.generateFileName(type),
            type,
            size: sizeInBytes,
            displaySize: this.formatSize(sizeInBytes),
            originalSize: size,
            originalUnit: unit
        };

        this.files.push(file);
        this.renderFileList();
        this.updateVisualization();
        this.clearFileInputs();
        this.checkMission(); // Check if mission is completed
        
        // Animation
        setTimeout(() => {
            const newItem = document.querySelector(`[data-file-id="${file.id}"]`);
            if (newItem) newItem.classList.add('fade-in');
        }, 10);
    }

    validateFileSize(type, sizeInBytes, originalSize, originalUnit) {
        // Define realistic size ranges for different file types
        const sizeRanges = {
            image: { 
                min: 50 * 1024,      // 50 KB
                max: 50 * 1024 * 1024, // 50 MB
                typical: "100 KB - 10 MB"
            },
            text: { 
                min: 100,            // 100 Bytes
                max: 10 * 1024 * 1024, // 10 MB
                typical: "1 KB - 1 MB"
            },
            music: { 
                min: 500 * 1024,    // 500 KB
                max: 20 * 1024 * 1024, // 20 MB
                typical: "3 - 8 MB"
            },
            video: { 
                min: 1024 * 1024,   // 1 MB
                max: 10 * 1024 * 1024 * 1024, // 10 GB
                typical: "100 MB - 2 GB"
            }
        };

        const range = sizeRanges[type];
        if (!range) return true; // Unknown type, allow it

        if (sizeInBytes < range.min || sizeInBytes > range.max) {
            const fileTypeNames = {
                image: 'Bild',
                text: 'Textdatei',
                music: 'Musikdatei',
                video: 'Videodatei'
            };

            const confirmation = confirm(
                `🤔 Bist du sicher? ${originalSize} ${originalUnit.toUpperCase()} ist ungewöhnlich für eine ${fileTypeNames[type]}.\n\n` +
                `Typische Größe für ${fileTypeNames[type]}: ${range.typical}\n\n` +
                `Möchtest du die Datei trotzdem hinzufügen?`
            );

            return confirmation;
        }

        return true;
    }

    validateMediaCapacity(mediaType, capacityInBytes, originalCapacity, originalUnit) {
        // Define realistic capacity ranges for different media types
        const capacityRanges = {
            cd: { 
                min: 600 * 1024 * 1024,    // 600 MB
                max: 800 * 1024 * 1024,    // 800 MB
                typical: "650-700 MB"
            },
            dvd: { 
                min: 3.5 * 1024 * 1024 * 1024,  // 3.5 GB
                max: 9 * 1024 * 1024 * 1024,    // 9 GB
                typical: "4.7 GB"
            },
            usb: { 
                min: 128 * 1024 * 1024,    // 128 MB
                max: 1024 * 1024 * 1024 * 1024, // 1 TB
                typical: "4 GB - 128 GB"
            },
            smartphone: { 
                min: 16 * 1024 * 1024 * 1024,   // 16 GB
                max: 1024 * 1024 * 1024 * 1024, // 1 TB
                typical: "64 GB - 512 GB"
            },
            hdd: { 
                min: 100 * 1024 * 1024 * 1024,  // 100 GB
                max: 20 * 1024 * 1024 * 1024 * 1024, // 20 TB
                typical: "500 GB - 4 TB"
            },
            floppy: { 
                min: 700 * 1024,          // 700 KB
                max: 3 * 1024 * 1024,     // 3 MB
                typical: "1.44 MB"
            }
        };

        const range = capacityRanges[mediaType];
        if (!range) return true; // Unknown type, allow it

        if (capacityInBytes < range.min || capacityInBytes > range.max) {
            const mediaNames = {
                cd: 'CD',
                dvd: 'DVD',
                usb: 'USB-Stick',
                smartphone: 'Handy-Speicher',
                hdd: 'Festplatte',
                floppy: 'Diskette'
            };

            const confirmation = confirm(
                `🤔 Bist du sicher? ${originalCapacity} ${originalUnit.toUpperCase()} ist ungewöhnlich für eine ${mediaNames[mediaType]}.\n\n` +
                `Typische Kapazität für ${mediaNames[mediaType]}: ${range.typical}\n\n` +
                `Möchtest du das Speichermedium trotzdem hinzufügen?`
            );

            return confirmation;
        }

        return true;
    }

    removeFile(fileId) {
        this.files = this.files.filter(file => file.id !== fileId);
        this.renderFileList();
        this.updateVisualization();
    }

    generateFileName(type) {
        const names = {
            text: ['Brief', 'Dokument', 'Notiz', 'Aufsatz'],
            image: ['Foto', 'Bild', 'Screenshot', 'Selfie'],
            music: ['Song', 'Musikstück', 'Audio', 'Track'],
            video: ['Video', 'Film', 'Clip', 'Aufnahme']
        };
        
        const typeNames = names[type] || ['Datei'];
        const randomName = typeNames[Math.floor(Math.random() * typeNames.length)];
        const fileCount = this.files.filter(f => f.type === type).length + 1;
        
        return `${randomName}_${fileCount}`;
    }

    renderFileList() {
        const container = document.getElementById('file-list');
        container.innerHTML = '';

        if (this.files.length === 0) {
            container.innerHTML = '<div class="no-data">Noch keine Dateien hinzugefügt</div>';
            return;
        }

        this.files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.setAttribute('data-file-id', file.id);
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${file.displaySize}</div>
                    <div class="file-type ${file.type}">${this.getTypeLabel(file.type)}</div>
                </div>
                <button class="remove-btn danger" onclick="visualizer.removeFile(${file.id})">
                    Entfernen
                </button>
            `;
            
            // Add tooltip
            fileItem.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, `${file.originalSize} ${file.originalUnit.toUpperCase()} = ${this.formatSize(file.size, true)}`);
            });
            
            fileItem.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            container.appendChild(fileItem);
        });
    }

    // Updated Media System for guided input
    addMedia() {
        const capacity = parseFloat(document.getElementById('media-capacity').value);
        const unit = document.getElementById('media-capacity-unit').value;

        if (!capacity || capacity <= 0) {
            this.showError('Bitte gib eine gültige Speicherkapazität ein.');
            return;
        }

        const capacityInBytes = this.convertToBytes(capacity, unit);
        
        // Determine media type and name based on current progression
        let mediaType, mediaName, imageSrc;
        if (this.media.length === 0) {
            // First medium is always CD
            mediaType = 'cd';
            mediaName = 'CD';
            imageSrc = 'images/cd.png';
            
            // Validate CD capacity
            if (!this.validateMediaCapacity(mediaType, capacityInBytes, capacity, unit)) {
                return; // Validation failed
            }
        } else {
            // Get the selected media type from the interface
            const selectedSection = document.getElementById('selected-media-input');
            if (selectedSection) {
                const selectedType = selectedSection.getAttribute('data-selected-type');
                if (selectedType) {
                    mediaType = selectedType;
                    mediaName = this.getMediaName(mediaType);
                    imageSrc = `images/${mediaType}.png`;
                } else {
                    // Fallback: determine by progression
                    mediaType = this.getMediaTypeByProgression();
                    mediaName = this.getMediaName(mediaType);
                    imageSrc = `images/${mediaType}.png`;
                }
            } else {
                // Fallback: determine by progression
                mediaType = this.getMediaTypeByProgression();
                mediaName = this.getMediaName(mediaType);
                imageSrc = `images/${mediaType}.png`;
            }
        }

        const medium = {
            id: Date.now(),
            name: mediaName,
            type: mediaType,
            capacity: capacityInBytes,
            displayCapacity: this.formatSize(capacityInBytes),
            used: 0,
            imageSrc
        };

        this.media.push(medium);
        this.sortMediaByCapacity();
        this.renderMediaList();
        this.updateVisualization();
        this.updateMediaInput(); // Update for next medium
        this.clearMediaInputs();
        this.checkMission(); // Check if mission is completed
        
        // Animation with scaling effect
        setTimeout(() => {
            this.animateMediaScaling();
            const newItem = document.querySelector(`[data-media-id="${medium.id}"]`);
            if (newItem) newItem.classList.add('fade-in');
        }, 10);
    }

    getMediaTypeByProgression() {
        // Progression: CD -> DVD -> Handy -> USB -> Festplatte -> Diskette
        const progression = ['cd', 'dvd', 'smartphone', 'usb', 'hdd', 'floppy'];
        return progression[this.media.length] || 'usb'; // fallback to usb
    }

    determineMediaType(capacityInBytes) {
        const gb = 1024 * 1024 * 1024;
        const mb = 1024 * 1024;
        
        if (capacityInBytes < 10 * mb) return 'floppy';
        if (capacityInBytes < 5 * gb) return 'cd';
        if (capacityInBytes < 10 * gb) return 'dvd';
        if (capacityInBytes < 200 * gb) return 'usb';
        if (capacityInBytes < 2000 * gb) return 'smartphone';
        return 'hdd';
    }

    getMediaName(type) {
        const names = {
            floppy: 'Diskette',
            cd: 'CD',
            dvd: 'DVD',
            usb: 'USB-Stick',
            smartphone: 'Handy',
            hdd: 'Festplatte'
        };
        return names[type] || 'Speichermedium';
    }

    updateMediaInput() {
        if (this.media.length === 1) {
            // After first CD, show DVD option
            const section = document.querySelector('.guided-media-section');
            section.innerHTML = `
                <div class="media-selection">
                    <p class="instruction-text">Großartig! Jetzt kannst du eine DVD hinzufügen:</p>
                    <div class="media-options">
                        <div class="media-option" onclick="visualizer.selectMediaType('dvd')">
                            <img src="images/dvd.png" alt="DVD" class="media-option-img">
                            <span>DVD</span>
                        </div>
                    </div>
                    <div class="media-input-section" id="selected-media-input" style="display: none;">
                        <div class="media-visual">
                            <img src="images/dvd.png" alt="Medium" class="media-image" id="selected-media-image">
                            <div class="media-label" id="selected-media-label">DVD</div>
                        </div>
                        <div class="capacity-input">
                            <input type="number" id="media-capacity" min="1" placeholder="Kapazität">
                            <select id="media-capacity-unit">
                                <option value="mb">Megabyte (MB)</option>
                                <option value="gb">Gigabyte (GB)</option>
                                <option value="tb">Terabyte (TB)</option>
                            </select>
                        </div>
                        <button id="add-media-btn">DVD hinzufügen</button>
                    </div>
                </div>
            `;
        } else if (this.media.length === 2) {
            // After DVD, show Handy option
            const section = document.querySelector('.guided-media-section');
            section.innerHTML = `
                <div class="media-selection">
                    <p class="instruction-text">Perfekt! Als nächstes kommt dein Handy:</p>
                    <div class="media-options">
                        <div class="media-option" onclick="visualizer.selectMediaType('smartphone')">
                            <img src="images/smartphone.png" alt="Handy" class="media-option-img">
                            <span>Handy</span>
                        </div>
                    </div>
                    <div class="media-input-section" id="selected-media-input" style="display: none;">
                        <div class="media-visual">
                            <img src="images/smartphone.png" alt="Medium" class="media-image" id="selected-media-image">
                            <div class="media-label" id="selected-media-label">Handy</div>
                        </div>
                        <div class="capacity-input">
                            <input type="number" id="media-capacity" min="1" placeholder="Kapazität">
                            <select id="media-capacity-unit">
                                <option value="gb">Gigabyte (GB)</option>
                                <option value="tb">Terabyte (TB)</option>
                            </select>
                        </div>
                        <button id="add-media-btn">Handy hinzufügen</button>
                    </div>
                </div>
            `;
        } else if (this.media.length === 3) {
            // After Handy, show USB-Stick option
            const section = document.querySelector('.guided-media-section');
            section.innerHTML = `
                <div class="media-selection">
                    <p class="instruction-text">Super! Jetzt kommt ein USB-Stick:</p>
                    <div class="media-options">
                        <div class="media-option" onclick="visualizer.selectMediaType('usb')">
                            <img src="images/usb.png" alt="USB-Stick" class="media-option-img">
                            <span>USB-Stick</span>
                        </div>
                    </div>
                    <div class="media-input-section" id="selected-media-input" style="display: none;">
                        <div class="media-visual">
                            <img src="images/usb.png" alt="Medium" class="media-image" id="selected-media-image">
                            <div class="media-label" id="selected-media-label">USB-Stick</div>
                        </div>
                        <div class="capacity-input">
                            <input type="number" id="media-capacity" min="1" placeholder="Kapazität">
                            <select id="media-capacity-unit">
                                <option value="gb">Gigabyte (GB)</option>
                                <option value="tb">Terabyte (TB)</option>
                            </select>
                        </div>
                        <button id="add-media-btn">USB-Stick hinzufügen</button>
                    </div>
                </div>
            `;
        } else if (this.media.length === 4) {
            // After USB-Stick, show Festplatte option
            const section = document.querySelector('.guided-media-section');
            section.innerHTML = `
                <div class="media-selection">
                    <p class="instruction-text">Toll! Jetzt eine große Festplatte:</p>
                    <div class="media-options">
                        <div class="media-option" onclick="visualizer.selectMediaType('hdd')">
                            <img src="images/hdd.png" alt="Festplatte" class="media-option-img">
                            <span>Festplatte</span>
                        </div>
                    </div>
                    <div class="media-input-section" id="selected-media-input" style="display: none;">
                        <div class="media-visual">
                            <img src="images/hdd.png" alt="Medium" class="media-image" id="selected-media-image">
                            <div class="media-label" id="selected-media-label">Festplatte</div>
                        </div>
                        <div class="capacity-input">
                            <input type="number" id="media-capacity" min="1" placeholder="Kapazität">
                            <select id="media-capacity-unit">
                                <option value="gb">Gigabyte (GB)</option>
                                <option value="tb">Terabyte (TB)</option>
                            </select>
                        </div>
                        <button id="add-media-btn">Festplatte hinzufügen</button>
                    </div>
                </div>
            `;
        } else if (this.media.length >= 5) {
            // Final bonus: Diskette
            const section = document.querySelector('.guided-media-section');
            section.innerHTML = `
                <div class="media-selection">
                    <p class="instruction-text">Bonus-Challenge! Die historische Diskette als Vergleich:</p>
                    <div class="media-options">
                        <div class="media-option" onclick="visualizer.selectMediaType('floppy')">
                            <img src="images/floppy.png" alt="Diskette" class="media-option-img">
                            <span>Diskette</span>
                        </div>
                    </div>
                    <div class="media-input-section" id="selected-media-input" style="display: none;">
                        <div class="media-visual">
                            <img src="images/floppy.png" alt="Medium" class="media-image" id="selected-media-image">
                            <div class="media-label" id="selected-media-label">Diskette</div>
                        </div>
                        <div class="capacity-input">
                            <input type="number" id="media-capacity" min="1" placeholder="Kapazität">
                            <select id="media-capacity-unit">
                                <option value="kb">Kilobyte (KB)</option>
                                <option value="mb">Megabyte (MB)</option>
                            </select>
                        </div>
                        <button id="add-media-btn">Diskette hinzufügen</button>
                    </div>
                </div>
            `;
        }
        
        // Re-bind the add media button event if it exists
        const addBtn = document.getElementById('add-media-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addMedia());
        }
    }

    selectMediaType(type) {
        const inputSection = document.getElementById('selected-media-input');
        const image = document.getElementById('selected-media-image');
        const label = document.getElementById('selected-media-label');
        
        image.src = `images/${type}.png`;
        label.textContent = this.getMediaName(type);
        inputSection.style.display = 'block';
        inputSection.setAttribute('data-selected-type', type);
        
        // Update button text
        const addBtn = document.getElementById('add-media-btn');
        addBtn.textContent = `${this.getMediaName(type)} hinzufügen`;
        
        // Scroll to input
        inputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    animateMediaScaling() {
        // Add scaling animation when new media is added
        const containers = document.querySelectorAll('.media-bar-container');
        containers.forEach(container => {
            const bar = container.querySelector('.media-bar');
            bar.classList.add('pulse');
            setTimeout(() => {
                bar.classList.remove('pulse');
            }, 500);
        });
    }

    removeMedia(mediaId) {
        this.media = this.media.filter(medium => medium.id !== mediaId);
        this.renderMediaList();
        this.updateVisualization();
        this.simulationState = {
            active: false,
            currentMediaIndex: -1,
            filledSpace: 0
        };
    }

    sortMediaByCapacity() {
        this.media.sort((a, b) => a.capacity - b.capacity);
    }

    renderMediaList() {
        const container = document.getElementById('media-list');
        container.innerHTML = '';

        if (this.media.length === 0) {
            container.innerHTML = '<div class="no-data">Noch keine Speichermedien hinzugefügt</div>';
            return;
        }

        this.media.forEach(medium => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-media-id', medium.id);
            
            mediaItem.innerHTML = `
                <div class="media-info">
                    <div class="media-visual-small">
                        <img src="${medium.imageSrc}" alt="${medium.name}" class="media-icon">
                    </div>
                    <div>
                        <div class="media-name">${medium.name}</div>
                        <div class="media-size">${medium.displayCapacity}</div>
                    </div>
                </div>
                <button class="remove-btn danger" onclick="visualizer.removeMedia(${medium.id})">
                    Entfernen
                </button>
            `;
            
            // Add tooltip
            mediaItem.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, `Kapazität: ${this.formatSize(medium.capacity, true)}`);
            });
            
            mediaItem.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            container.appendChild(mediaItem);
        });
    }

    // Visualization Engine with improved animations
    updateVisualization() {
        const container = document.getElementById('visualization-content');
        const noDataMessage = document.getElementById('no-data-message');
        const simulationControls = document.getElementById('simulation-controls');

        if (this.files.length === 0 || this.media.length === 0) {
            container.style.display = 'none';
            noDataMessage.style.display = 'flex';
            simulationControls.style.display = 'none';
            return;
        }

        noDataMessage.style.display = 'none';
        container.style.display = 'block';
        simulationControls.style.display = 'block';

        this.renderVisualization();
        this.updateSimulationControls();
    }

    renderVisualization() {
        const container = document.getElementById('visualization-content');
        container.innerHTML = '';

        if (this.media.length === 0) return;

        // Find maximum capacity for proportional scaling
        const maxCapacity = Math.max(...this.media.map(m => m.capacity));

        this.media.forEach((medium, index) => {
            const barContainer = document.createElement('div');
            barContainer.className = 'media-bar-container';
            
            // Calculate how many files fit
            const totalFileSize = this.files.reduce((sum, file) => sum + file.size, 0);
            const filesFit = totalFileSize > 0 ? Math.floor(medium.capacity / totalFileSize) : 0;
            
            // Only calculate used space if simulation is active for this medium
            let usedSpace = 0;
            let percentageFilled = 0;
            
            if (this.simulationState.active && this.simulationState.currentMediaIndex === index) {
                usedSpace = Math.min(this.simulationState.filledSpace, medium.capacity);
                percentageFilled = medium.capacity > 0 ? (usedSpace / medium.capacity) * 100 : 0;
            }
            
            // Proportional width based on capacity
            const proportionalWidth = (medium.capacity / maxCapacity) * 100;
            
            barContainer.innerHTML = `
                <div class="media-bar-header">
                    <div class="media-bar-name">
                        <img src="${medium.imageSrc}" alt="${medium.name}" class="media-bar-icon">
                        ${medium.name}
                    </div>
                    <div class="media-bar-capacity">${medium.displayCapacity}</div>
                </div>
                <div class="media-bar" style="width: ${proportionalWidth}%;">
                    <div class="media-bar-fill" style="width: ${percentageFilled}%;">
                        ${usedSpace > 0 ? `${this.formatSize(usedSpace)}` : ''}
                    </div>
                    <div class="media-bar-info">
                        ${this.formatSize(usedSpace)} / ${medium.displayCapacity}
                    </div>
                </div>
            `;
            
            // Add hover effects
            const bar = barContainer.querySelector('.media-bar');
            bar.addEventListener('mouseenter', (e) => {
                const detailedInfo = this.calculateDetailedFit(medium);
                this.showTooltip(e, detailedInfo);
            });
            
            bar.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            container.appendChild(barContainer);
        });
    }

    calculateDetailedFit(medium) {
        let info = `${medium.name} (${medium.displayCapacity}):\n`;
        
        this.files.forEach(file => {
            const fit = Math.floor(medium.capacity / file.size);
            info += `• ${file.name}: ${fit}× (${this.formatSize(file.size)} pro Datei)\n`;
        });
        
        const totalFileSize = this.files.reduce((sum, file) => sum + file.size, 0);
        const allFilesFit = totalFileSize > 0 ? Math.floor(medium.capacity / totalFileSize) : 0;
        info += `\nAlle Dateien zusammen: ${allFilesFit}× (${this.formatSize(totalFileSize)} gesamt)`;
        
        return info;
    }

    // Fixed Interactive Simulation - starts from 0%
    updateSimulationControls() {
        const buttonsContainer = document.querySelector('.simulation-buttons');
        buttonsContainer.innerHTML = '';

        this.media.forEach((medium, index) => {
            const button = document.createElement('button');
            button.textContent = `${medium.name} füllen`;
            button.onclick = () => this.startSimulation(index);
            buttonsContainer.appendChild(button);
        });
    }

    startSimulation(mediaIndex) {
        this.simulationState = {
            active: true,
            currentMediaIndex: mediaIndex,
            filledSpace: 0 // Start from 0
        };
        
        this.animateSimulation();
        this.checkMission(); // Check if mission is completed
    }

    animateSimulation() {
        if (!this.simulationState.active || this.files.length === 0) return;

        const medium = this.media[this.simulationState.currentMediaIndex];
        const totalFileSize = this.files.reduce((sum, file) => sum + file.size, 0);
        
        if (totalFileSize === 0) return;

        const maxFiles = Math.floor(medium.capacity / totalFileSize);
        const stepSize = Math.max(1, Math.ceil(maxFiles / 20)); // Smoother animation
        
        let currentStep = 0;
        
        const animate = () => {
            if (currentStep >= maxFiles || !this.simulationState.active) {
                this.simulationState.filledSpace = maxFiles * totalFileSize;
                this.updateSimulationVisualization();
                return;
            }
            
            currentStep = Math.min(currentStep + stepSize, maxFiles);
            this.simulationState.filledSpace = currentStep * totalFileSize;
            
            this.updateSimulationVisualization();
            
            if (currentStep < maxFiles) {
                setTimeout(animate, 150);
            }
        };
        
        animate();
    }

    updateSimulationVisualization() {
        const containers = document.querySelectorAll('.media-bar-container');
        const currentContainer = containers[this.simulationState.currentMediaIndex];
        
        if (!currentContainer) return;

        const medium = this.media[this.simulationState.currentMediaIndex];
        const fill = currentContainer.querySelector('.media-bar-fill');
        const info = currentContainer.querySelector('.media-bar-info');
        
        const percentage = (this.simulationState.filledSpace / medium.capacity) * 100;
        const totalFileSize = this.files.reduce((sum, file) => sum + file.size, 0);
        const fileCount = totalFileSize > 0 ? Math.floor(this.simulationState.filledSpace / totalFileSize) : 0;
        
        fill.style.width = `${percentage}%`;
        fill.textContent = fileCount > 0 ? `${fileCount}× alle Dateien` : '';
        info.textContent = `${this.formatSize(this.simulationState.filledSpace)} / ${medium.displayCapacity}`;
        
        // Add pulse effect
        currentContainer.querySelector('.media-bar').classList.add('pulse');
        setTimeout(() => {
            const bar = currentContainer.querySelector('.media-bar');
            if (bar) bar.classList.remove('pulse');
        }, 500);
    }

    // Fixed reset simulation
    // Utility Functions
    convertToBytes(size, unit) {
        const conversions = {
            byte: 1,
            kb: 1024,
            mb: 1024 * 1024,
            gb: 1024 * 1024 * 1024,
            tb: 1024 * 1024 * 1024 * 1024
        };
        
        return size * (conversions[unit] || 1);
    }

    formatSize(bytes, exact = false) {
        if (bytes === 0) return '0 Byte';
        
        const units = ['Byte', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const decimals = exact ? 0 : 2;
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = bytes / Math.pow(k, i);
        
        if (exact && i === 0) {
            return `${size.toLocaleString('de-DE')} ${units[i]}`;
        }
        
        return `${size.toFixed(decimals).replace('.', ',')} ${units[i]}`;
    }

    getTypeLabel(type) {
        const labels = {
            text: 'Text',
            image: 'Bild',
            music: 'Musik',
            video: 'Video'
        };
        
        return labels[type] || 'Datei';
    }

    clearFileInputs() {
        document.getElementById('file-size').value = '';
        document.getElementById('file-unit').selectedIndex = 0;
        // Don't reset file type - it stays selected via buttons
    }

    clearMediaInputs() {
        const capacityInput = document.getElementById('media-capacity');
        const unitInput = document.getElementById('media-capacity-unit');
        if (capacityInput) capacityInput.value = '';
        if (unitInput) unitInput.selectedIndex = 0;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-danger);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: var(--shadow);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        errorDiv.classList.add('fade-in');
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    showTooltip(event, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        // Ensure tooltip stays within viewport
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.left < 0) {
            tooltip.style.left = '8px';
            tooltip.style.transform = 'none';
        } else if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = `${window.innerWidth - tooltipRect.width - 8}px`;
            tooltip.style.transform = 'none';
        }
        
        setTimeout(() => tooltip.classList.add('visible'), 10);
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
}

// Initialize the application
const visualizer = new MemoryVisualizer();