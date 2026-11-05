/* Explosionsansicht: Smartphone – Maße in mm, ca. 71 × 147 × 8.
 * Von vorn gesehen: x nach rechts, y nach unten – die Oberkante (Kamera, Hauptplatine) liegt bei y = 0.
 * Die Kamera sitzt (von vorn gesehen) oben rechts, von hinten also oben links – wie beim iPhone. */
(function () {
    const MV = window.MV;
    const { rrect } = MV.geo;
    const M = MV.MAT;
    const box = (x, y, w, d) => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];

    MV.exploded.smartphone = {
        title: 'Smartphone',
        build() {
            const sc = new MV.Scene(2.25, 22);
            const OUT = rrect(0, 0, 71, 147, 9, 6);
            const MID = 24, CHIP = 38;

            sc.part({
                id: 'back', short: 'Rückseite mit Fenstern für die Kameras.', name: 'Rückseite', sub: 'Glas mit Kamerafenster',
                info: 'Die Rückseite aus Glas, Kunststoff oder Metall. Durch die kleinen Fenster schauen die Kameralinsen nach draußen.',
                anchor: [71, 60, 0.4], side: 'R', explode: [0, 0, 0],
            }, (s) => {
                let g = s.prism(OUT, 0, 0.8, M.glass, { topFill: s.linGrad([[0, 'rgba(63,216,255,.10)'], [1, 'rgba(255,42,109,.12)']], 0, 0, 1, 1) });
                // Kamera-Insel mit zwei Linsenfenstern (diagonal) und Blitz
                g += s.flat(rrect(45, 3.5, 22, 22, 5), 0.81, 'fill="#0b0f1c" stroke="#7fe6ff" stroke-width="1"');
                g += s.circ(60.5, 10, 0.82, 4, 'fill="#05060a" stroke="#7fe6ff" stroke-width="1"');
                g += s.circ(51.5, 19, 0.82, 4, 'fill="#05060a" stroke="#7fe6ff" stroke-width="1"');
                g += s.circ(61, 19.5, 0.82, 1.4, 'fill="#f9f002" fill-opacity=".7"');
                return g;
            });

            sc.part({
                id: 'batt', short: 'Speichert Energie, aber keine Daten.', inner: true, name: 'Akku', sub: 'Energie, keine Daten',
                info: 'Ein flacher Lithium-Ionen-Akku. Er speichert elektrische Energie für einen ganzen Tag – aber keine Daten. Er ist das größte Bauteil im Handy.',
                anchor: [64, 100, 5.7], side: 'R', explode: [0, 0, MID],
            }, (s) => {
                let g = s.prism(rrect(7, 49, 57, 90, 3), 1.2, 4.5, M.battery);
                g += s.flatText(20, 90, 5.71, 'Li-Ion  3,87 V', 6, 'fill="#f9f002" fill-opacity=".85" font-family="Lexend, system-ui, sans-serif" font-weight="700"');
                g += s.flatText(20, 100, 5.71, '4500 mAh', 5, 'fill="#9aa4b8" font-family="monospace"');
                return g;
            });

            sc.part({
                id: 'cam', short: 'Macht Fotos – sie landen als Datei im Flash-Speicher.', inner: true, name: 'Kameramodul', sub: 'Linsen + Bildsensor',
                info: 'Mehrere Kameras mit Linsen und einem Bildsensor aus Millionen lichtempfindlicher Punkte. Jedes Foto wird zu einer Datei, die im Flash-Speicher landet.',
                anchor: [65, 12, 4], side: 'R', explode: [0, 0, MID],
            }, (s) => {
                let g = s.prism(rrect(46.5, 5, 19, 19, 2), 1.2, 5.5, M.chip);
                // Linsen zeigen nach unten zur Rückseite – oben sieht man die Sensor-Rückseiten
                g += s.flat(box(56.5, 6, 8, 8), 6.71, 'fill="#20242f" stroke="#9aa4b8" stroke-width=".5"');
                g += s.flat(box(47.5, 15, 8, 8), 6.71, 'fill="#20242f" stroke="#9aa4b8" stroke-width=".5"');
                // Flachkabel zur Hauptplatine
                g += s.flat(box(42, 12, 4.5, 3), 3.1, 'fill="#c98a2e" stroke="#ffc58a" stroke-width=".6"');
                return g;
            });

            sc.part({
                id: 'board', short: 'Die Platine verbindet alle Chips miteinander.', inner: true, name: 'Hauptplatine', sub: 'verbindet alle Chips',
                info: 'Eine dicht bestückte Platine mit vielen Lagen Leiterbahnen übereinander. Auf ihr sitzen Prozessor, Arbeitsspeicher, Flash-Speicher und Funkchips.',
                anchor: [43, 44, 3], side: 'L', explode: [0, 0, MID],
            }, (s) => {
                let g = s.prism(box(6, 5, 37, 39), 2, 1, M.pcb);
                for (let i = 0; i < 6; i++) g += s.line3([8, 8 + i * 6, 3.01], [41, 8 + i * 6, 3.01], 'stroke="#39ff88" stroke-opacity=".25" stroke-width=".8"');
                g += s.flat(box(26, 30, 8, 6), 3.02, 'fill="#14141c" stroke="#9aa4b8" stroke-width=".5"');
                return g;
            });

            sc.part({
                id: 'soc', short: 'Der Prozessor rechnet – speichert aber keine Fotos.', inner: true, name: 'Prozessor (SoC)', sub: 'rechnet – speichert nicht',
                info: '„System on a Chip“: Prozessor, Grafikchip, Modem und vieles mehr auf einem einzigen Chip. Er rechnet blitzschnell, speichert deine Fotos aber nicht dauerhaft.',
                anchor: [40, 15, 4], side: 'L', explode: [0, 0, CHIP],
            }, (s) => {
                let g = s.prism(box(26, 8, 14, 14), 3, 1.0, M.chip);
                g += s.flatText(28, 16, 4.01, 'SoC', 3.5, 'fill="#9aa4b8" font-family="Lexend, system-ui, sans-serif"');
                return g;
            });

            sc.part({
                id: 'ram', short: 'Kurzzeitgedächtnis für laufende Apps. Ohne Strom vergisst es alles.', inner: true, name: 'Arbeitsspeicher (RAM)', sub: 'vergisst ohne Strom',
                info: 'Das Kurzzeitgedächtnis, z. B. 8 GB. Hier liegen die Apps, die gerade laufen. Bei vielen Handys sitzt der RAM-Chip direkt auf dem Prozessor (Stapelbauweise). Achtung: Die Speichergröße in den Einstellungen meint nicht den RAM, sondern den Flash-Speicher!',
                how: 'Jede Speicherzelle ist ein winziger Ladungsspeicher (Kondensator): geladen = 1, leer = 0. Die Ladung versickert sehr schnell, darum wird jede Zelle viele Male pro Sekunde aufgefrischt. Fehlt der Strom, ist alles weg.',
                anchor: [26.5, 8.5, 4.9], side: 'L', explode: [0, 0, CHIP + 16],
            }, (s) => {
                let g = s.prism(box(26.5, 8.5, 13, 13), 4, 0.9, { ...M.chip, stroke: '#3fd8ff' });
                g += s.flatText(28, 16, 4.91, 'LPDDR', 2.8, 'fill="#3fd8ff" font-family="Lexend, system-ui, sans-serif"');
                return g;
            });

            sc.part({
                id: 'ufs', short: 'Der dauerhafte Speicher für Fotos, Musik und Apps.', howShort: 'Gleiche Technik wie beim USB-Stick: Eingesperrte Elektronen bedeuten 0 oder 1 – auch ohne Strom.', inner: true, name: 'Flash-Speicher (UFS)', sub: 'hier liegen die Daten', data: true,
                info: 'Der dauerhafte Speicher des Handys: Fotos, Musik, Apps und Nachrichten. Seine Größe (z. B. 128 GB) ist genau die Zahl, die du in den Einstellungen unter „Speicher“ findest.',
                how: 'Die gleiche Technik wie im USB-Stick: In NAND-Flash-Zellen werden Elektronen in einer isolierten Falle eingesperrt – gefangen oder nicht ergibt 0 oder 1, auch ohne Strom. Im Chip sind die Zellen in über 100 Lagen übereinander gestapelt (3D-NAND), wie ein Hochhaus für Daten.',
                anchor: [8, 40, 4], side: 'R', explode: [0, 0, CHIP],
            }, (s) => {
                let g = s.prism(box(8, 27, 12, 13), 3, 1.0, M.data, { topFill: '#16101a' });
                g += s.flatText(9.5, 33, 4.01, 'UFS 4.0', 2.6, 'fill="#ff7aa2" font-family="Lexend, system-ui, sans-serif" font-weight="700"');
                g += s.flatText(9.5, 37, 4.01, '128 GB', 2.2, 'fill="#9aa4b8" font-family="monospace"');
                return g;
            });

            sc.part({
                id: 'frame', short: 'Stabiler Metallrahmen – oft auch die Antenne.', name: 'Rahmen', sub: 'Aluminium',
                info: 'Der stabile Metallrahmen hält alles zusammen. Teile davon dienen oft als Antenne für Mobilfunk und WLAN.',
                anchor: [71, 138, 4], side: 'R', explode: [0, 0, 92],
            }, (s) => s.prism(OUT, 0.8, 6.4, M.metal, { hole: rrect(2.2, 2.2, 66.6, 142.6, 7, 6), topFill: s.linGrad([[0, '#9fb0c8'], [0.5, '#56637a'], [1, '#aab9cf']], 0, 0, 1, 1) }));

            sc.part({
                id: 'disp', short: 'Schutzglas und Bildschirm, der deine Finger erkennt.', name: 'Display', sub: 'Glas + OLED + Touch',
                info: 'Unter dem Schutzglas liegt der OLED-Bildschirm: Millionen winziger Lämpchen (Pixel), die selbst leuchten. Dazu kommt eine hauchdünne Touch-Schicht, die deine Finger erkennt.',
                anchor: [0.4, 40, 8], side: 'L', explode: [0, 0, 122],
            }, (s) => {
                let g = s.prism(rrect(0.4, 0.4, 70.2, 146.2, 8.6, 6), 7.2, 1.2, M.black, { topFill: s.linGrad([[0, '#0b1030'], [0.45, '#05060c'], [0.55, '#141a3a'], [1, '#05060c']], 0, 0, 1, 1) });
                // Frontkamera als „Pille“ oben in der Mitte
                g += s.flat(rrect(29.5, 4.5, 12, 3.6, 1.8, 4), 8.41, 'fill="#000" stroke="#3fd8ff" stroke-opacity=".5"');
                g += s.flatText(14, 32, 8.42, '12:34', 14, 'fill="#3fd8ff" fill-opacity=".55" font-family="Lexend, system-ui, sans-serif" font-weight="700"');
                return g;
            });

            return sc;
        },
    };
})();
