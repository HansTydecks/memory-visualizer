/* Einheiten-Helfer. Wie im Datei-Explorer von Windows gilt hier: 1 KB = 1024 Byte. */
(function () {
    const MV = (window.MV = window.MV || {});
    const K = 1024;
    const FACT = { byte: 1, kb: K, mb: K ** 2, gb: K ** 3, tb: K ** 4 };
    const UNITS = ['Byte', 'KB', 'MB', 'GB', 'TB'];

    const num = (n, d = 0) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

    MV.units = {
        FACT,
        toBytes: (v, unit) => v * (FACT[unit] || 1),
        num,
        /* gut lesbare Größe, z. B. „4,11 MB“ */
        size(bytes, digits = 2) {
            if (!bytes) return '0 Byte';
            let i = Math.min(UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(K)));
            if (i < 0) i = 0;
            let v = bytes / K ** i;
            if (v >= 1000 && i > 0 && i < UNITS.length - 1) { i++; v /= K; } // „1.023 GB“ → „1,00 TB“
            if (i === 0) return num(v) + ' Byte';
            const d = v >= 100 ? 0 : v >= 10 ? Math.min(1, digits) : digits;
            return num(v, d) + ' ' + UNITS[i];
        },
        /* wie im Eigenschaften-Dialog: 3 gültige Stellen, abgeschnitten */
        winSize(bytes) {
            if (bytes < K) return num(bytes) + ' Bytes';
            let i = Math.floor(Math.log(bytes) / Math.log(K));
            let v = bytes / K ** i;
            if (v >= 1000) { i++; v /= K; }
            const d = v >= 100 ? 0 : v >= 10 ? 1 : 2;
            const t = Math.floor(v * 10 ** d) / 10 ** d;
            return num(t, d) + ' ' + UNITS[i];
        },
        /* große Anzahl in Worten-Form: 1.234.567 bzw. „2,4 Millionen“ */
        count(n) {
            if (n < 1e6) return num(Math.floor(n));
            if (n < 1e9) return num(n / 1e6, n < 1e7 ? 2 : 1) + ' Millionen';
            return num(n / 1e9, 2) + ' Milliarden';
        },
        /* Länge in mm -> lesbar */
        length(mm) {
            if (mm < 10) return num(mm, 1) + ' mm';
            if (mm < 1000) return num(mm / 10, mm < 100 ? 1 : 0) + ' cm';
            if (mm < 1e6) return num(mm / 1000, mm < 1e4 ? 2 : mm < 1e5 ? 1 : 0) + ' m';
            return num(mm / 1e6, mm < 1e7 ? 2 : 1) + ' km';
        },
        /* „x-mal“: ganze Zahlen ab 10, sonst eine Nachkommastelle */
        times(n) {
            if (n >= 10) return num(Math.round(n));
            const r = Math.round(n * 10) / 10;
            return Number.isInteger(r) ? num(r) : num(r, 1);
        },
        ratio(n) {
            if (Math.abs(n - Math.round(n)) < 0.005) return num(Math.round(n));
            if (n >= 100) return num(Math.round(n));
            if (n >= 10) return num(n, 1);
            return num(n, 2);
        },
    };
})();
