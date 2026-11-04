/* Speichervorgang: N Dateien werden auf den Datenträger gebrannt / geschrieben.
 * Gerätespezifische Darstellung:
 *  - spiral:     CD/DVD – der Laser brennt die Spirale von innen nach außen
 *  - tracks-out: Diskette/Festplatte – Spur für Spur von außen nach innen
 *  - flash:      USB/Handy – der Controller verteilt die Daten auf Speicherblöcke */
(function () {
    const MV = window.MV;
    const U = MV.units;
    const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const NOTES = {
        spiral: 'Der Laser brennt eine Spirale – von innen nach außen.',
        'tracks-out': 'Der Kopf schreibt Ring für Ring – von außen nach innen.',
        flash: 'Die Daten werden auf viele Speicherblöcke verteilt – bunt gemischt, damit sich keine Zelle abnutzt.',
    };

    function setupCanvas(cv) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const r = cv.getBoundingClientRect();
        const w = Math.max(200, r.width), h = Math.max(200, r.height);
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        const ctx = cv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w, h };
    }

    // Pseudozufällige, aber feste Block-Reihenfolge (Wear-Leveling-Illustration)
    function shuffled(n, seed = 7) {
        const a = [...Array(n).keys()];
        let s = seed;
        for (let i = n - 1; i > 0; i--) {
            s = (s * 9301 + 49297) % 233280;
            const j = Math.floor((s / 233280) * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function drawDisc(c, w, h, dev, f, t) {
        const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
        const optical = dev.fill === 'spiral';
        const r0 = R * (optical ? 0.38 : dev.id === 'floppy' ? 0.42 : 0.36), r1 = R * 0.97;
        c.clearRect(0, 0, w, h);
        // Scheibe
        let g = c.createRadialGradient(cx, cy, r0 * 0.5, cx, cy, R);
        if (dev.id === 'cd') { g.addColorStop(0, '#0e5d52'); g.addColorStop(1, '#14b48f'); }
        else if (dev.id === 'dvd') { g.addColorStop(0, '#2a136b'); g.addColorStop(1, '#7a3cff'); }
        else if (dev.id === 'floppy') { g.addColorStop(0, '#2e170c'); g.addColorStop(1, '#5a3420'); }
        else { g.addColorStop(0, '#5d6a80'); g.addColorStop(0.5, '#c9d1de'); g.addColorStop(1, '#6d788c'); }
        c.fillStyle = g;
        c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(63,216,255,.6)'; c.lineWidth = 1.5; c.stroke();
        // Spurlinien
        c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1;
        const nTr = optical ? 26 : dev.id === 'floppy' ? 20 : 34;
        if (optical) {
            c.beginPath();
            const turns = nTr, steps = turns * 60;
            for (let i = 0; i <= steps; i++) {
                const a = (i / 60) * Math.PI * 2, rr = r0 + (r1 - r0) * (i / steps);
                const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
                i ? c.lineTo(x, y) : c.moveTo(x, y);
            }
            c.stroke();
        } else {
            for (let i = 0; i <= nTr; i++) { c.beginPath(); c.arc(cx, cy, r0 + ((r1 - r0) * i) / nTr, 0, Math.PI * 2); c.stroke(); }
        }
        // beschriebener Bereich (flächengetreu)
        let rf, inner, outer;
        if (optical) { rf = Math.sqrt(r0 * r0 + f * (r1 * r1 - r0 * r0)); inner = r0; outer = rf; }
        else { rf = Math.sqrt(r1 * r1 - f * (r1 * r1 - r0 * r0)); inner = rf; outer = r1; }
        if (f > 0) {
            c.fillStyle = optical ? 'rgba(6,4,14,.62)' : 'rgba(255,42,109,.42)';
            c.beginPath(); c.arc(cx, cy, outer, 0, Math.PI * 2); c.arc(cx, cy, inner, 0, Math.PI * 2, true); c.fill('evenodd');
            c.strokeStyle = '#ff2a6d'; c.lineWidth = 1.2; c.setLineDash([3, 3]);
            c.beginPath(); c.arc(cx, cy, rf, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
        }
        // Mitte
        c.fillStyle = '#07060d';
        c.beginPath(); c.arc(cx, cy, optical ? R * 0.125 : R * 0.2, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(63,216,255,.5)'; c.stroke();
        if (dev.id === 'hdd') { c.fillStyle = '#9aa7ba'; c.beginPath(); c.arc(cx, cy, R * 0.18, 0, Math.PI * 2); c.fill(); }
        if (dev.id === 'floppy') { c.fillStyle = '#9aa7ba'; c.beginPath(); c.arc(cx, cy, R * 0.28, 0, Math.PI * 2); c.fill(); c.fillStyle = '#07060d'; c.fillRect(cx - 5, cy - 5, 10, 10); }

        // Laser / Kopf
        const ang = t * 0.012;
        const hx = cx + rf * Math.cos(ang), hy = cy + rf * Math.sin(ang);
        if (optical) {
            const glow = c.createRadialGradient(hx, hy, 0, hx, hy, 16);
            glow.addColorStop(0, dev.id === 'cd' ? 'rgba(255,80,80,1)' : 'rgba(255,40,40,1)');
            glow.addColorStop(1, 'rgba(255,40,40,0)');
            c.fillStyle = glow; c.beginPath(); c.arc(hx, hy, 16, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#fff'; c.beginPath(); c.arc(hx, hy, 2.2, 0, Math.PI * 2); c.fill();
        } else {
            // Arm / Kopfschlitten
            const px = dev.id === 'hdd' ? cx + R * 1.02 : cx, py = dev.id === 'hdd' ? cy + R * 0.95 : cy + R * 1.05;
            const hxa = dev.id === 'hdd' ? null : cx;
            let ex, ey;
            if (dev.id === 'hdd') {
                // Kopf auf Kreisbogen um den Drehpunkt, Radius rf um die Mitte
                const L = Math.hypot(px - cx, py - cy) * 0.86;
                const D = Math.hypot(px - cx, py - cy);
                const a0 = Math.atan2(cy - py, cx - px);
                const cosA = Math.max(-1, Math.min(1, (L * L + D * D - rf * rf) / (2 * L * D)));
                const a = a0 + Math.acos(cosA);
                ex = px + L * Math.cos(a); ey = py + L * Math.sin(a);
                c.strokeStyle = '#c9d1de'; c.lineWidth = 7; c.lineCap = 'round';
                c.beginPath(); c.moveTo(px, py); c.lineTo(ex, ey); c.stroke();
                c.fillStyle = '#5d6a80'; c.beginPath(); c.arc(px, py, 11, 0, Math.PI * 2); c.fill();
            } else {
                ex = hxa; ey = cy + rf;
                c.strokeStyle = '#c9d1de'; c.lineWidth = 6; c.lineCap = 'butt';
                c.beginPath(); c.moveTo(ex, py); c.lineTo(ex, ey); c.stroke();
            }
            c.fillStyle = '#ff2a6d'; c.shadowColor = '#ff2a6d'; c.shadowBlur = 12;
            c.fillRect(ex - 5, ey - 5, 10, 10); c.shadowBlur = 0;
        }
    }

    const FLASH_COLS = 24, FLASH_ROWS = 14, FLASH_N = FLASH_COLS * FLASH_ROWS;
    const order = shuffled(FLASH_N);
    const rank = new Array(FLASH_N);
    order.forEach((b, i) => (rank[b] = i));

    function drawFlash(c, w, h, dev, f, t) {
        c.clearRect(0, 0, w, h);
        const pad = 14;
        const cw = (w - pad * 2) / FLASH_COLS, ch = (h - pad * 2 - 20) / FLASH_ROWS;
        const s = Math.min(cw, ch);
        const ox = (w - s * FLASH_COLS) / 2, oy = (h - 20 - s * FLASH_ROWS) / 2 + 20;
        c.fillStyle = '#16101a';
        c.fillRect(ox - 8, oy - 8, s * FLASH_COLS + 16, s * FLASH_ROWS + 16);
        c.strokeStyle = 'rgba(255,42,109,.7)'; c.lineWidth = 1.4;
        c.strokeRect(ox - 8, oy - 8, s * FLASH_COLS + 16, s * FLASH_ROWS + 16);
        c.fillStyle = '#ff7aa2'; c.font = '500 13px Lexend, system-ui, sans-serif';
        c.fillText(dev.id === 'usb' ? 'Flash-Chip: Speicherblöcke' : 'Flash-Speicher: Speicherblöcke', ox - 6, oy - 14);
        const filled = f * FLASH_N;
        for (let b = 0; b < FLASH_N; b++) {
            const col = b % FLASH_COLS, row = Math.floor(b / FLASH_COLS);
            const x = ox + col * s, y = oy + row * s;
            const k = rank[b];
            let a;
            if (k < Math.floor(filled)) a = 1;
            else if (k === Math.floor(filled)) a = filled - Math.floor(filled);
            else a = 0;
            c.fillStyle = 'rgba(63,216,255,.07)';
            c.fillRect(x + 1, y + 1, s - 2, s - 2);
            if (a > 0) {
                c.fillStyle = `rgba(255,42,109,${0.35 + 0.55 * a})`;
                c.fillRect(x + 1, y + 1 + (s - 2) * (1 - a), s - 2, (s - 2) * a);
            }
        }
        // Controller-„Puls“ am gerade beschriebenen Block
        if (f > 0 && f < 1) {
            const b = order[Math.min(FLASH_N - 1, Math.floor(filled))];
            const x = ox + (b % FLASH_COLS) * s + s / 2, y = oy + Math.floor(b / FLASH_COLS) * s + s / 2;
            c.strokeStyle = '#f9f002'; c.lineWidth = 1.5;
            c.beginPath(); c.arc(x, y, s * (0.6 + 0.3 * Math.sin(t / 80)), 0, Math.PI * 2); c.stroke();
        }
    }

    function run(host, opt) {
        const { device: dev, file, capacity } = opt;
        const N = Math.floor(capacity / file.bytes);
        const fFinal = Math.min(1, (N * file.bytes) / capacity);
        const verbCap = dev.verb === 'brennt' ? 'wird gebrannt' : 'wird gespeichert';
        host.innerHTML =
            `<div class="fv">` +
            `<div class="fv-src"><div class="fv-stack t-${file.type}">${MV.fileIcon(file)}${MV.fileIcon(file)}${MV.fileIcon(file)}</div>` +
            `<div class="fv-src-name">${file.name}</div><div class="fv-src-size">je ${U.winSize(file.bytes)}</div></div>` +
            `<div class="fv-lane" aria-hidden="true"><div class="fv-beam"></div></div>` +
            `<div class="fv-dev"><canvas class="fv-canvas" role="img" aria-label="${dev.name} von oben: Der beschriebene Bereich wird pink."></canvas><div class="fv-dev-name">${dev.name} · ${U.size(capacity)}</div></div>` +
            `</div>` +
            `<div class="fv-stats">` +
            `<div class="fv-count"><span class="fv-n" id="fv-n">0</span><span class="fv-x">× ${file.name}</span></div>` +
            `<div class="fv-bar"><div class="fv-bar-fill" id="fv-bar"></div></div>` +
            `<div class="fv-meta"><span id="fv-used">0 Byte</span> von ${U.size(capacity)} · <span id="fv-pct">0 %</span> · <span class="fv-status" id="fv-status">${verbCap} …</span></div>` +
            `</div>` +
            `<p class="fv-note">${NOTES[dev.fill]}</p>`;

        const cv = host.querySelector('.fv-canvas');
        const lane = host.querySelector('.fv-lane');
        let { ctx, w, h } = setupCanvas(cv);
        const onResize = () => ({ ctx, w, h } = setupCanvas(cv));
        window.addEventListener('resize', onResize);
        const draw = dev.fill === 'flash' ? drawFlash : drawDisc;

        const fast = reduce();
        const SEQ = Math.min(N, 6);
        const seqDur = fast ? 0 : 1900;
        const T = fast ? 400 : Math.max(seqDur + 600, N <= 6 ? seqDur + 300 : 7600);
        const start = performance.now();
        let raf, done = false, flown = 0;

        const fly = () => {
            const chip = document.createElement('div');
            chip.className = `fv-chip t-${file.type}`;
            chip.innerHTML = MV.fileIcon(file);
            lane.appendChild(chip);
            requestAnimationFrame(() => chip.classList.add('go'));
            setTimeout(() => chip.remove(), 700);
        };

        const countAt = (el) => {
            if (el >= T) return N;
            if (el < seqDur) return Math.floor((el / seqDur) * SEQ);
            const u = (el - seqDur) / (T - seqDur);
            return Math.min(N, SEQ + Math.floor((N - SEQ) * u * u));
        };

        const finish = () => {
            if (done) return;
            done = true;
            cancelAnimationFrame(raf);
            update(N, performance.now());
            window.removeEventListener('resize', onResize);
            host.querySelector('#fv-status').textContent = N > 0 ? 'fertig ✓' : 'passt nicht ✗';
            host.querySelector('.fv').classList.add('done');
            opt.onDone && opt.onDone(N);
        };

        const update = (n, now) => {
            const f = N > 0 ? fFinal * (n / N) : 0;
            draw(ctx, w, h, dev, f, now - start);
            host.querySelector('#fv-n').textContent = U.num(n);
            host.querySelector('#fv-bar').style.width = (f * 100).toFixed(2) + '%';
            host.querySelector('#fv-used').textContent = U.size(n * file.bytes);
            host.querySelector('#fv-pct').textContent = U.num(f * 100, f < 0.1 ? 1 : 0) + ' %';
        };

        if (N === 0) {
            draw(ctx, w, h, dev, 0, 0);
            const chip = document.createElement('div');
            chip.className = `fv-chip bounce t-${file.type}`;
            chip.innerHTML = MV.fileIcon(file);
            lane.appendChild(chip);
            host.querySelector('.fv').classList.add('overflow');
            const to = setTimeout(finish, fast ? 50 : 1400);
            return { skip: finish, cancel() { done = true; clearTimeout(to); window.removeEventListener('resize', onResize); } };
        }

        const tick = (now) => {
            const el = now - start;
            const n = countAt(el);
            if (el < seqDur + 200 && n > flown && flown < SEQ) { flown = n; fly(); }
            else if (el >= seqDur && Math.random() < 0.35) fly();
            update(n, now);
            if (el >= T) return finish();
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return { skip: finish, cancel() { done = true; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); } };
    }

    MV.fillViz = { run };
})();
