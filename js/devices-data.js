/* Gerätedaten: typische Kapazität (Plausibilitätsprüfung), Dicke für den Stapel-Vergleich,
 * Hinweise zum Ablesen, Füll-Richtung der Speicher-Animation. */
(function () {
    const MV = (window.MV = window.MV || {});
    const K = 1024, MB = K * K, GB = MB * K, TB = GB * K;
    MV.DEVICES = [
        {
            id: 'floppy', name: 'Diskette', plural: 'Disketten', unit: 'mb', article: 'die', gen: 'der Diskette', year: 1987,
            range: [700 * K, 3 * MB], typical: '1,44 MB', thick: 3.3,
            hint: 'Schau auf das Etikett oder die Rückseite: Dort steht „HD“ und meist „1.44 MB“.',
            fill: 'tracks-out', verb: 'schreibt', file: 'brief', tech: 'magnetisch',
        },
        {
            id: 'cd', name: 'CD', plural: 'CDs', unit: 'mb', article: 'die', gen: 'der CD', year: 1982,
            range: [600 * MB, 900 * MB], typical: '700 MB', thick: 1.2,
            hint: 'Die Kapazität steht auf der Oberseite der CD oder auf der Hülle, z. B. „700 MB · 80 min“.',
            fill: 'spiral', verb: 'brennt', file: 'lied', tech: 'optisch',
        },
        {
            id: 'dvd', name: 'DVD', plural: 'DVDs', unit: 'gb', article: 'die', gen: 'der DVD', year: 1996,
            range: [3.5 * GB, 9 * GB], typical: '4,7 GB', thick: 1.2,
            hint: 'Auf der Oberseite oder der Hülle steht meist „4.7 GB“ (bei Double Layer „8.5 GB“).',
            fill: 'spiral', verb: 'brennt', file: 'selfie', tech: 'optisch',
        },
        {
            id: 'usb', name: 'USB-Stick', plural: 'USB-Sticks', unit: 'gb', article: 'der', gen: 'des USB-Sticks', year: 2000,
            range: [128 * MB, 2 * TB], typical: '8 GB – 256 GB', thick: 8,
            hint: 'Die Zahl ist auf das Gehäuse gedruckt oder graviert, z. B. „16 GB“ oder „64 GB“.',
            fill: 'flash', verb: 'speichert', file: 'lied', tech: 'elektronisch',
        },
        {
            id: 'smartphone', name: 'Smartphone', plural: 'Smartphones', unit: 'gb', article: 'das', gen: 'des Smartphones', year: 2007,
            range: [8 * GB, 2 * TB], typical: '64 GB – 1 TB', thick: 8,
            hint: 'Einstellungen → „Speicher“ (Android) bzw. Allgemein → „iPhone-Speicher“. Nimm die Gesamtkapazität – nicht den Arbeitsspeicher (RAM)!',
            fill: 'flash', verb: 'speichert', file: 'trailer', tech: 'elektronisch',
        },
        {
            id: 'hdd', name: 'Festplatte', plural: 'Festplatten', unit: 'gb', article: 'die', gen: 'der Festplatte', year: 1956,
            range: [40 * GB, 30 * TB], typical: '500 GB – 4 TB', thick: 26.1,
            hint: 'Auf dem Etikett oben auf der Festplatte steht die Kapazität, z. B. „1 TB“ oder „500 GB“.',
            fill: 'tracks-out', verb: 'schreibt', file: 'film', tech: 'magnetisch',
        },
    ];
    MV.deviceById = (id) => MV.DEVICES.find((d) => d.id === id);

    /* Bezugsgrößen für den Stapel-Vergleich (Höhe in mm) */
    MV.REFERENCES = [
        { name: 'ein Schultisch', h: 760 },
        { name: 'eine Zimmertür', h: 2000 },
        { name: 'eine Giraffe', h: 5500 },
        { name: 'ein Schulhaus (3 Stockwerke)', h: 12000 },
        { name: 'der Kölner Dom', h: 157000 },
        { name: 'der Berliner Fernsehturm', h: 368000 },
        { name: 'die Zugspitze', h: 2962000 },
        { name: 'der Mount Everest', h: 8849000 },
        { name: 'die Flughöhe eines Passagierflugzeugs', h: 11000000 },
        { name: 'die Raumstation ISS', h: 400000000 },
    ];
})();
