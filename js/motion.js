/*
 * Bewegung: Easing, Tweens und eine Kamera für die Explosionsansicht.
 *
 * Die Kamera verschiebt und skaliert das SVG-Element per CSS-Transform. Während einer
 * Fahrt übernimmt das der Compositor (GPU), statt das ganze SVG in jedem Frame neu zu
 * zeichnen; danach wird in der Endgröße scharf neu gerastert.
 */
(function () {
    const MV = (window.MV = window.MV || {});

    const ease = {
        linear: (t) => t,
        inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        outCubic: (t) => 1 - Math.pow(1 - t, 3),
        inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    };
    const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

    /** rAF-Tween: onUpdate(t ∈ [0,1], eased) – gibt { cancel } zurück */
    function tween({ dur, easing = ease.inOutCubic, onUpdate, onDone }) {
        let raf = 0, done = false;
        const t0 = performance.now();
        const step = (now) => {
            const t = dur > 0 ? clamp01((now - t0) / dur) : 1;
            onUpdate(t, easing(t));
            if (t < 1) raf = requestAnimationFrame(step);
            else { done = true; onDone && onDone(); }
        };
        raf = requestAnimationFrame(step);
        return { cancel() { if (!done) { cancelAnimationFrame(raf); done = true; } } };
    }

    /**
     * Glatter Zoom-und-Schwenk-Pfad (van Wijk & Nuij 2003, wie d3.interpolateZoom).
     * Ansichten als [cx, cy, w]. Liefert { at(t) -> [cx, cy, w], dur (ms) }.
     */
    function zoomPath(a, b, rho = 1.4) {
        const rho2 = rho * rho, rho4 = rho2 * rho2;
        const [ux0, uy0, w0] = a, [ux1, uy1, w1] = b;
        const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
        let S, at;
        if (d2 < 1e-9) {
            S = Math.log(w1 / w0) / rho;
            at = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
        } else {
            const d1 = Math.sqrt(d2);
            const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
            const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
            const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
            const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
            S = (r1 - r0) / rho;
            const c0 = Math.cosh(r0), s0 = Math.sinh(r0);
            at = (t) => {
                const s = t * S;
                const u = (w0 / (rho2 * d1)) * (c0 * Math.tanh(rho * s + r0) - s0);
                return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(rho * s + r0)];
            };
        }
        const dur = Math.abs(S) * 1000 * rho / Math.SQRT2;
        return { at, dur };
    }

    /**
     * Kamera über einem SVG mit fester viewBox (= base).
     * Ansicht = [cx, cy, w] in viewBox-Einheiten; das Seitenverhältnis bleibt das der Bühne.
     */
    class Camera {
        constructor(svgEl, onFrame) {
            this.svg = svgEl;
            this.onFrame = onFrame || (() => {});
            this.base = [0, 0, 1, 1];
            this.W = 1; this.H = 1;
            this.view = [0.5, 0.5, 1];
            this.anim = null;
        }
        /** Größe der Bühne in px und Übersichts-viewBox setzen */
        setFrame(W, H, base) {
            this.W = W; this.H = H; this.base = base;
            this.svg.setAttribute('viewBox', base.map((n) => Math.round(n * 100) / 100).join(' '));
            this.svg.style.width = W + 'px';
            this.svg.style.height = H + 'px';
            this.apply(this.view);
        }
        get overview() { const b = this.base; return [b[0] + b[2] / 2, b[1] + b[3] / 2, b[2]]; }
        /** Punkt in viewBox-Einheiten -> Bildschirm-px innerhalb der Bühne */
        toScreen(p, v = this.view) {
            const k0 = this.W / this.base[2], s = this.base[2] / v[2];
            return [
                s * k0 * (p[0] - this.base[0]) + this.W / 2 - s * k0 * (v[0] - this.base[0]),
                s * k0 * (p[1] - this.base[1]) + this.H / 2 - s * k0 * (v[1] - this.base[1]),
            ];
        }
        /** viewBox-Einheiten pro Bildschirm-px bei Ansicht v */
        unitsPerPx(v = this.view) { return v[2] / this.W; }
        apply(v) {
            this.view = v;
            const k0 = this.W / this.base[2], s = this.base[2] / v[2];
            const tx = this.W / 2 - s * k0 * (v[0] - this.base[0]);
            const ty = this.H / 2 - s * k0 * (v[1] - this.base[1]);
            this.svg.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
            this.onFrame(v);
        }
        stop() { if (this.anim) { this.anim.cancel(); this.anim = null; } this.svg.style.willChange = ''; }
        /**
         * Fahrt zur Ansicht `to`.
         * opt.path = 'zoom' (van Wijk, Standard) oder 'lerp'; opt.dur in ms; opt.easing
         */
        flyTo(to, opt = {}) {
            this.stop();
            const from = this.view.slice();
            let at, dur;
            if (opt.path === 'lerp') {
                at = (t) => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] * Math.pow(to[2] / from[2], t)];
                dur = opt.dur != null ? opt.dur : 900;
            } else {
                const zp = zoomPath(from, to);
                at = zp.at;
                dur = opt.dur != null ? opt.dur : Math.max(opt.min || 900, Math.min(opt.max || 1800, zp.dur * 1.15));
            }
            if (dur < 16 || (Math.abs(to[2] - from[2]) < 0.01 && Math.hypot(to[0] - from[0], to[1] - from[1]) < 0.01)) {
                this.apply(to); opt.onDone && opt.onDone(); return;
            }
            this.svg.style.willChange = 'transform';
            this.anim = tween({
                dur, easing: opt.easing || ease.inOutCubic,
                onUpdate: (t, e) => { this.apply(at(e)); opt.onUpdate && opt.onUpdate(t, e); },
                onDone: () => {
                    this.anim = null;
                    this.apply(to);
                    // nach der Fahrt: Ebene auflösen, damit der Browser scharf neu zeichnet
                    requestAnimationFrame(() => { if (!this.anim) this.svg.style.willChange = ''; });
                    opt.onDone && opt.onDone();
                },
            });
        }
    }

    MV.motion = { ease, tween, zoomPath, clamp01 };
    MV.Camera = Camera;
})();
