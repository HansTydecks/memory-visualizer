/* Explosionsansicht: 2,5-Zoll-SSD (SATA) – Maße in mm, 100 × 69,85 × 7.
 * Der SATA-Anschluss sitzt an der kurzen Kante bei x = 100. */
(function () {
    const MV = window.MV;
    const { rrect } = MV.geo;
    const M = MV.MAT;
    const box = (x, y, w, d) => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
    const PAD = { top: '#4a5d7c', a: '#3a4a64', b: '#2c384d', stroke: '#a9c2e8', so: 0.7 };
    const L = 'font-family="Lexend, system-ui, sans-serif"';

    MV.exploded.ssd = {
        title: 'SSD (2,5″ SATA)',
        build() {
            const sc = new MV.Scene(2.6, 22);
            const OUT = rrect(0, 0, 100, 69.85, 2.5, 3);
            const PCB = 18, CHIP = 36, PADZ = 56, LID = 84;

            sc.part({
                id: 'base', short: 'Flache Metallwanne, in der die Platine sitzt.', name: 'Gehäuseboden', sub: 'Aluminium',
                info: 'Die untere Hälfte des Gehäuses: eine flache Wanne aus Aluminium oder Kunststoff. Die Platine wird hineingelegt und festgeschraubt.',
                anchor: [100, 50, 1.5], side: 'R', explode: [0, 0, 0],
            }, (s) => s.prism(OUT, 0, 3, M.metal, { hole: rrect(1.5, 1.5, 97, 66.85, 1.5, 3), floorZ: 0.8, floorFill: '#262d3b' }));

            sc.part({
                id: 'pcb', short: 'Trägt alle Chips und den SATA-Anschluss für Daten und Strom.', inner: true, name: 'Platine mit SATA-Anschluss', sub: 'Daten + Strom',
                info: 'Auf der Platine sitzen alle Chips. Feine Kupferbahnen verbinden sie. An der kurzen Kante liegt der SATA-Anschluss: ein kleiner Stecker für die Daten und ein breiter für den Strom.',
                anchor: [50, 66.85, 2.2], side: 'L', explode: [0, 0, PCB],
            }, (s) => {
                let g = s.prism(box(3, 3, 94, 63.85), 1.2, 1, M.pcb);
                // Leiterbahnen zwischen Chips und Anschluss
                [[48, 60, 13], [48, 60, 25], [48, 60, 45], [48, 60, 55], [74, 91, 26], [74, 91, 31], [72, 91, 46]].forEach(([x0, x1, y]) => {
                    g += s.line3([x0, y, 2.21], [x1, y, 2.21], 'stroke="#d9a14a" stroke-width="1" stroke-opacity=".7"');
                });
                // SATA-Buchse: Daten (7 Kontakte) + Strom (15 Kontakte)
                g += s.prism(box(91, 9, 7, 52), 2.2, 3.5, M.black);
                g += s.flatText(92.5, 26, 5.71, 'SATA', 4, `fill="#3fd8ff" ${L} font-weight="700"`);
                const slot = (y0, y1) => {
                    let t = s.poly3([[98.01, y0, 3], [98.01, y1, 3], [98.01, y1, 5], [98.01, y0, 5]], 'fill="#05060a"');
                    const n = Math.round((y1 - y0) / 1.27);
                    for (let i = 0; i < n; i++) {
                        const y = y0 + 0.4 + i * 1.27;
                        t += s.poly3([[98.02, y, 3.4], [98.02, y + 0.7, 3.4], [98.02, y + 0.7, 4.6], [98.02, y, 4.6]], 'fill="#f2c14e"');
                    }
                    return t;
                };
                g += slot(11, 21) + slot(24, 58);
                return g;
            });

            sc.part({
                id: 'nand', short: 'Mehrere Speicherchips mit Milliarden winziger Zellen.', howShort: 'Wie beim USB-Stick: Eingesperrte Elektronen bedeuten 0 oder 1 – auch ohne Strom.', inner: true, name: 'NAND-Flash-Chips', sub: 'hier liegen die Daten', data: true,
                info: 'Hier liegen deine Dateien: mehrere Flash-Speicherchips nebeneinander, jeder mit Milliarden Speicherzellen in über 100 Lagen übereinander.',
                how: 'Die gleiche Technik wie im USB-Stick: In jeder Zelle werden Elektronen in einer isolierten Falle eingesperrt – gefangen oder nicht ergibt 0 oder 1, auch ohne Strom. Der Trick der SSD: Der Controller schreibt gleichzeitig auf mehrere Chips. Darum ist sie viel schneller als ein USB-Stick. Und anders als die Festplatte hat sie keine beweglichen Teile – sie ist leise und verträgt Stöße.',
                anchor: [8, 61, 3.4], side: 'L', explode: [0, 0, CHIP],
            }, (s) => {
                let g = '';
                [[8, 7], [30, 7], [8, 39], [30, 39]].forEach(([x, y]) => {
                    g += s.prism(box(x, y, 18, 22), 2.2, 1.2, M.data, { topFill: '#16101a' });
                    g += s.flatText(x + 2, y + 9, 3.41, 'NAND', 3.4, `fill="#ff7aa2" ${L} font-weight="700"`);
                    g += s.flatText(x + 2, y + 14, 3.41, '256 GB', 2.6, 'fill="#9aa4b8" font-family="monospace"');
                    g += s.circ(x + 1.6, y + 1.6, 3.41, 0.6, 'fill="#9aa4b8"');
                });
                return g;
            });

            sc.part({
                id: 'ctrl', short: 'Das „Gehirn“ der SSD: Es verteilt die Daten auf alle Speicherchips.', inner: true, name: 'Controller', sub: 'das „Gehirn“',
                info: 'Ein kleiner Prozessor. Er nimmt die Daten vom Computer an, verteilt sie auf die Speicherchips, prüft sie auf Fehler und sorgt dafür, dass sich keine Speicherzelle zu schnell abnutzt.',
                anchor: [74, 22, 3.4], side: 'R', explode: [0, 0, CHIP],
            }, (s) => {
                let g = s.prism(box(60, 22, 14, 14), 2.2, 1.2, M.chip);
                g += s.circ(61.5, 23.5, 3.41, 0.6, 'fill="#9aa4b8"');
                g += s.flatText(62, 30, 3.41, 'CTRL', 3, `fill="#9aa4b8" ${L}`);
                return g;
            });

            sc.part({
                id: 'dram', short: 'Schneller Zwischenspeicher – ohne Strom vergisst er alles.', inner: true, name: 'Cache (DRAM)', sub: 'Zwischenspeicher',
                info: 'Ein kleiner, sehr schneller Arbeitsspeicher. Darin merkt sich der Controller, wo welche Daten liegen. Wie der RAM im Handy vergisst er alles, wenn der Strom weg ist – deine Dateien liegen aber sicher in den Flash-Chips.',
                anchor: [60, 51, 3.2], side: 'R', explode: [0, 0, CHIP + 12],
            }, (s) => {
                let g = s.prism(box(60, 42, 12, 9), 2.2, 1, { ...M.chip, stroke: '#3fd8ff' });
                g += s.flatText(61.5, 47.5, 3.21, 'DRAM', 2.8, `fill="#3fd8ff" ${L}`);
                return g;
            });

            sc.part({
                id: 'pad', short: 'Leitet die Wärme der Chips an das Gehäuse.', inner: true, name: 'Wärmeleitpad', sub: 'kühlt den Controller',
                info: 'Ein weiches, wärmeleitendes Kissen. Es liegt zwischen Controller und Deckel und leitet die Wärme an das Metallgehäuse ab – so bleibt die SSD auch bei viel Arbeit kühl.',
                anchor: [76, 20, 4.6], side: 'R', explode: [0, 0, PADZ],
            }, (s) => s.prism(box(58, 20, 18, 18), 3.4, 1.2, PAD));

            sc.part({
                id: 'lid', short: 'Deckel mit Etikett – hier steht die Kapazität.', name: 'Gehäusedeckel', sub: 'mit Etikett',
                info: 'Der Deckel schließt das flache Gehäuse. Auf dem Etikett steht die Speicherkapazität – genau die Zahl, die du gerade eingetragen hast. Anders als bei der Festplatte muss das Gehäuse nicht staubdicht sein, denn innen bewegt sich nichts.',
                anchor: [100, 22, 6], side: 'R', explode: [0, 0, LID],
            }, (s) => {
                let g = s.prism(OUT, 3, 4, M.steel, { topFill: s.linGrad([[0, '#c7d1df'], [0.5, '#8e9bad'], [1, '#b7c2d2']], 0, 0, 1, 1) });
                g += s.flat(box(12, 12, 66, 46), 7.01, 'fill="#0e0c1a" stroke="#3fd8ff" stroke-opacity=".6"');
                g += s.flatText(18, 30, 7.02, 'SSD 1 TB', 11, `fill="#3fd8ff" ${L} font-weight="700"`);
                g += s.flatText(18, 42, 7.02, 'SATA III · 6 Gb/s · 2,5″', 4.6, 'fill="#9aa4b8" font-family="monospace"');
                return g;
            });

            return sc;
        },
    };
})();
