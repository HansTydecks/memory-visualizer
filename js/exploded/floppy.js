/* Explosionsansicht: 3,5-Zoll-Diskette (1,44 MB, HD) – Maße in mm (90 × 94 × 3,3) */
(function () {
    const MV = window.MV;
    const { rrect } = MV.geo;
    const M = MV.MAT;

    MV.exploded.floppy = {
        title: 'Diskette 3,5″',
        build() {
            const sc = new MV.Scene(2.75, 22);
            const W = 90, D = 94;
            const CX = 45, CY = 45; // Mitte der Magnetscheibe
            const outline = rrect(0, 0, W, D, 2.2, 3);
            // Fenster für den Schreib-/Lesekopf (an der Schieber-Kante y = 94)
            const win = [[40.5, 64], [49.5, 64], [49.5, 89], [40.5, 89]];
            const hole = (x, y) => [[x, y], [x + 4.5, y], [x + 4.5, y + 5.5], [x, y + 5.5]];

            /* 6 Gehäuse-Unterschale */
            sc.part({
                id: 'bottom', name: 'Gehäuse-Unterschale', sub: 'mit Schreibschutz-Schieber',
                info: 'Unterer Teil des harten Kunststoffgehäuses. In der Mitte ist eine runde Öffnung: Dort greift der Motor des Laufwerks an die Metallnabe. In den beiden Ecken sitzen kleine Löcher: Eines zeigt dem Laufwerk an, dass es eine HD-Diskette (1,44 MB) ist. Das andere kann mit einem Schiebeschalter verschlossen werden – ist es offen, ist die Diskette schreibgeschützt.',
                anchor: [W, 20, 1.4], side: 'R', explode: [0, 0, 0],
            }, (s) => {
                let g = s.prism(outline, 0, 1.4, M.plastic, { hole: MV.geo.circlePts(CX, CY, 13.5, 40) });
                g += s.flat(hole(5, 4), 1.41, 'fill="#05060a" stroke="#3fd8ff" stroke-opacity=".6"');
                g += s.flat([[5, 4], [9.5, 4], [9.5, 6.8], [5, 6.8]], 1.42, `fill="${M.chip.top}" stroke="#9aa4b8" stroke-width=".8"`);
                g += s.flat(hole(80.5, 4), 1.41, 'fill="#05060a" stroke="#3fd8ff" stroke-opacity=".6"');
                g += s.flat(win, 1.41, 'fill="#05060a" stroke="#3fd8ff" stroke-opacity=".5"');
                return g;
            });

            /* 5 Reinigungsvlies unten */
            sc.part({
                id: 'liner2', inner: true, name: 'Reinigungsvlies', sub: 'unten',
                info: 'Weiches Vlies auf der Innenseite des Gehäuses. Bei jeder Umdrehung wischt es Staub von der Magnetscheibe, damit der Lesekopf sauber arbeiten kann.',
                anchor: [CX - 43.5 * 0.7071, CY + 43.5 * 0.7071, 1.75], side: 'L', explode: [0, 0, 24],
            }, (s) => s.cyl(CX, CY, 1.5, 43.5, 0.25, M.fleece, { hole: 14 }));

            /* 4 Magnetscheibe mit Metallnabe */
            sc.part({
                id: 'disk', inner: true, name: 'Magnetscheibe', sub: 'hier liegen die Daten', data: true,
                info: 'Eine dünne, biegsame Kunststofffolie (daher „Floppy“ = schlabbrig). Beide Seiten sind mit winzigen magnetischen Eisenoxid-Teilchen beschichtet. In der Mitte klebt eine Metallnabe, an der der Motor die Scheibe 300-mal pro Minute dreht.',
                how: 'Der Schreib-/Lesekopf im Laufwerk ist ein winziger Elektromagnet. Er magnetisiert winzige Bereiche der Schicht in die eine oder andere Richtung. Beim Lesen spürt er, wo die Magnetrichtung wechselt – daraus werden Nullen und Einsen. Jede Seite hat 80 ringförmige Spuren, jede Spur 18 Abschnitte (Sektoren) mit je 512 Byte. 80 × 18 × 2 Seiten × 512 Byte = 1.474.560 Byte.',
                anchor: [CX + 43 * 0.7071, CY - 43 * 0.7071, 1.95], side: 'R', explode: [0, 0, 54],
            }, (s) => {
                let g = s.cyl(CX, CY, 1.3, 13, 0.5, M.steel, { topFill: s.linGrad([[0, '#c3cfdf'], [1, '#6f7c90']]) });
                g += s.flat([[CX - 2.2, CY - 2.2], [CX + 2.2, CY - 2.2], [CX + 2.2, CY + 2.2], [CX - 2.2, CY + 2.2]], 1.81, 'fill="#05060a"');
                g += s.flat([[CX + 5, CY - 1.5], [CX + 9.5, CY - 1.5], [CX + 9.5, CY + 2], [CX + 5, CY + 2]], 1.81, 'fill="#05060a"');
                g += s.cyl(CX, CY, 1.8, 43, 0.15, M.data, { hole: 12.5, topFill: s.linGrad([[0, '#6b3a24'], [0.5, '#4a2614'], [1, '#2e170c']], 0, 0, 1, 1) });
                g += s.rings(CX, CY, 1.96, 19, 41, 9, 'stroke="#ff2a6d" stroke-opacity=".35" stroke-width=".7"');
                return g;
            });

            /* 3 Reinigungsvlies oben */
            sc.part({
                id: 'liner1', inner: true, name: 'Reinigungsvlies', sub: 'oben',
                info: 'Zweites Vlies auf der Innenseite der Oberschale – so wird die Scheibe von beiden Seiten sauber gehalten.',
                anchor: [CX - 43.5 * 0.7071, CY + 43.5 * 0.7071, 2.35], side: 'L', explode: [0, 0, 92],
            }, (s) => s.cyl(CX, CY, 2.1, 43.5, 0.25, M.fleece, { hole: 14 }));

            /* 2 Gehäuse-Oberschale */
            sc.part({
                id: 'top', name: 'Gehäuse-Oberschale', sub: 'mit Lesekopf-Fenster',
                info: 'Oberer Teil des Kunststoffgehäuses mit dem Etikett. Durch das schmale Fenster kommt der Schreib-/Lesekopf an die Magnetscheibe – auf der Unterseite ist ein zweites Fenster, denn beide Seiten der Scheibe werden benutzt.',
                anchor: [W, 30, 3.3], side: 'R', explode: [0, 0, 118],
            }, (s) => {
                let g = s.prism(outline, 1.9, 1.4, M.plasticL, { hole: win });
                g += s.flat([[25, 58], [65, 58], [65, 94], [25, 94]], 3.31, 'fill="rgba(0,0,0,.28)" stroke="none"');
                g += s.flat([[8, 8], [82, 8], [82, 52], [8, 52]], 3.32, 'fill="#e6ecf7" fill-opacity=".9" stroke="#ffffff" stroke-width=".6"');
                for (let i = 0; i < 4; i++) g += s.line3([12, 20 + i * 8, 3.33], [78, 20 + i * 8, 3.33], 'stroke="#8090b0" stroke-width=".7"');
                g += s.flatText(12, 15, 3.34, 'HD 1.44 MB', 8, 'fill="#ff2a6d" font-family="Orbitron, monospace" font-weight="700"');
                g += s.flat(hole(5, 4).map(([x, y]) => [x, y]), 3.31, 'fill="#05060a"');
                g += s.flat(hole(80.5, 4), 3.31, 'fill="#05060a"');
                return g;
            });

            /* 1 Metallschieber */
            sc.part({
                id: 'shutter', name: 'Metallschieber', sub: 'schützt die Scheibe',
                info: 'Der Schieber verschließt das Fenster und schützt die empfindliche Scheibe vor Staub und Fingern. Erst im Laufwerk wird er zur Seite geschoben; eine kleine Feder im Gehäuse schiebt ihn danach zurück.',
                anchor: [26, 94.3, 2], side: 'L', explode: [0, 0, 142],
            }, (s) => {
                const m = { ...M.steel };
                let g = s.prism([[26, 59], [64, 59], [64, 94.2], [26, 94.2]], 3.3, 0.3, m, { topFill: s.linGrad([[0, '#d9e3f0'], [0.6, '#9aa7ba'], [1, '#cdd7e6']]) });
                // umgebogene Lasche an der Vorderkante
                g += s.poly3([[26, 94.3, 0.2], [64, 94.3, 0.2], [64, 94.3, 3.6], [26, 94.3, 3.6]], `fill="#7d8a9d" stroke="#e3f2ff" stroke-opacity=".7" stroke-width="1"`);
                return g;
            });
            return sc;
        },
    };
})();
