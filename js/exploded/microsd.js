/* Explosionsansicht: microSD-Karte – Maße in mm, 11 × 15 × 1.
 * Die Kontakte liegen vorn (y = 0), die Griffleiste hinten (y = 15).
 * Alle Höhen sind stark überhöht, sonst wären die Schichten unsichtbar dünn. */
(function () {
    const MV = window.MV;
    const M = MV.MAT;
    const box = (x, y, w, d) => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
    const L = 'font-family="Lexend, system-ui, sans-serif"';
    const EPOXY = { top: '#121524', a: '#0d101c', b: '#090b14', stroke: '#8f9bbb', so: 0.75 };
    const GOLD = { top: '#f2c14e', a: '#c99a2e', b: '#9e7620', stroke: '#ffe29a', so: 0.9 };
    const LABEL = { top: '#1a1030', a: '#140c26', b: '#0e081c', stroke: '#3fd8ff', so: 0.8 };

    /* Umriss: vorn (Kontaktseite) schmaler, an der linken Seite eine Stufe mit kleiner Kerbe */
    const OUT = [[1.3, 0], [11, 0], [11, 15], [0, 15], [0, 7.6], [0.5, 7.1], [0.5, 6.6], [1.3, 6.4]];
    const inset = (d) => [[1.3 + d, d], [11 - d, d], [11 - d, 15 - d], [d, 15 - d], [d, 7.6], [0.5 + d * 0.6, 7.1], [0.5 + d * 0.6, 6.6], [1.3 + d, 6.4]];

    MV.exploded.microsd = {
        title: 'microSD-Karte',
        note: 'Schichten stark vergrößert – in echt ist die Karte nur 1 mm dick, die Speicherchips sind dünner als ein Haar.',
        build() {
            const S = 11, sc = new MV.Scene(S, 25);
            const fs = (mm) => (mm * S).toFixed(1);   // Schriftgröße: mm -> Szenen-px
            const SUB = 0.12, SUB_H = 0.5, TOP = SUB + SUB_H;        // Oberseite der Trägerplatine
            const DIE_H = 0.22, DIE_GAP = 0.03, DIES = 4;
            const MOLD_H = 1.25, LBL = TOP + MOLD_H;
            const EZ = { sub: 2.6, small: 5.4, nand: 8.4, mold: 14.2, label: 18 };

            // Bodenschicht zuerst (Zeichenreihenfolge unten -> oben)
            sc.part({
                id: 'pins', short: '8 vergoldete Kontakte: So spricht die Karte mit dem Gerät.', name: 'Goldkontakte', sub: '8 Stück auf der Unterseite',
                info: 'Auf der Unterseite liegen 8 vergoldete Kontaktflächen. Zwei bringen den Strom (Spannung und Masse), einer den Takt, einer die Befehle – und vier übertragen die Daten gleichzeitig. Gold rostet nicht, deshalb bleibt der Kontakt auch nach vielen Jahren gut.',
                anchor: [11, 2.6, 0.1], side: 'R', explode: [0, -7, -1],
            }, (s) => {
                let g = '';
                for (let i = 0; i < 8; i++) {
                    const x = 2.0 + i * 1.1, len = i === 0 || i === 7 ? 3.2 : 3.6;
                    g += s.prism(box(x, 0.8, 0.8, len), 0, SUB, GOLD, { sw: 0.5 });
                }
                return g;
            });

            sc.part({
                id: 'sub', short: 'Die Unterseite der Karte: eine hauchdünne Platine mit Leiterbahnen.', name: 'Trägerplatine', sub: 'Substrat mit Leiterbahnen',
                info: 'Eine sehr dünne Platine. Sie bildet die Unterseite der Karte und trägt alle Chips. Feine Kupferbahnen verbinden die Speicherchips und den Controller mit den Kontakten auf der Rückseite.',
                anchor: [0, 12.5, 0.4], side: 'L', explode: [0, 0, EZ.sub],
            }, (s) => {
                let g = s.prism(OUT, SUB, SUB_H, M.pcb, { sw: 0.8 });
                const z = TOP + 0.01;
                const tr = [[[2.4, 1.2], [6.4, 1.2]], [[2.4, 2.4], [6.4, 2.4]], [[2.4, 3.6], [6.4, 3.6]], [[8.5, 4.8], [8.5, 5.4]], [[10.0, 4.8], [10.0, 6.2]], [[10.4, 6.2], [10.4, 12.6]]];
                tr.forEach((t) => { for (let i = 0; i < t.length - 1; i++) g += s.line3([t[i][0], t[i][1], z], [t[i + 1][0], t[i + 1][1], z], 'stroke="#d9a14a" stroke-width=".9" stroke-opacity=".75"'); });
                // Bondpads neben dem Chipstapel
                for (let j = 0; j < 7; j++) g += s.flat(box(9.75, 6.4 + j * 0.95, 0.45, 0.4), z, 'fill="#e8c27a"');
                return g;
            });

            sc.part({
                id: 'caps', short: 'Winzige Bauteile, die die Spannung glätten.', inner: true, name: 'Kondensatoren', sub: 'glätten den Strom',
                info: 'Winzige Kondensatoren – kleiner als ein Sandkorn. Sie speichern ein bisschen Strom und gleichen kurze Schwankungen aus. So bekommen die Chips immer eine ruhige, gleichmäßige Spannung.',
                anchor: [10.6, 13.6, TOP + 0.4], side: 'R', explode: [0, 0, EZ.small],
            }, (s) => {
                let g = '';
                [[9.9, 12.9], [8.5, 13.4], [7.1, 13.4]].forEach(([x, y]) => {
                    g += s.prism(box(x, y, 1.0, 0.55), TOP, 0.35, { top: '#7b5a3a', a: '#5e4429', b: '#46321e', stroke: '#e3b37a', so: 0.8 }, { sw: 0.6 });
                    g += s.flat(box(x, y, 0.22, 0.55), TOP + 0.36, 'fill="#c9d3e2"');
                    g += s.flat(box(x + 0.78, y, 0.22, 0.55), TOP + 0.36, 'fill="#c9d3e2"');
                });
                return g;
            });

            sc.part({
                id: 'ctrl', short: 'Das „Gehirn“ der Karte: Es verwaltet die Speicherchips.', inner: true, name: 'Controller', sub: 'das „Gehirn“',
                info: 'Ein winziger Prozessor. Er nimmt die Befehle von Handy oder Kamera an, entscheidet, in welche Speicherzellen die Daten kommen, und korrigiert Fehler. Außerdem verteilt er das Schreiben gleichmäßig, damit keine Zelle zu schnell verschleißt.',
                anchor: [10.4, 2.6, TOP + 0.3], side: 'R', explode: [0, 0, EZ.small],
            }, (s) => {
                let g = s.prism(box(6.6, 1.0, 3.8, 3.6), TOP, 0.3, M.chip, { sw: 0.7 });
                g += s.circ(7.0, 1.4, TOP + 0.31, 0.18, 'fill="#9aa4b8"');
                g += s.flatText(7.1, 3.1, TOP + 0.31, 'CTRL', fs(0.95), `fill="#9aa4b8" ${L}`);
                return g;
            });

            sc.part({
                id: 'nand', short: 'Mehrere hauchdünne Speicherchips, übereinander gestapelt.', howShort: 'Wie beim USB-Stick: Eingesperrte Elektronen bedeuten 0 oder 1 – auch ohne Strom.', inner: true, name: 'NAND-Flash-Chips', sub: 'gestapelt · hier liegen die Daten', data: true,
                info: 'Hier liegen deine Fotos und Videos. Damit auf so ein kleines Kärtchen so viel passt, liegen mehrere Speicherchips wie eine Treppe übereinander – jeder dünner als ein Haar. Haarfeine Golddrähte verbinden jede Stufe mit der Platine.',
                how: 'Die gleiche Technik wie im USB-Stick und in der SSD-Festplatte: Jede Speicherzelle hat eine isolierte „Falle“, in die Elektronen gedrückt werden. Elektronen gefangen oder nicht – das ergibt 0 oder 1. Weil sie auch ohne Strom gefangen bleiben, behält die Karte alles, wenn du sie aus dem Handy nimmst. Der Trick für die riesige Kapazität: Die Zellen sind in über 100 Lagen übereinander gebaut, und mehrere Chips liegen zusätzlich gestapelt.',
                anchor: [9.3, 9.6, TOP + DIES * (DIE_H + DIE_GAP)], side: 'R', explode: [0, 0, EZ.nand],
            }, (s) => {
                let g = '';
                const x0 = 3.2, y0 = 5.6, w = 6.2, d = 7.5, step = 0.5;
                for (let i = 0; i < DIES; i++) {
                    const x = x0 - i * step, z = TOP + i * (DIE_H + DIE_GAP);
                    const top = i === DIES - 1;
                    g += s.prism(box(x, y0, w, d), z, DIE_H, M.data, { sw: 0.7, topFill: top ? '#16101a' : undefined });
                    // Bondpads auf der frei liegenden Treppenstufe + Golddrähte zur Platine
                    for (let j = 0; j < 7; j++) {
                        const y = y0 + 0.8 + j * 0.95, px = x + w - 0.3, pz = z + DIE_H + 0.005;
                        g += s.flat(box(px - 0.15, y, 0.3, 0.3), pz, 'fill="#f2c14e"');
                        g += s.line3([px, y + 0.15, pz], [9.97, y + 0.2, TOP], 'stroke="#f2c14e" stroke-width=".45" stroke-opacity=".85"');
                    }
                    if (top) {
                        g += s.flatText(x + 0.6, y0 + 3.3, z + DIE_H + 0.01, 'NAND', fs(1.5), `fill="#ff7aa2" ${L} font-weight="700"`);
                        g += s.flatText(x + 0.6, y0 + 5.0, z + DIE_H + 0.01, '4 × 16 GB', fs(0.9), 'fill="#9aa4b8" font-family="monospace"');
                    }
                }
                return g;
            });

            sc.part({
                id: 'mold', short: 'Schwarzer Kunststoff, in den alles eingegossen ist.', name: 'Vergussmasse', sub: 'das „Gehäuse“',
                info: 'Eine microSD hat kein Gehäuse zum Aufschrauben: Alle Chips werden in schwarzes Epoxidharz eingegossen – ein harter Kunststoff. Darum ist die Karte so robust: Sie übersteht Wasser, Kälte und sogar einen Sturz. Die kleine Leiste hinten hilft dir, die Karte herauszuziehen.',
                anchor: [0, 10.5, TOP + 0.7], side: 'L', explode: [0, 0, EZ.mold],
            }, (s) => {
                let g = s.prism(OUT, TOP, MOLD_H, EPOXY, { hole: box(2.2, 1.0, 8.2, 12.9), sw: 0.9 });
                // Griffleiste am hinteren Ende
                g += s.prism(box(0.6, 13.9, 9.8, 0.7), LBL, 0.18, EPOXY, { sw: 0.7 });
                return g;
            });

            sc.part({
                id: 'label', short: 'Aufdruck mit der Kapazität – und Symbolen für die Geschwindigkeit.', name: 'Etikett', sub: 'Kapazität + Geschwindigkeit',
                info: 'Auf der Vorderseite steht die Kapazität – genau die Zahl, die du eingetragen hast. Die anderen Zeichen beschreiben die Geschwindigkeit, nicht die Größe: Die „3“ im U heißt, dass die Karte mindestens 30 MB pro Sekunde schreibt. „V30“ bedeutet: schnell genug für 4K-Videos. „A2“: gut geeignet für Apps auf dem Handy.',
                anchor: [11, 9.5, LBL + 0.05], side: 'R', explode: [0, 0, EZ.label],
            }, (s) => {
                let g = s.prism(inset(0.35).map((p) => [p[0], Math.min(p[1], 13.6)]), LBL, 0.06, LABEL, { sw: 0.7 });
                const z = LBL + 0.07;
                g += s.flatText(1.6, 4.4, z, 'microSD', fs(1.35), `fill="#e6ecf7" ${L} font-weight="700"`);
                g += s.flatText(8.3, 4.4, z, 'XC', fs(1.1), `fill="#3fd8ff" ${L} font-weight="700"`);
                g += s.flatText(1.8, 9.0, z, '64 GB', fs(2.6), `fill="#3fd8ff" ${L} font-weight="700"`);
                g += s.flatText(2.0, 12.4, z, 'U3 · V30 · A2', fs(1.05), 'fill="#ff7aa2" font-family="monospace" font-weight="700"');
                return g;
            });

            return sc;
        },
    };
})();
