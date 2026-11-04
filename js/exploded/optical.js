/* Explosionsansichten: CD-R und DVD±R (Ø 120 mm, Mittelloch Ø 15 mm).
 * Schichtdicken sind stark vergrößert (Farbstoff, Metall und Lack sind real
 * nur Bruchteile eines Tausendstel Millimeters dick). */
(function () {
    const MV = window.MV;
    const M = MV.MAT;
    const CX = 60, CY = 60, R = 60, HOLE = 7.5;
    const L = (r) => [CX - r * 0.7071, CY + r * 0.7071]; // linker Bildpunkt eines Kreises
    const Rt = (r) => [CX + r * 0.7071, CY - r * 0.7071]; // rechter Bildpunkt

    const silver = (s) => s.linGrad([[0, '#f4f8ff'], [0.35, '#9aa6b8'], [0.55, '#e9eef7'], [0.8, '#7d889a'], [1, '#d6dde8']], 0, 0, 1, 1);
    const glassTop = 'rgba(140,220,255,0.16)';

    function laser(s, z0, zData, nm, color, label) {
        s.extra((sc) => {
            const x = CX + 26, y = CY + 26;
            const a = sc.P(x, y, z0 - 30), b = sc.P(x, y, zData);
            const lens = sc.P(x, y, z0 - 30);
            const [rx, ry] = sc.ell(5);
            sc._growBox(a[0] - 230, a[1] - 14, a[0] + 24, a[1] + 30);
            return `<g class="xv-laser">` +
                `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="7" stroke-opacity=".18"/>` +
                `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="2" stroke-dasharray="6 4"/>` +
                `<circle cx="${b[0]}" cy="${b[1]}" r="5" fill="${color}" fill-opacity=".8"/>` +
                `<ellipse cx="${lens[0]}" cy="${lens[1]}" rx="${rx}" ry="${ry}" fill="#0e0c1a" stroke="${color}" stroke-width="1.5"/>` +
                `<text x="${lens[0] - rx - 10}" y="${lens[1] + 5}" text-anchor="end" class="xv-note" fill="${color}">${label}</text>` +
                `<text x="${lens[0] - rx - 10}" y="${lens[1] + 22}" text-anchor="end" class="xv-note xv-note-dim">Laser im Laufwerk (${nm})</text>` +
                `</g>`;
        });
    }

    MV.exploded.cd = {
        title: 'CD-R',
        note: 'Schichtdicken stark vergrößert – in echt ist die CD 1,2 mm dick und fast nur aus Kunststoff.',
        build() {
            const sc = new MV.Scene(2.8, 20);

            sc.part({
                id: 'poly', short: 'Glasklarer Kunststoff, 1,2 mm dick. Der Laser leuchtet von unten hindurch.', name: 'Polycarbonat-Scheibe', sub: '1,2 mm, glasklar',
                info: 'Fast die ganze CD besteht aus diesem glasklaren Kunststoff. In seine Oberseite ist eine hauchfeine Rille als Spirale gepresst – die Spur, der der Laser folgt. Die Spurringe liegen nur 1,6 Tausendstel Millimeter auseinander; ausgerollt wäre die Spirale über 5 km lang.',
                how: 'Der Laser leuchtet von unten durch diesen Kunststoff hindurch auf die Datenschicht. Kleine Kratzer auf der Unterseite liegen deshalb unscharf „neben“ dem Lichtpunkt und stören oft kaum.',
                anchor: [...L(R), 1.2], side: 'L', explode: [0, 0, 0],
            }, (s) => {
                let g = s.cyl(CX, CY, 0, R, 2.4, M.glass, { hole: HOLE, topFill: glassTop, sideFill: 'rgba(120,210,255,0.28)' });
                g += s.rings(CX, CY, 2.41, 23, 58, 12, 'stroke="#7fe6ff" stroke-opacity=".28" stroke-width=".6"');
                return g;
            });
            sc.part({
                id: 'dye', short: 'Eine hauchdünne Farbschicht in einer spiralförmigen Rille.', howShort: 'Der Laser des Brenners färbt winzige Punkte dunkel. Hell und dunkel ergeben die Nullen und Einsen.', name: 'Farbstoffschicht', sub: 'hier liegen die Daten', data: true,
                info: 'Eine hauchdünne Schicht aus organischem Farbstoff, die in die Spiralrille gegossen ist. Sie liegt direkt unter der Spiegelschicht – also viel näher an der Oberseite (dem Etikett) als an der Unterseite.',
                how: 'Beim Brennen erhitzt ein Laser (780 nm, unsichtbares Infrarot) den Farbstoff an winzigen Stellen. Dort verfärbt er sich dunkel und wirft weniger Licht zurück. Beim Lesen tastet ein schwächerer Laser die Spur ab: Aus dem Wechsel zwischen hell und dunkel macht das Laufwerk Nullen und Einsen. Bei gekauften Musik-CDs sind die Daten stattdessen als winzige Vertiefungen (Pits) ins Plastik gepresst.',
                anchor: [...L(59), 2.55], side: 'L', explode: [0, 0, 38],
            }, (s) => {
                let g = s.cyl(CX, CY, 2.4, 59, 0.3, M.data, { hole: 22.5, topFill: s.linGrad([[0, '#1fd6a0'], [0.5, '#0e8f7a'], [1, '#2fc7d8']], 0, 0, 1, 1), sideFill: '#0b5a4c' });
                g += s.rings(CX, CY, 2.71, 25, 57, 10, 'stroke="#ff2a6d" stroke-opacity=".45" stroke-width=".7"');
                return g;
            });
            sc.part({
                id: 'refl', short: 'Ein hauchdünner Metallspiegel. Er wirft das Laserlicht zurück.', name: 'Reflexionsschicht', sub: 'Metall-Spiegel',
                info: 'Ein extrem dünner Metallfilm aus Silber, Gold oder Aluminium – ein Spiegel. Er wirft das Laserlicht zurück zum Lesekopf im Laufwerk. Ohne Spiegel käme kein Licht zurück und das Laufwerk könnte nichts lesen.',
                anchor: [...Rt(59.3), 2.8], side: 'R', explode: [0, 0, 74],
            }, (s) => s.cyl(CX, CY, 2.7, 59.3, 0.2, M.steel, { hole: 22, topFill: silver(s) }));
            sc.part({
                id: 'lacq', short: 'Dünner Lack, der den Spiegel darunter vor Kratzern schützt.', name: 'Schutzlack', sub: 'ca. 0,01 mm',
                info: 'Eine dünne, durchsichtige Lackschicht. Sie schützt den empfindlichen Metallspiegel vor Kratzern, Luft und Feuchtigkeit. Weil die Daten direkt darunter liegen, ist ein Kratzer auf der Oberseite viel gefährlicher als einer auf der Unterseite!',
                anchor: [...Rt(59.6), 3], side: 'R', explode: [0, 0, 108],
            }, (s) => s.cyl(CX, CY, 2.9, 59.6, 0.2, M.glass, { hole: 19, topFill: 'rgba(190,140,255,0.22)', sideFill: 'rgba(190,140,255,0.35)' }));
            sc.part({
                id: 'label', short: 'Die bedruckte Oberseite. Nur mit weichem Stift beschriften!', name: 'Etikett / Aufdruck', sub: 'Oberseite',
                info: 'Die bedruckte Oberseite, auf der du die CD beschriften kannst – aber nur mit weichem Filzstift, nie mit Kuli! Ein harter Stift kann durch Lack und Spiegel bis in die Datenschicht drücken.',
                anchor: [...L(59), 3.2], side: 'L', explode: [0, 0, 144],
            }, (s) => {
                let g = s.cyl(CX, CY, 3.1, 59, 0.15, M.plasticL, { hole: 17, topFill: s.linGrad([[0, '#2a1d4d'], [0.5, '#16264a'], [1, '#1d3d55']], 0, 0, 1, 1) });
                g += s.circ(CX, CY, 3.26, 50, 'fill="none" stroke="#f9f002" stroke-opacity=".6" stroke-width="1.2"');
                g += s.circ(CX, CY, 3.26, 24, 'fill="none" stroke="#3fd8ff" stroke-opacity=".5" stroke-width="1"');
                g += s.flatText(CX - 24, CY + 36, 3.27, 'CD-R · 700 MB · 80 min', 9.5, 'fill="#e9f2ff" font-family="Lexend, system-ui, sans-serif" font-weight="700"');
                return g;
            });
            laser(sc, 0, 38 + 2.7, '780 nm', '#ff4d4d', 'Infrarot-Laser');
            return sc;
        },
    };

    MV.exploded.dvd = {
        title: 'DVD±R',
        note: 'Schichtdicken stark vergrößert – eine DVD ist wie die CD 1,2 mm dick, besteht aber aus zwei 0,6-mm-Scheiben.',
        build() {
            const sc = new MV.Scene(2.8, 20);

            sc.part({
                id: 'sub', short: 'Untere Kunststoffscheibe mit der Spurrille. Der Laser leuchtet hindurch.', name: 'Trägerscheibe', sub: '0,6 mm, mit Spurrille',
                info: 'Die untere Hälfte der DVD: 0,6 mm glasklarer Kunststoff mit der eingepressten Spiralrille. Der Laser leuchtet von unten hindurch.',
                how: 'Weil die Daten nur 0,6 mm tief liegen (bei der CD 1,2 mm), kann der Laser seinen Lichtpunkt schärfer bündeln – ein Grund, warum mehr Daten auf die DVD passen.',
                anchor: [...L(R), 0.7], side: 'L', explode: [0, 0, 0],
            }, (s) => {
                let g = s.cyl(CX, CY, 0, R, 1.4, M.glass, { hole: HOLE, topFill: glassTop, sideFill: 'rgba(120,210,255,0.28)' });
                g += s.rings(CX, CY, 1.41, 23, 58, 18, 'stroke="#7fe6ff" stroke-opacity=".28" stroke-width=".5"');
                return g;
            });
            sc.part({
                id: 'dye', short: 'Eine Farbschicht genau in der Mitte der DVD.', howShort: 'Wie bei der CD färbt ein Laser winzige Punkte – ein roter Laser macht aber kleinere Punkte. So passt etwa 7-mal so viel drauf.', name: 'Farbstoffschicht', sub: 'hier liegen die Daten', data: true,
                info: 'Wie bei der CD-R eine hauchdünne Farbstoffschicht in der Spiralrille – sie liegt genau in der Mitte der DVD, zwischen den beiden Kunststoffscheiben.',
                how: 'Ein roter Laser (650 nm) verfärbt beim Brennen winzige Stellen; beim Lesen ergibt der Wechsel zwischen hell und dunkel die Nullen und Einsen. Rotes Licht lässt sich auf einen kleineren Punkt bündeln als Infrarot: Die Punkte sind kleiner und die Spurringe liegen mit 0,74 statt 1,6 Tausendstel Millimetern mehr als doppelt so dicht. So passen etwa 7-mal so viele Daten drauf wie auf eine CD.',
                anchor: [...L(58.5), 1.55], side: 'L', explode: [0, 0, 38],
            }, (s) => {
                let g = s.cyl(CX, CY, 1.4, 58.5, 0.3, M.data, { hole: 22.5, topFill: s.linGrad([[0, '#7a3cff'], [0.5, '#3a1d9a'], [1, '#b04dff']], 0, 0, 1, 1), sideFill: '#2a136b' });
                g += s.rings(CX, CY, 1.71, 24, 57, 18, 'stroke="#ff2a6d" stroke-opacity=".45" stroke-width=".55"');
                return g;
            });
            sc.part({
                id: 'refl', short: 'Hauchdünner Silberspiegel, wirft das Laserlicht zurück.', name: 'Reflexionsschicht', sub: 'Silber-Spiegel',
                info: 'Ein hauchdünner Spiegel aus einer Silberlegierung. Er wirft das Laserlicht zurück zum Lesekopf.',
                anchor: [...Rt(59), 1.8], side: 'R', explode: [0, 0, 74],
            }, (s) => s.cyl(CX, CY, 1.7, 59, 0.2, M.steel, { hole: 22, topFill: silver(s) }));
            sc.part({
                id: 'glue', short: 'Kleber, der die zwei Hälften der DVD verbindet.', name: 'Klebeschicht', sub: 'verbindet beide Hälften',
                info: 'Ein durchsichtiger Kleber verbindet die beiden 0,6-mm-Scheiben. Eine DVD ist also ein „Sandwich“ – die Daten liegen geschützt in der Mitte.',
                anchor: [...Rt(59.5), 2.05], side: 'R', explode: [0, 0, 108],
            }, (s) => s.cyl(CX, CY, 1.9, 59.5, 0.3, M.glass, { hole: 18, topFill: 'rgba(249,240,2,0.16)', sideFill: 'rgba(249,240,2,0.3)' }));
            sc.part({
                id: 'dummy', short: 'Obere Kunststoffscheibe, 0,6 mm dick, mit Aufdruck.', name: 'Deckscheibe', sub: '0,6 mm, bedruckt',
                info: 'Die obere Hälfte: noch einmal 0,6 mm Kunststoff. Sie macht die DVD stabil und schützt die Daten von oben. Darauf ist das Etikett gedruckt.',
                anchor: [...L(R), 2.9], side: 'L', explode: [0, 0, 144],
            }, (s) => {
                let g = s.cyl(CX, CY, 2.2, R, 1.4, M.glass, { hole: HOLE, topFill: s.linGrad([[0, '#1c1640'], [0.5, '#251a55'], [1, '#13314a']], 0, 0, 1, 1), sideFill: 'rgba(120,210,255,0.28)' });
                g += s.circ(CX, CY, 3.61, 52, 'fill="none" stroke="#ff2a6d" stroke-opacity=".55" stroke-width="1.2"');
                g += s.circ(CX, CY, 3.61, 20, 'fill="none" stroke="#3fd8ff" stroke-opacity=".5" stroke-width="1"');
                g += s.flatText(CX - 14, CY + 34, 3.62, 'DVD-R · 4.7 GB', 10, 'fill="#e9f2ff" font-family="Lexend, system-ui, sans-serif" font-weight="700"');
                return g;
            });
            laser(sc, 0, 38 + 1.7, '650 nm', '#ff3030', 'Roter Laser');
            return sc;
        },
    };
})();
