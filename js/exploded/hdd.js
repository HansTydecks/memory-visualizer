/* Explosionsansicht: 3,5-Zoll-Festplatte (HDD) – Maße in mm, ca. 101,6 × 147 × 26 */
(function () {
    const MV = window.MV;
    const { rrect } = MV.geo;
    const M = MV.MAT;
    const box = (x, y, w, d) => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];

    // Lage der Bauteile im Gehäuse
    const PC = [50.8, 96];          // Mittelpunkt der Scheiben
    const PIV = [84, 30];           // Drehpunkt des Kopfarms
    const HEAD = [72, 78];          // Kopf (über Radius ≈ 28 mm)
    const dir = [(HEAD[0] - PIV[0]), (HEAD[1] - PIV[1])];
    const len = Math.hypot(dir[0], dir[1]);
    const d = [dir[0] / len, dir[1] / len], n = [d[1], -d[0]];
    const at = (t, w) => [PIV[0] + d[0] * t + n[0] * w, PIV[1] + d[1] * t + n[1] * w];

    MV.exploded.hdd = {
        title: 'Festplatte (HDD)',
        build() {
            const sc = new MV.Scene(1.9, 22);
            const OUT = rrect(0, 0, 101.6, 147, 3, 3);

            sc.part({
                id: 'pcb', name: 'Platine', sub: 'Controller, Cache, SATA',
                info: 'Die Elektronik sitzt auf der Unterseite. Der Controller steuert Motor und Kopfarm und prüft die Daten auf Fehler. Der Cache ist ein kleiner, schneller Zwischenspeicher. Über den SATA-Anschluss kommen Daten und Strom.',
                anchor: [101.6 - 6, 120, -0.8], side: 'R', explode: [0, 0, -44],
            }, (s) => {
                let g = s.prism(box(6, 18, 89.6, 124), -1.6, 1.6, M.pcb);
                g += s.prism(box(40, 100, 16, 16), 0, 1.2, M.chip);
                g += s.flatText(42, 108, 1.21, 'CTRL', 4, 'fill="#9aa4b8" font-family="Orbitron, monospace"');
                g += s.prism(box(62, 104, 14, 9), 0, 1.0, M.chip);
                g += s.flatText(63, 109, 1.01, 'CACHE', 3, 'fill="#3fd8ff" font-family="Orbitron, monospace"');
                g += s.prism(box(20, 108, 10, 10), 0, 1.0, M.chip);
                g += s.prism(box(14, 18, 50, 8), 0, 5, M.black);
                g += s.flatText(22, 23.5, 5.01, 'SATA', 4.5, 'fill="#3fd8ff" font-family="Orbitron, monospace" font-weight="700"');
                return g;
            });

            sc.part({
                id: 'base', name: 'Gehäuse', sub: 'Aluminium-Guss',
                info: 'Ein gegossener, sehr steifer Aluminium-Rahmen. Er darf sich kein bisschen verbiegen, denn der Lesekopf muss seine Spur auf Tausendstel Millimeter genau treffen.',
                anchor: [101.6, 60, 10], side: 'R', explode: [0, 0, 0],
            }, (s) => s.prism(OUT, 0, 20, M.metal, { hole: rrect(3, 3, 95.6, 141, 4, 3), floorZ: 2, floorFill: '#262d3b' }));

            sc.part({
                id: 'motor', inner: true, name: 'Spindelmotor', sub: '5.400 – 7.200 U/min',
                info: 'Der Motor dreht alle Scheiben gemeinsam und ganz gleichmäßig – bei 7.200 Umdrehungen pro Minute sind das 120 Umdrehungen pro Sekunde! Die Außenkante der Scheibe rast dabei mit über 100 km/h im Kreis.',
                anchor: [PC[0] - 12.4 * 0.7071, PC[1] + 12.4 * 0.7071, 5], side: 'L', explode: [0, 0, 28],
            }, (s) => {
                let g = s.cyl(PC[0], PC[1], 2, 12.4, 6, M.steel, { topFill: s.linGrad([[0, '#dfe8f4'], [1, '#7d889a']]) });
                for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g += s.circ(PC[0] + 7 * Math.cos(a), PC[1] + 7 * Math.sin(a), 8.01, 1, 'fill="#323b4c"'); }
                return g;
            });

            sc.part({
                id: 'platters', inner: true, name: 'Magnetscheiben', sub: 'hier liegen die Daten', data: true,
                info: 'Hochglanzpolierte Scheiben aus Aluminium oder Glas, beschichtet mit einer hauchdünnen magnetischen Schicht. Es sind zwei Scheiben gezeichnet – große Festplatten haben bis zu 10 übereinander, und jede Seite wird benutzt.',
                how: 'Der Schreibkopf magnetisiert winzige Bereiche der Schicht: Die kleinen Magnete zeigen entweder nach oben oder nach unten. Beim Lesen spürt der Kopf diese Magnetrichtungen – daraus werden Nullen und Einsen. Die Daten liegen in Hunderttausenden ringförmigen Spuren und bleiben auch ohne Strom viele Jahre erhalten.',
                anchor: [PC[0] - 47.5 * 0.7071, PC[1] + 47.5 * 0.7071, 13.6], side: 'L', explode: [0, 0, 56],
            }, (s) => {
                const mirror = s.linGrad([[0, '#f2f6ff'], [0.3, '#8c97ab'], [0.5, '#e4e9f3'], [0.75, '#6d788c'], [1, '#c9d1de']], 0, 0, 1, 1);
                let g = s.cyl(PC[0], PC[1], 8, 47.5, 1.3, M.data, { hole: 12.5, topFill: mirror, sideFill: '#6d788c' });
                g += s.cyl(PC[0], PC[1], 9.3, 15, 3.7, M.steel);
                g += s.cyl(PC[0], PC[1], 13, 47.5, 1.3, M.data, { hole: 12.5, topFill: mirror, sideFill: '#6d788c' });
                g += s.rings(PC[0], PC[1], 14.31, 18, 46, 8, 'stroke="#ff2a6d" stroke-opacity=".35" stroke-width=".7"');
                g += s.cyl(PC[0], PC[1], 14.3, 15.5, 1, M.steel, { topFill: s.linGrad([[0, '#dfe8f4'], [1, '#8d99ab']]) });
                for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g += s.circ(PC[0] + 11 * Math.cos(a), PC[1] + 11 * Math.sin(a), 15.31, 1.1, 'fill="#323b4c"'); }
                return g;
            });

            sc.part({
                id: 'arm', inner: true, name: 'Kopfarm', sub: 'mit Schwingspule',
                info: 'Der Arm schwenkt wie der Tonarm eines Plattenspielers über die Scheiben – in wenigen Tausendstel Sekunden. Angetrieben wird er von einer Kupferspule (Schwingspule): Fließt Strom hindurch, drückt der Magnet sie zur Seite und der Arm dreht sich um seine Achse.',
                anchor: [...at(len * 0.45, 3.5), 16], side: 'R', explode: [0, 0, 84],
            }, (s) => {
                // Spule (Kupferwicklung) hinter dem Drehpunkt
                const coilOut = [at(-6, 5), at(-24, 12), at(-24, -12), at(-6, -5)];
                const coilIn = [at(-9, 2.6), at(-21, 7), at(-21, -7), at(-9, -2.6)];
                let g = s.prism(coilOut, 13, 2.5, M.copper, { hole: coilIn });
                g += s.cyl(PIV[0], PIV[1], 6, 6, 10, M.steel, { topFill: s.linGrad([[0, '#dfe8f4'], [1, '#7d889a']]) });
                g += s.prism([at(0, -5), at(0, 5), at(len - 6, 2), at(len - 6, -2)], 14.6, 1, M.steel, { topFill: s.linGrad([[0, '#c3cfdf'], [1, '#7d889a']]) });
                g += s.prism([at(len - 6, -2), at(len - 6, 2), at(len, 1), at(len, -1)], 14.8, 0.4, M.steel);
                g += s.circ(PIV[0], PIV[1], 16.01, 2, 'fill="#323b4c"');
                return g;
            });

            sc.part({
                id: 'head', inner: true, name: 'Schreib-/Lesekopf', sub: 'schwebt über der Scheibe',
                info: 'Ein winziger Elektromagnet an der Spitze des Arms. Wenn die Scheiben sich drehen, schwebt er auf einem Luftpolster nur wenige millionstel Millimeter über der Oberfläche – ohne sie zu berühren. Für jede Scheibenseite gibt es einen eigenen Kopf.',
                anchor: [HEAD[0], HEAD[1], 15.4], side: 'R', explode: [0, 0, 84],
            }, (s) => {
                let g = s.prism([at(len - 1.2, -1.4), at(len - 1.2, 1.4), at(len + 1.4, 1.4), at(len + 1.4, -1.4)], 14.2, 1.1, { ...M.chip, stroke: '#ff2a6d' });
                g += s.circ(HEAD[0], HEAD[1], 15.31, 0.7, 'fill="#ff2a6d"');
                return g;
            });

            sc.part({
                id: 'magnet', inner: true, name: 'Permanentmagnet', sub: 'Antrieb des Kopfarms',
                info: 'Ein sehr starker Neodym-Magnet auf einer Stahlplatte (unter der Spule sitzt ein zweiter). Zusammen mit der Schwingspule bildet er den Motor, der den Kopfarm bewegt. Darum dürfen Festplatten nie in die Nähe starker Magnete!',
                anchor: [100, 16, 18.5], side: 'R', explode: [0, 0, 110],
            }, (s) => {
                let g = s.prism([[74, 3.5], [99, 3.5], [99, 25], [86, 27], [74, 18]], 16.5, 2.5, M.magnet);
                g += s.flatText(80, 14, 19.01, 'NdFeB', 3.5, 'fill="#ff9a6b" font-family="Orbitron, monospace"');
                return g;
            });

            sc.part({
                id: 'lid', name: 'Deckel', sub: 'staubdicht verschlossen',
                info: 'Ein dicht verschlossener Metalldeckel. Ein Staubkorn wäre für den schwebenden Kopf wie ein Felsbrocken – darum werden Festplatten in Reinräumen zusammengebaut. Große Festplatten sind sogar mit Helium gefüllt.',
                anchor: [101.6, 70, 20.6], side: 'R', explode: [0, 0, 138],
            }, (s) => {
                let g = s.prism(OUT, 20, 1.2, M.steel, { topFill: s.linGrad([[0, '#c7d1df'], [0.5, '#8e9bad'], [1, '#b7c2d2']], 0, 0, 1, 1) });
                g += s.flat(box(14, 40, 74, 52), 21.21, 'fill="#0e0c1a" stroke="#3fd8ff" stroke-opacity=".6"');
                g += s.flatText(20, 56, 21.22, 'HDD 1 TB', 10, 'fill="#3fd8ff" font-family="Orbitron, monospace" font-weight="700"');
                g += s.flatText(20, 70, 21.22, '7200 RPM · SATA 6 Gb/s', 5, 'fill="#9aa4b8" font-family="monospace"');
                [[5, 5], [96.6, 5], [5, 142], [96.6, 142], [5, 72], [96.6, 72], PC, PIV].forEach(([x, y]) => { g += s.circ(x, y, 21.21, 2, 'fill="#4a5568" stroke="#e3f2ff" stroke-opacity=".5" stroke-width=".6"'); });
                return g;
            });

            return sc;
        },
    };
})();
