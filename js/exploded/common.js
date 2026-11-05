/*
 * Gemeinsames Zeichen-Framework für die Explosionsansichten.
 *
 * Koordinaten der Bauteile werden in Millimetern (x, y = Grundfläche, z = Höhe)
 * angegeben und dimetrisch projiziert. Jedes Bauteil ist eine eigene <g>-Gruppe,
 * die im zerlegten Zustand um einen 3D-Versatz (ex, ey, ez) verschoben wird.
 */
(function () {
    const MV = (window.MV = window.MV || {});
    MV.exploded = MV.exploded || {};

    let uid = 0;
    const f = (n) => (Math.round(n * 10) / 10).toString();

    /* Materialien: dunkle Flächen, Neon-Kanten */
    const MAT = {
        plastic:  { top: '#1b2138', a: '#141a2e', b: '#0d1121', stroke: '#3fd8ff', so: 0.7 },
        plasticL: { top: '#2a3150', a: '#1f2540', b: '#151a30', stroke: '#3fd8ff', so: 0.7 },
        metal:    { top: '#5d6a80', a: '#465165', b: '#323b4c', stroke: '#c9e6ff', so: 0.8 },
        steel:    { top: '#8a97ab', a: '#6c7889', b: '#525c6b', stroke: '#e3f2ff', so: 0.8 },
        pcb:      { top: '#0f4a35', a: '#0b3727', b: '#07281c', stroke: '#39ff88', so: 0.75 },
        chip:     { top: '#14141c', a: '#0c0c12', b: '#08080c', stroke: '#9aa4b8', so: 0.8 },
        glass:    { top: 'rgba(80,200,255,0.10)', a: 'rgba(80,200,255,0.20)', b: 'rgba(80,200,255,0.14)', stroke: '#7fe6ff', so: 0.9 },
        black:    { top: '#06070c', a: '#0b0d15', b: '#07080e', stroke: '#3fd8ff', so: 0.7 },
        battery:  { top: '#272b36', a: '#1d212b', b: '#151820', stroke: '#f9f002', so: 0.6 },
        magnet:   { top: '#3a2a2e', a: '#2c1f23', b: '#1f1518', stroke: '#ff9a6b', so: 0.7 },
        copper:   { top: '#b8732e', a: '#8f5922', b: '#6b4219', stroke: '#ffc58a', so: 0.8 },
        fleece:   { top: 'rgba(225,232,245,0.55)', a: 'rgba(200,210,230,0.6)', b: 'rgba(170,180,200,0.6)', stroke: '#e8eef8', so: 0.6 },
        data:     { top: '#3b0d2c', a: '#2c0921', b: '#1f0618', stroke: '#ff2a6d', so: 1 },
    };
    MV.MAT = MAT;

    class Scene {
        /**
         * @param {number} s  Maßstab px pro mm
         * @param {number} angle  Projektionswinkel in Grad (30 = isometrisch)
         */
        constructor(s, angle = 30) {
            this.s = s;
            this.ca = Math.cos((angle * Math.PI) / 180);
            this.sa = Math.sin((angle * Math.PI) / 180);
            this.id = 'xv' + ++uid;
            this.n = 0;
            this.parts = [];
            this.extras = [];
            this.defs = [];
            this.cur = null;
        }

        uid(p = 'u') { return `${this.id}-${p}${++this.n}`; }

        /* Projektion eines 3D-Punkts */
        P(x, y, z = 0) {
            const p = [(x - y) * this.ca * this.s, (x + y) * this.sa * this.s - z * this.s];
            if (this.cur) {
                const b = this.cur.bb;
                if (p[0] < b[0]) b[0] = p[0];
                if (p[1] < b[1]) b[1] = p[1];
                if (p[0] > b[2]) b[2] = p[0];
                if (p[1] > b[3]) b[3] = p[1];
            }
            return p;
        }
        /* Bildschirm-Versatz für einen 3D-Explosionsvektor */
        off(ex = 0, ey = 0, ez = 0) {
            return [(ex - ey) * this.ca * this.s, (ex + ey) * this.sa * this.s - ez * this.s];
        }
        /* Halbachsen eines projizierten Kreises (Radius r in mm) */
        ell(r) { return [Math.SQRT2 * r * this.s * this.ca, Math.SQRT2 * r * this.s * this.sa]; }

        def(str) { this.defs.push(str); }
        linGrad(stops, x1 = 0, y1 = 0, x2 = 1, y2 = 0) {
            const id = this.uid('g');
            this.def(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
                stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('') +
                `</linearGradient>`);
            return `url(#${id})`;
        }

        /* ---------- Primitive (liefern SVG-Strings) ---------- */
        pts(arr) { return arr.map((p) => f(p[0]) + ',' + f(p[1])).join(' '); }
        d(arr, close = true) { return 'M' + arr.map((p) => f(p[0]) + ' ' + f(p[1])).join(' L') + (close ? ' Z' : ''); }

        poly3(pts3, attrs = '') { return `<polygon points="${this.pts(pts3.map((p) => this.P(p[0], p[1], p[2])))}" ${attrs}/>`; }
        line3(a, b, attrs = '') {
            const p = this.P(...a), q = this.P(...b);
            return `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}" ${attrs}/>`;
        }
        /* Polygon in einer waagerechten Ebene z */
        flat(pts2, z, attrs = '') { return this.poly3(pts2.map((p) => [p[0], p[1], z]), attrs); }

        /* Kreis / Ellipse in waagerechter Ebene */
        circ(cx, cy, z, r, attrs = '') {
            const c = this.P(cx, cy, z), [rx, ry] = this.ell(r);
            this.P(cx, cy, z); // bbox
            this._growBox(c[0] - rx, c[1] - ry, c[0] + rx, c[1] + ry);
            return `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx)}" ry="${f(ry)}" ${attrs}/>`;
        }
        _growBox(x0, y0, x1, y1) {
            if (!this.cur) return;
            const b = this.cur.bb;
            b[0] = Math.min(b[0], x0); b[1] = Math.min(b[1], y0);
            b[2] = Math.max(b[2], x1); b[3] = Math.max(b[3], y1);
        }
        ellPath(c, rx, ry) {
            return `M${f(c[0] - rx)} ${f(c[1])} A${f(rx)} ${f(ry)} 0 1 0 ${f(c[0] + rx)} ${f(c[1])} A${f(rx)} ${f(ry)} 0 1 0 ${f(c[0] - rx)} ${f(c[1])} Z`;
        }

        /**
         * Senkrecht extrudiertes konvexes Polygon (Grundriss pts2 in mm).
         * m = Material {top,a,b,stroke,so}; opt.topFill überschreibt die Deckfläche,
         * opt.hole = innerer Grundriss (Durchbruch), opt.floorZ = Boden einer Vertiefung.
         */
        prism(pts2, z, h, m, opt = {}) {
            const sw = opt.sw || 1.1;
            const area = pts2.reduce((a, p, i) => { const q = pts2[(i + 1) % pts2.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
            const ccw = area > 0;
            let sides = '';
            const chain = [];
            for (let i = 0; i < pts2.length; i++) {
                const p = pts2[i], q = pts2[(i + 1) % pts2.length];
                const dx = q[0] - p[0], dy = q[1] - p[1];
                const nx = ccw ? dy : -dy, ny = ccw ? -dx : dx;
                if (nx + ny > 1e-9) {
                    const col = nx > ny ? m.a : m.b;
                    const quad = [this.P(p[0], p[1], z), this.P(q[0], q[1], z), this.P(q[0], q[1], z + h), this.P(p[0], p[1], z + h)];
                    sides += `<polygon points="${this.pts(quad)}" fill="${col}" stroke="${col}" stroke-width="0.6"/>`;
                    chain.push([p, q]);
                }
            }
            // sichtbare Unterkante + seitliche Silhouetten
            let outline = '';
            if (chain.length) {
                const bottom = chain.map(([p]) => this.P(p[0], p[1], z));
                const last = chain[chain.length - 1][1];
                bottom.push(this.P(last[0], last[1], z));
                // Kette kann über den Index-Umbruch laufen – nach Bildschirm-x ordnen ist für konvexe Grundrisse korrekt
                bottom.sort((a, b) => a[0] - b[0]);
                outline += `<polyline points="${this.pts(bottom)}" fill="none" stroke="${m.stroke}" stroke-opacity="${m.so * 0.8}" stroke-width="${sw}" stroke-linejoin="round"/>`;
                const L = bottom[0], R = bottom[bottom.length - 1];
                outline += `<line x1="${f(L[0])}" y1="${f(L[1])}" x2="${f(L[0])}" y2="${f(L[1] - h * this.s)}" stroke="${m.stroke}" stroke-opacity="${m.so * 0.8}" stroke-width="${sw}"/>`;
                outline += `<line x1="${f(R[0])}" y1="${f(R[1])}" x2="${f(R[0])}" y2="${f(R[1] - h * this.s)}" stroke="${m.stroke}" stroke-opacity="${m.so * 0.8}" stroke-width="${sw}"/>`;
            }
            const topPts = pts2.map((p) => this.P(p[0], p[1], z + h));
            const topFill = opt.topFill || m.top;
            let top;
            let inner = '';
            if (opt.hole) {
                const hp = opt.hole.map((p) => this.P(p[0], p[1], z + h));
                top = `<path d="${this.d(topPts)} ${this.d(hp)}" fill-rule="evenodd" fill="${topFill}" stroke="${m.stroke}" stroke-opacity="${m.so}" stroke-width="${sw}" stroke-linejoin="round"/>`;
                inner = this._holeWalls(opt.hole, z, h, m, opt.floorZ, opt.floorFill);
            } else {
                top = `<polygon points="${this.pts(topPts)}" fill="${topFill}" stroke="${m.stroke}" stroke-opacity="${m.so}" stroke-width="${sw}" stroke-linejoin="round"/>`;
            }
            return sides + outline + inner + top;
        }

        /* sichtbare Innenwände (und Boden) einer Öffnung, auf die Öffnung beschnitten */
        _holeWalls(hole, z, h, m, floorZ, floorFill) {
            const id = this.uid('c');
            const hp = hole.map((p) => this.P(p[0], p[1], z + h));
            this.def(`<clipPath id="${id}"><polygon points="${this.pts(hp)}"/></clipPath>`);
            const area = hole.reduce((a, p, i) => { const q = hole[(i + 1) % hole.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
            const ccw = area > 0;
            const zb = floorZ != null ? floorZ : z;
            let s = `<g clip-path="url(#${id})">`;
            if (floorZ != null) s += `<polygon points="${this.pts(hole.map((p) => this.P(p[0], p[1], floorZ)))}" fill="${floorFill || m.b}"/>`;
            for (let i = 0; i < hole.length; i++) {
                const p = hole[i], q = hole[(i + 1) % hole.length];
                const dx = q[0] - p[0], dy = q[1] - p[1];
                // nach innen (in die Öffnung) zeigende Normale
                const nx = ccw ? -dy : dy, ny = ccw ? dx : -dx;
                if (nx + ny > 1e-9) {
                    const col = nx > ny ? m.a : m.b;
                    const quad = [this.P(p[0], p[1], zb), this.P(q[0], q[1], zb), this.P(q[0], q[1], z + h), this.P(p[0], p[1], z + h)];
                    s += `<polygon points="${this.pts(quad)}" fill="${col}" stroke="${col}" stroke-width="0.6"/>`;
                }
            }
            return s + '</g>';
        }

        /**
         * Zylinder / Scheibe mit optionalem Mittelloch.
         * opt.topFill, opt.hole (Radius), opt.sideFill
         */
        cyl(cx, cy, z, r, h, m, opt = {}) {
            const sw = opt.sw || 1.1;
            const [rx, ry] = this.ell(r);
            const b = this.P(cx, cy, z), t = this.P(cx, cy, z + h);
            this._growBox(t[0] - rx, t[1] - ry, b[0] + rx, b[1] + ry);
            const hh = b[1] - t[1];
            const side = opt.sideFill || m.a;
            let s = '';
            if (hh > 0.05) {
                s += `<path d="M${f(t[0] - rx)} ${f(t[1])} A${f(rx)} ${f(ry)} 0 0 0 ${f(t[0] + rx)} ${f(t[1])} L${f(b[0] + rx)} ${f(b[1])} A${f(rx)} ${f(ry)} 0 0 1 ${f(b[0] - rx)} ${f(b[1])} Z" fill="${side}" stroke="${m.stroke}" stroke-opacity="${m.so * 0.8}" stroke-width="${sw}" stroke-linejoin="round"/>`;
            }
            const topFill = opt.topFill || m.top;
            if (opt.hole) {
                const [irx, iry] = this.ell(opt.hole);
                const id = this.uid('c');
                this.def(`<clipPath id="${id}"><path d="${this.ellPath(t, irx, iry)}"/></clipPath>`);
                s += `<path d="${this.ellPath(t, rx, ry)} ${this.ellPath(t, irx, iry)}" fill-rule="evenodd" fill="${topFill}" stroke="${m.stroke}" stroke-opacity="${m.so}" stroke-width="${sw}"/>`;
                if (hh > 0.05) {
                    s += `<path clip-path="url(#${id})" d="M${f(t[0] - irx)} ${f(t[1])} A${f(irx)} ${f(iry)} 0 0 1 ${f(t[0] + irx)} ${f(t[1])} L${f(t[0] + irx)} ${f(t[1] + hh)} A${f(irx)} ${f(iry)} 0 0 0 ${f(t[0] - irx)} ${f(t[1] + hh)} Z" fill="${m.b}"/>`;
                }
            } else {
                s += `<ellipse cx="${f(t[0])}" cy="${f(t[1])}" rx="${f(rx)}" ry="${f(ry)}" fill="${topFill}" stroke="${m.stroke}" stroke-opacity="${m.so}" stroke-width="${sw}"/>`;
            }
            return s;
        }

        /* konzentrische Ringe (z. B. Spuren) auf einer Scheibenoberseite */
        rings(cx, cy, z, r0, r1, n, attrs) {
            let s = '';
            for (let i = 0; i < n; i++) {
                const r = r0 + ((r1 - r0) * i) / Math.max(1, n - 1);
                s += this.circ(cx, cy, z, r, `fill="none" ${attrs}`);
            }
            return s;
        }

        /* Text, der flach auf einer waagerechten Fläche liegt */
        flatText(x, y, z, txt, size, attrs = '') {
            const p = this.P(x, y, z);
            // Verzerrungsmatrix: x-Achse -> (ca, sa), y-Achse -> (-ca, sa)
            const a = this.ca, b = this.sa, c = -this.ca, d = this.sa;
            return `<text transform="matrix(${f3(a)} ${f3(b)} ${f3(c)} ${f3(d)} ${f(p[0])} ${f(p[1])})" font-size="${size}" ${attrs}>${txt}</text>`;
        }

        /* ---------- Bauteile ---------- */
        part(def, draw) {
            this.cur = { ...def, bb: [Infinity, Infinity, -Infinity, -Infinity] };
            this.cur.svg = draw(this);
            const e = def.explode || [0, 0, 0];
            this.cur.offset = this.off(e[0], e[1], e[2]);
            if (def.anchor) {
                const a = def.anchor;
                const saved = this.cur; this.cur = null;
                const p = this.P(a[0], a[1], a[2]);
                this.cur = saved;
                this.cur.anchorPt = [p[0] + this.cur.offset[0], p[1] + this.cur.offset[1]];
            }
            this.parts.push(this.cur);
            this.cur = null;
        }
        /* Zusatzgrafik, die nur im zerlegten Zustand erscheint (z. B. Laserstrahl) */
        extra(draw) {
            this.cur = { bb: [Infinity, Infinity, -Infinity, -Infinity] };
            const svg = draw(this);
            this.extras.push({ svg, bb: this.cur.bb });
            this.cur = null;
        }
    }
    const f3 = (n) => (Math.round(n * 1000) / 1000).toString();

    /* ---------- Grundriss-Helfer (in mm) ---------- */
    function rrect(x, y, w, d, r, seg = 5) {
        const pts = [];
        const corner = (cx, cy, a0) => {
            for (let i = 0; i <= seg; i++) {
                const a = a0 + (Math.PI / 2) * (i / seg);
                pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
            }
        };
        if (r <= 0) return [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
        corner(x + w - r, y + r, -Math.PI / 2);
        corner(x + w - r, y + d - r, 0);
        corner(x + r, y + d - r, Math.PI / 2);
        corner(x + r, y + r, Math.PI);
        return pts;
    }
    function circlePts(cx, cy, r, n = 48) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }
        return pts;
    }
    MV.geo = { rrect, circlePts };

    /* ---------- Zusammenbau zu einem SVG ---------- */
    const VB_W = 1000, PAD = 30;

    /**
     * device = { build(): Scene, title }
     * opt.icon = true -> kleines Icon (zusammengebaut, ohne Beschriftung, ohne innere Bauteile)
     */
    function render(device, opt = {}) {
        const sc = device.build();
        const parts = sc.parts;
        // Begrenzungsrahmen zusammengebaut / zerlegt
        const uni = (list, useOff) => list.reduce((b, p) => {
            const o = useOff && p.offset ? p.offset : [0, 0];
            return [Math.min(b[0], p.bb[0] + o[0]), Math.min(b[1], p.bb[1] + o[1]), Math.max(b[2], p.bb[2] + o[0]), Math.max(b[3], p.bb[3] + o[1])];
        }, [Infinity, Infinity, -Infinity, -Infinity]);
        const asm = uni(parts, false);
        const exp = uni(parts.concat(sc.extras.map((e) => ({ bb: e.bb }))), true);

        if (opt.icon) {
            const pad = 6;
            const vb = `${f(asm[0] - pad)} ${f(asm[1] - pad)} ${f(asm[2] - asm[0] + 2 * pad)} ${f(asm[3] - asm[1] + 2 * pad)}`;
            return `<svg class="xv-icon" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${sc.defs.join('')}</defs>` +
                parts.filter((p) => !p.inner).map((p) => `<g>${p.svg}</g>`).join('') + `</svg>`;
        }

        // Zeichnung auf eine feste Breite skalieren
        const k = (VB_W - 2 * PAD) / (exp[2] - exp[0]);
        const tx = PAD - exp[0] * k;
        const ty = PAD - exp[1] * k;
        const H = Math.ceil((exp[3] - exp[1]) * k + 2 * PAD);
        const T = (p) => [tx + p[0] * k, ty + p[1] * k];

        const labelled = parts.filter((p) => p.anchorPt && p.name);
        // Nummer 1 = oberstes Bauteil (zuletzt gezeichnet)
        const order = labelled.slice().reverse();
        order.forEach((p, i) => (p.num = i + 1));

        // Bauteile: Versatz (in Szenen-Einheiten) als data-Attribute – bewegt wird per JS
        const partSvg = parts.map((p) => {
            const o = p.offset || [0, 0];
            const cls = 'xv-part' + (p.data ? ' is-data' : '') + (p.inner ? ' is-inner' : '') + (p.name ? ' has-info' : '');
            return `<g class="${cls}" data-part="${p.id || ''}" data-dx="${f(o[0])}" data-dy="${f(o[1])}"${p.inner ? ' opacity="0"' : ''}>${p.svg}</g>`;
        }).join('');
        const extraSvg = sc.extras.map((e) => e.svg).join('');

        const svg = `<svg class="xv" viewBox="0 0 ${VB_W} ${H}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Explosionsansicht: ${device.title}">` +
            `<defs>${sc.defs.join('')}</defs>` +
            `<g transform="translate(${f(tx)} ${f(ty)}) scale(${f3(k)})">` +
            `${partSvg}<g class="xv-extra" opacity="0">${extraSvg}</g>` +
            `</g></svg>`;

        const a0 = T([asm[0], asm[1]]), a1 = T([asm[2], asm[3]]);
        return {
            svg,
            view: [0, 0, VB_W, H],
            asmBox: [a0[0], a0[1], a1[0] - a0[0], a1[1] - a0[1]],
            parts: order.map((p) => {
                const o = p.offset || [0, 0];
                const a = T([p.bb[0] + o[0], p.bb[1] + o[1]]), b = T([p.bb[2] + o[0], p.bb[3] + o[1]]);
                return {
                    id: p.id, num: p.num, name: p.name, sub: p.sub, short: p.short, howShort: p.howShort, info: p.info, how: p.how, data: !!p.data,
                    box: [a[0], a[1], b[0] - a[0], b[1] - a[1]], anchor: T(p.anchorPt),
                };
            }),
            height: H,
        };
    }
    MV.renderExploded = render;
    MV.Scene = Scene;
})();
