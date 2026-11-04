/* Dimensionsvergleich: Wie viele Datenträger X passen in Datenträger Y?
 *  1) Kachel-Zoom (flächengetreu): 1 Kästchen = Kapazität des kleineren Mediums
 *  2) Stapelhöhe: so viele kleine Medien übereinander, wie für das große nötig sind
 *  3) Rangliste aller gescannten Geräte auf logarithmischer Skala */
(function () {
    const MV = window.MV;
    const U = MV.units;
    const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function tiles(cv, small, big, opt = {}) {
        const k = big.cap / small.cap; // Anzahl kleiner Einheiten im großen Medium
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const r = cv.getBoundingClientRect();
        const W = Math.max(240, r.width), H = Math.max(200, r.height);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        const c = cv.getContext('2d');
        c.setTransform(dpr, 0, 0, dpr, 0, 0);

        const pad = 12;
        const aw = W - pad * 2, ah = H - pad * 2;
        const cols = Math.max(1, Math.ceil(Math.sqrt(k * (aw / ah))));
        const full = Math.floor(k), frac = k - full;
        const total = Math.ceil(k);
        const rows = Math.ceil(total / cols);
        const zf = Math.min(aw / cols, ah / rows);
        const z0 = Math.max(zf, Math.min(aw, ah) * 0.42);
        const Of = [pad + (aw - cols * zf) / 2, pad + (ah - rows * zf) / 2];
        const O0 = [W / 2 - z0 / 2, H / 2 - z0 / 2];

        const drawAt = (u) => {
            const z = z0 * Math.pow(zf / z0, u);
            const ox = O0[0] + (Of[0] - O0[0]) * u, oy = O0[1] + (Of[1] - O0[1]) * u;
            c.clearRect(0, 0, W, H);
            const cyan = 'rgba(63,216,255,';
            if (z >= 3) {
                const c0 = Math.max(0, Math.floor(-ox / z)), c1 = Math.min(cols - 1, Math.ceil((W - ox) / z));
                const r0 = Math.max(0, Math.floor(-oy / z)), r1 = Math.min(rows - 1, Math.ceil((H - oy) / z));
                const gap = z >= 8 ? Math.min(3, z * 0.08) : 0.5;
                for (let rr = r0; rr <= r1; rr++) {
                    for (let cc = c0; cc <= c1; cc++) {
                        const i = rr * cols + cc;
                        if (i >= total) break;
                        const x = ox + cc * z, y = oy + rr * z;
                        const wFrac = i === full && frac > 0 ? frac : 1;
                        c.fillStyle = i === 0 ? 'rgba(255,42,109,.9)' : cyan + (0.22 + 0.12 * ((i * 7) % 3) / 2) + ')';
                        c.fillRect(x + gap / 2, y + gap / 2, (z - gap) * wFrac, z - gap);
                    }
                }
            } else {
                // Kästchen kleiner als 3 px: als Fläche zeichnen
                c.fillStyle = cyan + '0.32)';
                c.fillRect(ox, oy, cols * z, Math.floor(total / cols) * z);
                const rest = total - Math.floor(total / cols) * cols;
                if (rest) c.fillRect(ox, oy + Math.floor(total / cols) * z, rest * z, z);
                c.fillStyle = '#ff2a6d';
                c.fillRect(ox, oy, Math.max(2, z), Math.max(2, z));
            }
            // Umriss des großen Mediums
            c.strokeStyle = 'rgba(63,216,255,.9)'; c.lineWidth = 1.5;
            c.strokeRect(ox, oy, cols * z, Math.min(rows, Math.ceil(total / cols)) * z);
            // Markierung des einen kleinen Mediums
            if (z < 14) {
                c.strokeStyle = '#ff2a6d'; c.lineWidth = 2;
                c.beginPath(); c.arc(ox + z / 2, oy + z / 2, 9, 0, Math.PI * 2); c.stroke();
            }
        };

        const fast = reduce() || opt.instant;
        if (fast || zf >= z0) { drawAt(1); return { stop() {} }; }
        const D = 3600, t0 = performance.now();
        let raf;
        const step = (now) => {
            const t = Math.min(1, (now - t0) / D);
            const u = t < 0.15 ? 0 : (t - 0.15) / 0.85;
            drawAt(1 - Math.pow(1 - u, 2.2));
            if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return { stop() { cancelAnimationFrame(raf); } };
    }

    function stack(small, big) {
        const n = Math.ceil(big.cap / small.cap);
        const hmm = n * small.thick;
        const refs = MV.REFERENCES;
        let ref = null;
        for (const r of refs) if (r.h <= hmm) ref = r;
        let text, refH, refName;
        const intro = `Für so viele Daten wie auf ${big.article === 'der' ? 'einem' : big.article === 'das' ? 'einem' : 'einer'} ${big.name} brauchst du ${U.count(n)} ${n === 1 ? small.name : small.plural}. Gestapelt: ${U.length(hmm)}`;
        if (!ref) {
            refH = big.thick; refName = `1 ${big.name}`;
            const x = hmm / big.thick;
            text = x < 1.15 ? `${intro} – etwa so hoch wie ${big.article === 'der' || big.article === 'das' ? 'ein' : 'eine'} ${big.name} (${U.length(big.thick)}).`
                : `${intro} – ${U.times(x)}-mal so hoch wie ${big.article === 'der' || big.article === 'das' ? 'ein' : 'eine'} ${big.name} (${U.length(big.thick)}).`;
        } else {
            refH = ref.h; refName = ref.name.replace(/^(ein|eine|der|die|das) /, '');
            const x = hmm / ref.h;
            text = x < 1.15 ? `${intro} – etwa so hoch wie ${ref.name}!` : `${intro} – ${U.times(x)}-mal so hoch wie ${ref.name}!`;
        }
        const max = Math.max(hmm, refH);
        const H = 200;
        const hs = Math.max(2, (hmm / max) * H), hr = Math.max(2, (refH / max) * H);
        const stripes = Math.min(40, n);
        let st = '';
        for (let i = 0; i < stripes; i++) {
            const y = 220 - hs + (hs / stripes) * i;
            st += `<rect x="60" y="${y.toFixed(1)}" width="70" height="${Math.max(0.8, hs / stripes - 1).toFixed(1)}" fill="${i % 2 ? '#3fd8ff' : '#2ab8de'}" fill-opacity="${0.45 + 0.4 * (i % 3) / 2}"/>`;
        }
        const svg = `<svg viewBox="0 0 320 250" class="cmp-stack-svg" role="img" aria-label="${text}">` +
            `<line x1="20" y1="220.5" x2="300" y2="220.5" stroke="#3fd8ff" stroke-opacity=".5"/>` + st +
            `<rect x="60" y="${(220 - hs).toFixed(1)}" width="70" height="${hs.toFixed(1)}" fill="none" stroke="#3fd8ff"/>` +
            `<rect x="190" y="${(220 - hr).toFixed(1)}" width="70" height="${hr.toFixed(1)}" fill="rgba(249,240,2,.12)" stroke="#f9f002" stroke-dasharray="4 3"/>` +
            `<text x="95" y="238" text-anchor="middle" class="cmp-t">${U.length(hmm)}</text>` +
            `<text x="225" y="238" text-anchor="middle" class="cmp-t">${U.length(refH)}</text>` +
            `<text x="95" y="${Math.max(14, 212 - hs).toFixed(0)}" text-anchor="middle" class="cmp-t2">Stapel</text>` +
            `<text x="225" y="${Math.max(14, 212 - hr).toFixed(0)}" text-anchor="middle" class="cmp-t2 y">${refName.length > 20 ? refName.slice(0, 19) + '…' : refName}</text>` +
            `</svg>`;
        return { svg, text, n, hmm };
    }

    function ladder(list, hi) {
        const K = 1024;
        const min = K, max = K ** 5; // 1 KB … 1 PB – jeder Strich ×1024
        const L = (b) => ((Math.log(b) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 100;
        const ticks = [['KB', K], ['MB', K ** 2], ['GB', K ** 3], ['TB', K ** 4]];
        return `<div class="ladder">` +
            `<div class="ladder-axis">${ticks.map(([t, b]) => `<span style="left:${L(b).toFixed(2)}%">1 ${t}</span>`).join('')}</div>` +
            list.map((d) => `<div class="ladder-row${hi.includes(d.id) ? ' hi' : ''}"><span class="ladder-name">${d.name}</span><span class="ladder-track"><span class="ladder-bar" style="width:${Math.max(1, L(d.cap)).toFixed(2)}%"></span></span><span class="ladder-val">${U.size(d.cap)}</span></div>`).join('') +
            `<p class="ladder-note">Logarithmische Skala: Von einem Strich zum nächsten wird alles 1024-mal so groß!</p>` +
            `</div>`;
    }

    MV.compareViz = { tiles, stack, ladder };
})();
