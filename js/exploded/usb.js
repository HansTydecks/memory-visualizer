/* Explosionsansicht: USB-Stick (USB-A) – Maße in mm, Gehäuse ca. 45 × 18 × 8 */
(function () {
    const MV = window.MV;
    const { rrect } = MV.geo;
    const M = MV.MAT;
    const box = (x, y, w, d) => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];

    MV.exploded.usb = {
        title: 'USB-Stick',
        build() {
            const sc = new MV.Scene(4.3, 25);
            const CHIP_Z = 3, CHIP_EZ = 30, PCB_EZ = 18;

            sc.part({
                id: 'hsg-b', short: 'Untere Hülle aus Kunststoff.', name: 'Gehäuse unten', sub: 'Kunststoff',
                info: 'Untere Hälfte der Kunststoffhülle. Sie hält die Platine fest und schützt sie vor Stößen.',
                anchor: [22, 18, 2], side: 'L', explode: [0, 0, 0],
            }, (s) => s.prism(rrect(0, 0, 45, 18, 3), 0, 4, M.plastic, { hole: rrect(1.2, 1.2, 42.6, 15.6, 2), floorZ: 1 }));

            sc.part({
                id: 'pcb', short: 'Verbindet alle Bauteile mit feinen Kupferbahnen.', inner: true, name: 'Platine', sub: 'mit Kupferbahnen',
                info: 'Eine dünne Platte aus glasfaserverstärktem Kunststoff mit feinen Kupferbahnen. Wie ein Straßennetz verbinden sie Stecker, Controller und Speicherchip.',
                anchor: [9, 16, 2.5], side: 'L', explode: [0, 0, PCB_EZ],
            }, (s) => {
                let g = s.prism(box(1.5, 2, 42.5, 14), 2, 1, M.pcb);
                // Leiterbahnen
                const tr = [[[44, 5], [36, 5]], [[44, 7.5], [33, 7.5]], [[44, 10.5], [33, 10.5]], [[44, 13], [36, 13]], [[15, 9], [20, 9]], [[12, 6], [12, 4], [21, 4]], [[5, 12], [9, 12]]];
                tr.forEach((t) => { for (let i = 0; i < t.length - 1; i++) g += s.line3([t[i][0], t[i][1], 3.01], [t[i + 1][0], t[i + 1][1], 3.01], 'stroke="#d9a14a" stroke-width="1.1" stroke-opacity=".8"'); });
                // Lötpads des Flash-Chips (TSOP-48: Anschlüsse an den kurzen Seiten)
                for (let i = 0; i < 12; i++) {
                    const y = 3.6 + i * 0.95;
                    g += s.flat(box(19.2, y, 1.4, 0.5), 3.02, 'fill="#e8c27a"');
                    g += s.flat(box(39.4, y, 1.4, 0.5), 3.02, 'fill="#e8c27a"');
                }
                return g;
            });

            sc.part({
                id: 'conn', short: 'Verbindet den Stick mit dem Computer – für Strom und Daten.', name: 'USB-Stecker', sub: '4 Kontakte (USB 3: 9)',
                info: 'Eine Metallhülle mit Kunststoffzunge. Darauf liegen 4 Kontakte: zwei für den Strom (+5 Volt und Masse) und zwei für die Daten (D+ und D−). USB-3-Stecker haben zusätzlich 5 Kontakte für schnellere Übertragung. Der Stick hat keinen Akku – er bekommt seinen Strom vom Computer.',
                anchor: [57, 9, 4], side: 'R', explode: [9, 0, PCB_EZ],
            }, (s) => {
                const m = M.steel;
                let g = s.prism(box(44, 3, 13, 12), 1.75, 4.5, m, { topFill: s.linGrad([[0, '#dfe8f4'], [0.5, '#98a5b8'], [1, '#cbd5e3']]) });
                // Rastlöcher in der Hülle
                g += s.flat(box(50, 5, 2.4, 2.4), 6.26, 'fill="#05060a"');
                g += s.flat(box(50, 10.6, 2.4, 2.4), 6.26, 'fill="#05060a"');
                // Öffnung an der Stirnseite (x = 57)
                g += s.poly3([[57.01, 3.5, 2.2], [57.01, 14.5, 2.2], [57.01, 14.5, 5.8], [57.01, 3.5, 5.8]], 'fill="#05060a"');
                g += s.poly3([[57.02, 3.5, 2.2], [57.02, 14.5, 2.2], [57.02, 14.5, 3.9], [57.02, 3.5, 3.9]], 'fill="#e6ecf7"');
                [4.6, 7.1, 9.6, 12.1].forEach((y) => { g += s.poly3([[57.03, y, 3.6], [57.03, y + 1.3, 3.6], [57.03, y + 1.3, 3.9], [57.03, y, 3.9]], 'fill="#f2c14e"'); });
                return g;
            });

            sc.part({
                id: 'xtal', short: 'Gibt den Takt vor – wie ein Metronom.', inner: true, name: 'Quarz', sub: 'Taktgeber',
                info: 'Ein winziger Quarzkristall, der millionenfach pro Sekunde schwingt. Er gibt den Takt vor, damit Stick und Computer die Daten im exakt gleichen Rhythmus austauschen.',
                anchor: [3, 14, 4.2], side: 'L', explode: [0, 0, CHIP_EZ],
            }, (s) => s.prism(rrect(2.5, 10.5, 5, 3.4, 1.4), CHIP_Z, 1.2, M.steel, { topFill: s.linGrad([[0, '#e7eef8'], [1, '#8d99ab']]) }));

            sc.part({
                id: 'ctrl', short: 'Das „Gehirn“ des Sticks: Es regelt, wo welche Daten landen.', inner: true, name: 'Speicher-Controller', sub: 'das „Gehirn“ des Sticks',
                info: 'Ein kleiner Prozessor. Er übersetzt zwischen Computer und Speicherchip, merkt sich, wo welche Daten liegen, und prüft sie auf Fehler. Außerdem verteilt er das Schreiben gleichmäßig auf alle Zellen, damit sich keine zu schnell abnutzt.',
                anchor: [12, 12, 3.9], side: 'L', explode: [0, 0, CHIP_EZ],
            }, (s) => {
                let g = s.prism(box(9, 6, 6, 6), CHIP_Z, 0.9, M.chip);
                g += s.circ(10, 7, 3.91, 0.45, 'fill="#9aa4b8"');
                g += s.flatText(9.8, 10, 3.92, 'CTRL', 1.6, 'fill="#9aa4b8" font-family="monospace"');
                return g;
            });

            sc.part({
                id: 'flash', short: 'Der eigentliche Speicherchip mit Milliarden winziger Zellen.', howShort: 'In jeder Zelle werden Elektronen eingesperrt – oder nicht. Das ergibt 0 oder 1, auch ohne Strom.', inner: true, name: 'NAND-Flash-Chip', sub: 'hier liegen die Daten', data: true,
                info: 'Der eigentliche Speicher: ein Chip mit Milliarden winziger Speicherzellen, die oft in vielen Lagen übereinander gestapelt sind.',
                how: 'Jede Speicherzelle hat eine elektrisch isolierte „Falle“, in die Elektronen hineingedrückt werden können. Elektronen gefangen oder nicht – das ergibt eine 0 oder eine 1. Viele Zellen speichern sogar 3 Bit, indem sie unterschiedlich viele Elektronen einsperren. Weil die Elektronen auch ohne Strom gefangen bleiben, vergisst der Stick nichts, wenn du ihn abziehst.',
                anchor: [30, 3, 4.1], side: 'R', explode: [0, 0, CHIP_EZ],
            }, (s) => {
                let g = s.prism(box(20, 3, 20, 12), CHIP_Z, 1.1, M.data, { topFill: '#16101a' });
                g += s.flatText(23, 8, 4.11, 'NAND FLASH', 2.4, 'fill="#ff7aa2" font-family="Lexend, system-ui, sans-serif" font-weight="700"');
                g += s.flatText(23, 11.5, 4.11, '128 Gbit · 3D TLC', 1.7, 'fill="#9aa4b8" font-family="monospace"');
                g += s.circ(21.5, 4.5, 4.11, 0.5, 'fill="#9aa4b8"');
                return g;
            });

            sc.part({
                id: 'led', short: 'Blinkt, wenn Daten fließen.', inner: true, name: 'LED', sub: 'blinkt bei Zugriff',
                info: 'Eine kleine Leuchtdiode. Sie blinkt, wenn gerade Daten gelesen oder geschrieben werden – dann solltest du den Stick nicht abziehen!',
                anchor: [43.5, 9, 3.8], side: 'R', explode: [0, 0, CHIP_EZ],
            }, (s) => s.prism(box(41.5, 7.5, 2, 2), CHIP_Z, 0.8, { ...M.glass, top: 'rgba(57,255,136,.85)', a: 'rgba(57,255,136,.6)', b: 'rgba(57,255,136,.45)', stroke: '#39ff88' }));

            sc.part({
                id: 'hsg-t', short: 'Obere Hülle – hier steht die Kapazität drauf.', name: 'Gehäuse oben', sub: 'mit Aufdruck der Kapazität',
                info: 'Obere Hälfte der Hülle. Hier steht meist die Speicherkapazität drauf – genau die Zahl, die du gerade abgelesen hast.',
                anchor: [30, 18, 6], side: 'L', explode: [0, 0, 52],
            }, (s) => {
                let g = s.prism(rrect(0, 0, 45, 18, 3), 4, 4, M.plasticL);
                g += s.flatText(9, 12.5, 8.01, '16 GB', 6.5, 'fill="#3fd8ff" font-family="Lexend, system-ui, sans-serif" font-weight="700"');
                g += s.circ(4, 9, 8.01, 1.6, 'fill="#05060a" stroke="#3fd8ff" stroke-opacity=".5"');
                return g;
            });

            sc.part({
                id: 'cap', short: 'Schützt den Stecker vor Schmutz.', name: 'Schutzkappe', sub: 'schützt den Stecker',
                info: 'Die Kappe schützt die Kontakte vor Schmutz, Feuchtigkeit und Verbiegen.',
                anchor: [70, 9, 7], side: 'R', explode: [26, 0, 52],
            }, (s) => s.prism(rrect(44, -0.3, 26, 18.6, 3), -0.2, 8.4, M.plasticL));

            return sc;
        },
    };
})();
