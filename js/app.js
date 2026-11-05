/* Ablaufsteuerung: Gerät scannen → Explosionsansicht → Schätzfrage → Speichervorgang → Größenvergleich.
 * Grundsatz: Jede Station zeigt EINE Aufgabe und EINEN Hauptknopf. */
(function () {
    const MV = window.MV;
    const U = MV.units;
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const KEY = 'memory-scan-v2';

    const STEPS = ['Scannen', 'Zerlegen', 'Schätzen', 'Speichern', 'Vergleichen'];
    const ART = { der: ['der', 'den', 'ein', 'einen', 'dem'], die: ['die', 'die', 'eine', 'eine', 'der'], das: ['das', 'das', 'ein', 'ein', 'dem'] };
    const aufDen = (d) => (d.article === 'der' ? 'auf den' : d.article === 'das' ? 'auf das' : 'auf die');
    const inDen = (d) => (d.article === 'der' ? 'in einen' : d.article === 'das' ? 'in ein' : 'in eine');
    const einen = (d) => ART[d.article][3];

    const app = {
        state: { loaded: [], devices: {}, seq: 0 },
        flow: { dev: null, step: 0 },
        anim: null,
        xvSeen: new Set(),

        init() {
            this.load();
            this.explorer = new MV.Explorer({
                onLoad: (f) => this.onFileLoaded(f),
                isLoaded: (id) => this.state.loaded.includes(id),
            });
            this.renderAblage();
            this.renderDevices();
            this.renderHud();
            this.go(null, 0, false);
            $('devices').addEventListener('click', (e) => {
                const b = e.target.closest('[data-dev]');
                if (b) this.pickDevice(b.dataset.dev);
            });
            $('stepper').addEventListener('click', (e) => {
                const b = e.target.closest('[data-step]');
                if (b && !b.disabled) this.go(this.flow.dev, Number(b.dataset.step));
            });
            $('reset-btn').addEventListener('click', () => this.confirm('Alles zurücksetzen?', '<p>Alle geladenen Dateien, Geräte und Schätzungen werden gelöscht.</p>', 'Zurücksetzen', 'Abbrechen').then((ok) => {
                if (!ok) return;
                this.state = { loaded: [], devices: {}, seq: 0 };
                this.save();
                location.reload();
            }));
        },

        /* ---------- Speicherung ---------- */
        load() {
            try {
                const s = JSON.parse(localStorage.getItem(KEY) || 'null');
                if (s && Array.isArray(s.loaded) && s.devices) {
                    s.loaded = s.loaded.filter((id) => MV.fileById(id));
                    Object.keys(s.devices).forEach((k) => { if (!MV.deviceById(k) || !(s.devices[k].cap > 0)) delete s.devices[k]; });
                    this.state = { seq: 0, ...s };
                }
            } catch (e) { /* ohne Speicher weiter */ }
        },
        save() { try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) { /* egal */ } },

        /* ---------- Aufgaben-Kasten ---------- */
        say(text) {
            const el = $('task-text');
            if (el.textContent === text) return;
            el.textContent = text;
            const t = $('task');
            t.classList.remove('flash');
            void t.offsetWidth;
            t.classList.add('flash');
        },

        /* ---------- Dialog (mit Fokusfalle) ---------- */
        confirm(title, html, yes, no) {
            return new Promise((resolve) => {
                const m = $('modal');
                $('modal-title').textContent = title;
                $('modal-text').innerHTML = html;
                $('modal-btns').innerHTML = (no ? `<button type="button" class="btn btn-ghost" data-r="0">${no}</button>` : '') + `<button type="button" class="btn btn-primary" data-r="1">${yes}</button>`;
                m.hidden = false;
                const prev = document.activeElement;
                const btns = [...$('modal-btns').querySelectorAll('button')];
                btns[0].focus();
                const close = (r) => {
                    m.hidden = true; m.onclick = null;
                    document.removeEventListener('keydown', key, true);
                    if (prev && prev.focus && document.contains(prev)) prev.focus();
                    resolve(r);
                };
                const key = (e) => {
                    if (e.key === 'Escape') { e.preventDefault(); close(false); }
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const i = btns.indexOf(document.activeElement);
                        btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
                    }
                };
                document.addEventListener('keydown', key, true);
                m.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) close(b.dataset.r === '1'); };
            });
        },

        /* ---------- Dateien ---------- */
        onFileLoaded(f) {
            if (!this.state.loaded.includes(f.id)) this.state.loaded.push(f.id);
            this.state.lastFile = f.id;
            this.save();
            this.renderAblage();
            if (this.flow.step === 3 || !this.flow.dev) this.renderStage();
        },
        renderAblage() {
            const files = this.state.loaded.map(MV.fileById);
            $('ablage').innerHTML = files.length
                ? `<span class="ablage-label">Geladen:</span>` + files.map((f) => `<span class="chip">${MV.fileIcon(f)}${esc(f.name)}</span>`).join('')
                : '';
        },

        /* ---------- Kopfzeile & Geräte ---------- */
        doneCount() { return MV.DEVICES.filter((d) => this.state.devices[d.id] && this.state.devices[d.id].done).length; },
        renderHud() {
            $('pips').innerHTML = MV.DEVICES.map((d) => {
                const s = this.state.devices[d.id];
                return `<span class="pip${s && s.done ? ' done' : ''}"></span>`;
            }).join('');
            $('hud-count').textContent = `${this.doneCount()} von ${MV.DEVICES.length}`;
        },
        icons: {},
        icon(id) {
            if (!this.icons[id]) this.icons[id] = MV.renderExploded(MV.exploded[id], { icon: true });
            return this.icons[id];
        },
        renderDevices() {
            $('devices').innerHTML = MV.DEVICES.map((d) => {
                const s = this.state.devices[d.id];
                const act = this.flow.dev === d.id;
                return `<button type="button" class="dev${act ? ' active' : ''}${s && s.done ? ' done' : ''}" data-dev="${d.id}" aria-pressed="${act}">` +
                    `<span class="dev-ico">${this.icon(d.id)}</span>` +
                    `<span class="dev-name">${d.name}</span>` +
                    `<span class="dev-state">${s && s.done ? '✓ geschafft' : s ? U.size(s.cap) : '&nbsp;'}</span>` +
                    `</button>`;
            }).join('');
        },
        pickDevice(id) {
            const s = this.state.devices[id];
            this.go(id, s ? 2 : 1);
            if (window.innerWidth < 1100) $('stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        /* ---------- Ablauf ---------- */
        go(dev, step, focus = true) {
            if (this.anim) { this.anim.stop && this.anim.stop(); this.anim = null; }
            this.flow = { dev, step };
            if (dev) {
                const s = this.state.devices[dev];
                if (s) { s.reached = Math.max(s.reached || 1, step); this.save(); }
            }
            this.renderDevices();
            this.renderStepper();
            this.renderStage();
            if (focus) {
                const a = document.activeElement;
                const typing = a && (a.tagName === 'INPUT' || a.tagName === 'SELECT') && $('stage').contains(a);
                if (!typing) { const h = $('stage-body').querySelector('h3'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
            }
        },
        renderStepper() {
            const dev = this.flow.dev;
            const s = dev && this.state.devices[dev];
            const reached = s ? s.reached || 1 : 1;
            $('stage-title').textContent = dev ? MV.deviceById(dev).name : 'Labor';
            $('stepper').innerHTML = dev ? STEPS.map((name, i) => {
                const n = i + 1, cur = n === this.flow.step, ok = n <= reached;
                return `<li><button type="button" data-step="${n}" class="${cur ? 'cur' : ok ? 'ok' : ''}" ${ok || n === 1 ? '' : 'disabled'} aria-current="${cur ? 'step' : 'false'}" aria-label="Schritt ${n}: ${name}">` +
                    `<span class="dot">${n}</span><span class="lbl">${name}</span></button></li>`;
            }).join('') : '';
        },
        renderStage() {
            const body = $('stage-body');
            const { dev, step } = this.flow;
            body.className = 'stage-body s' + step;
            // weiches Einblenden bei jedem Schritt
            void body.offsetWidth;
            body.classList.add('enter');
            if (!dev) return this.renderHome(body);
            const d = MV.deviceById(dev);
            [null, this.renderScan, this.renderExplode, this.renderEstimate, this.renderStore, this.renderCompare][step].call(this, body, d);
        },

        /* --- Start --- */
        renderHome(body) {
            const scanned = MV.DEVICES.filter((d) => this.state.devices[d.id]);
            const hasFile = this.state.loaded.length > 0;
            const done = this.doneCount();
            let h, p, arrow;
            if (!hasFile) {
                h = 'Los geht’s: Wie groß ist eine Datei?';
                p = 'Im Datei-Explorer liegen Dateien. Finde heraus, wie groß eine davon ist.';
                arrow = 'left';
                this.say('Mach im Explorer einen Rechtsklick auf „Lied.mp3“ und wähle „Eigenschaften“.');
            } else if (done === MV.DEVICES.length) {
                h = 'Alle Geräte geschafft!';
                p = `Du kennst jetzt alle ${MV.DEVICES.length} Speichermedien – von der Diskette bis zur SSD.`;
                this.say('Super gemacht! Du kannst jedes Gerät noch einmal anklicken.');
            } else {
                h = done ? 'Weiter zum nächsten Gerät' : 'Jetzt kommt ein echtes Gerät';
                p = 'Nimm ein Gerät vom Tisch und klicke es in der Geräte-Liste an.';
                arrow = 'right';
                this.say('Klicke in der Geräte-Liste auf das Gerät, das vor dir liegt.');
            }
            body.innerHTML =
                `<div class="home">` +
                `<h3>${h}</h3><p class="lead">${p}</p>` +
                (arrow ? `<div class="home-arrow ${arrow}" aria-hidden="true"><svg viewBox="0 0 120 40"><path d="M${arrow === 'left' ? '110 20H14M30 6L14 20l16 14' : '10 20h96M90 6l16 14-16 14'}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : '') +
                (scanned.length >= 2 ? `<h4 class="sub-h">Deine Geräte im Vergleich</h4>` + MV.compareViz.ladder(scanned.map((d) => ({ ...d, cap: this.state.devices[d.id].cap })), []) : '') +
                `</div>`;
        },

        /* --- 1 Scannen --- */
        renderScan(body, d) {
            const s = this.state.devices[d.id];
            body.innerHTML =
                `<div class="scan">` +
                `<div class="scan-visual">${this.icon(d.id)}</div>` +
                `<form class="scan-form" id="scan-form" autocomplete="off" novalidate>` +
                `<h3>Wie viel Speicher hat ${ART[d.article][0]} ${d.name}?</h3>` +
                `<p class="hint">${d.hint}</p>` +
                `<div class="row">` +
                `<label class="sr-only" for="cap-val">Kapazität</label>` +
                `<input id="cap-val" type="text" inputmode="decimal" placeholder="Zahl" value="${s ? esc(s.val) : ''}" aria-describedby="scan-msg">` +
                `<label class="sr-only" for="cap-unit">Einheit</label>` +
                `<select id="cap-unit" aria-describedby="scan-msg"><option value="">Einheit</option>${['kb', 'mb', 'gb', 'tb'].map((u) => `<option value="${u}"${s && s.unit === u ? ' selected' : ''}>${u.toUpperCase()}</option>`).join('')}</select>` +
                `</div>` +
                `<p class="msg" id="scan-msg" aria-live="polite"></p>` +
                `<div class="actions"><button class="btn btn-primary" type="submit">Weiter</button></div>` +
                `</form></div>`;
            this.say(`Nimm ${einen(d)} ${d.name} in die Hand. Lies ab, wie viel Speicher drauf passt, und trage es ein.`);
            $('cap-val').focus();
            const err = (t, el) => { const m = $('scan-msg'); m.textContent = t; m.className = 'msg bad'; el.setAttribute('aria-invalid', 'true'); el.focus(); };
            $('scan-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const v = MV.parseNum($('cap-val').value), unit = $('cap-unit').value;
                $('cap-val').setAttribute('aria-invalid', 'false'); $('cap-unit').setAttribute('aria-invalid', 'false');
                if (!isFinite(v) || v <= 0) return err('Gib eine Zahl ein.', $('cap-val'));
                if (!unit) return err('Wähle noch die Einheit: KB, MB, GB oder TB.', $('cap-unit'));
                const cap = U.toBytes(v, unit);
                const ok = cap >= d.range[0] && cap <= d.range[1];
                const p = ok ? Promise.resolve(true) : this.confirm('Bist du sicher?',
                    `<p><b>${esc($('cap-val').value)} ${unit.toUpperCase()}</b> ist ungewöhnlich für ${einen(d)} ${d.name}. Normal sind <b>${d.typical}</b>.</p><p>Stimmt die Einheit?</p>`,
                    'Ja, stimmt', 'Nochmal schauen');
                p.then((yes) => {
                    if (!yes) { $('cap-val').focus(); return; }
                    const prev = this.state.devices[d.id] || {};
                    this.state.devices[d.id] = { ...prev, cap, val: $('cap-val').value.trim(), unit, order: prev.order || ++this.state.seq, reached: Math.max(prev.reached || 1, 2) };
                    this.save();
                    this.renderHud();
                    this.go(d.id, 2);
                });
            });
        },

        /* --- 2 Explosionsansicht: Bauteil-Tour mit Kamerafahrten --- */
        renderExplode(body, d) {
            const xv = MV.renderExploded(MV.exploded[d.id]);
            const parts = xv.parts;
            const dataPart = parts.find((p) => p.data);
            const unlocked = this.xvSeen.has(d.id) || (this.state.devices[d.id].reached || 0) > 2;
            const pins = parts.map((p, i) =>
                `<button type="button" class="xv-pin${p.data ? ' is-data' : ''}" data-part="${p.id}" style="--d:${i * 60}ms" aria-label="Bauteil ${p.num}: ${p.name}"><span>${p.num}</span></button>`).join('');
            body.innerHTML =
                `<div class="xv-wrap">` +
                `<h3 class="sr-only">Explosionsansicht: ${d.name}</h3>` +
                `<div class="xv-stage${unlocked ? '' : ' hint-data'}" id="xv-stage">` +
                `<div class="xv-viewport" id="xv-vp">${xv.svg}<div class="xv-pins" id="xv-pins">${pins}</div></div>` +
                `<div class="xv-card" id="xv-card" role="region" aria-label="Bauteil-Info" hidden></div></div>` +
                `<div class="xv-bar"><button type="button" class="btn btn-ghost" id="xv-toggle">Zusammenbauen</button>` +
                (MV.exploded[d.id].note ? `<span class="xv-scale">${MV.exploded[d.id].note}</span>` : '') + `</div>` +
                `<ol class="xv-list" id="xv-list" aria-label="Bauteile">${parts.map((p) => `<li><button type="button" data-part="${p.id}" class="${p.data ? 'is-data' : ''}"><span class="n">${p.num}</span>${p.name}</button></li>`).join('')}</ol>` +
                `<div class="actions"><button type="button" class="btn btn-primary" id="to-est" ${unlocked ? '' : 'disabled'}>Weiter</button>` +
                `<span class="lock-hint" id="lock-hint">${unlocked ? '' : `Schau dir zuerst Bauteil ${dataPart.num} an.`}</span></div>` +
                `</div>`;
            const stage = $('xv-stage');
            const vp = $('xv-vp');
            const card = $('xv-card');
            const toggle = $('xv-toggle');
            const svgEl = vp.querySelector('svg');
            const { ease, tween, clamp01 } = MV.motion;

            // Bauteile (Zeichenreihenfolge: unten -> oben) und Nummern-Knöpfe
            const groups = [...svgEl.querySelectorAll('.xv-part')].map((g) => ({
                g, dx: +g.dataset.dx || 0, dy: +g.dataset.dy || 0, inner: g.classList.contains('is-inner'), v: 0,
            }));
            const extra = svgEl.querySelector('.xv-extra');
            const pinEls = parts.map((p) => stage.querySelector(`.xv-pin[data-part="${p.id}"]`));

            let wide = true;
            let cur = -1;          // gewähltes Bauteil
            let exploded = false;  // Zielzustand
            let busy = null;       // laufende Explosion
            let pending = -1;      // Auswahl, die nach der Explosion angeflogen wird
            const timers = [];

            const cam = new MV.Camera(svgEl, (v) => {
                for (let i = 0; i < parts.length; i++) {
                    const [x, y] = cam.toScreen(parts[i].anchor, v);
                    pinEls[i].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
                }
            });

            /* ---- Ansichten ---- */
            const A = () => cam.W / cam.H;
            const frameBox = (bx, by, bw, bh, pad) => {
                const w = Math.max(bw * pad, bh * pad * A());
                return [bx + bw / 2, by + bh / 2, Math.min(w, cam.base[2] * 1.4)];
            };
            const asmView = () => { const [x, y, w, h] = xv.asmBox; return frameBox(x, y, w, h, 1.5); };
            const target = (p) => {
                const base = cam.base, a = A();
                // Bauteil + seine Nummer müssen sichtbar sein
                const r = 26 * (base[2] / cam.W);
                const x0 = Math.min(p.box[0], p.anchor[0] - r), y0 = Math.min(p.box[1], p.anchor[1] - r);
                const x1 = Math.max(p.box[0] + p.box[2], p.anchor[0] + r), y1 = Math.max(p.box[1] + p.box[3], p.anchor[1] + r);
                const bx = x0, by = y0, bw = x1 - x0, bh = y1 - y0;
                const cx = bx + bw / 2, cy = by + bh / 2;
                // mit Karte rechts: Bauteil muss in die linken 56 % passen (große Bauteile: etwas herauszoomen)
                const need = wide ? Math.max(bw / 0.52, (bh * a) / 0.8) : Math.max(bw / 0.75, (bh * a) / 0.8);
                const W = Math.min(base[2] * (wide ? 1.4 : 1), Math.max(need, base[2] * 0.55));
                const H = W / a;
                let x = cx - W * (wide ? 0.3 : 0.5);
                let y = cy - H / 2;
                const clamp = (v, lo, hi) => Math.max(Math.min(lo, hi), Math.min(v, Math.max(lo, hi)));
                if (!wide || W <= base[2]) x = clamp(x, base[0] - (wide ? W * 0.2 : 0), base[0] + base[2] - (wide ? W * 0.6 : W));
                y = clamp(y, base[1], base[1] + base[3] - H);
                return [x + W / 2, y + H / 2, W];
            };
            const restView = () => (cur >= 0 ? target(parts[cur]) : exploded ? cam.overview : asmView());

            const fit = () => {
                const w = Math.max(1, vp.clientWidth);
                wide = stage.clientWidth >= 560;
                stage.classList.toggle('wide', wide);
                stage.classList.toggle('small', w < 500);
                const [, , VW, VH] = xv.view;
                const h = Math.round(Math.max(300, Math.min(window.innerHeight * 0.7, (w * VH) / VW)));
                vp.style.height = h + 'px';
                const a = w / h;
                const base = VW / VH > a ? [0, VH / 2 - VW / a / 2, VW, VW / a] : [VW / 2 - (VH * a) / 2, 0, VH * a, VH];
                cam.stop();
                cam.setFrame(w, h, base);
                cam.apply(restView());
            };

            /* ---- Explosion: Teile heben nacheinander ab, die Kamera fährt mit ---- */
            const setPart = (q, v) => {
                q.v = v;
                q.g.setAttribute('transform', v ? `translate(${(q.dx * v).toFixed(2)} ${(q.dy * v).toFixed(2)})` : '');
                // innere Teile erst sichtbar machen, wenn sie aus dem Gehäuse heraus sind
                if (q.inner) q.g.setAttribute('opacity', v >= 1 ? '1' : clamp01((v - 0.18) / 0.32).toFixed(3));
            };
            const STAGGER = 90, DUR = 1150;
            const explode = (on, onDone) => {
                if (busy) busy.cancel();
                exploded = on;
                toggle.textContent = on ? 'Zusammenbauen' : 'Zerlegen';
                stage.classList.add('moving');
                stage.classList.toggle('exploded', on);
                if (!on) { stage.classList.remove('pins-on'); deselect(false); }
                // Zerlegen: oberstes Teil zuerst. Zusammenbauen: unterstes zuerst (oberstes landet zuletzt).
                const n = groups.length;
                const seq = groups.map((q, i) => ({ q, from: q.v, to: on ? 1 : 0, delay: (on ? n - 1 - i : i) * STAGGER }));
                const total = DUR + (n - 1) * STAGGER;
                const ex0 = +extra.getAttribute('opacity') || 0;
                cam.flyTo(on ? cam.overview : asmView(), { path: 'lerp', dur: total, easing: ease.inOutSine });
                busy = tween({
                    dur: total, easing: ease.linear,
                    onUpdate: (t) => {
                        const ms = t * total;
                        seq.forEach((s) => setPart(s.q, s.from + (s.to - s.from) * ease.inOutCubic(clamp01((ms - s.delay) / DUR))));
                        extra.setAttribute('opacity', (ex0 + ((on ? 1 : 0) - ex0) * clamp01((t - 0.65) / 0.35)).toFixed(3));
                    },
                    onDone: () => {
                        busy = null;
                        stage.classList.remove('moving');
                        if (on) stage.classList.add('pins-on');
                        onDone && onDone();
                        if (on && pending >= 0) { const i = pending; pending = -1; select(i); }
                    },
                });
            };
            toggle.addEventListener('click', () => explode(!exploded));

            /* ---- Auswahl mit Kamerafahrt ---- */
            // Nummer und Liste sofort markieren (billig); Glanz und Abdunkeln im SVG erst nach der Fahrt,
            // damit die Zeichnung während der Kamerafahrt nicht in jedem Frame neu gezeichnet werden muss.
            const markSvg = (id) => {
                svgEl.querySelectorAll('.xv-part.sel').forEach((n) => n.classList.remove('sel'));
                if (id) { const g = svgEl.querySelector(`.xv-part[data-part="${id}"]`); if (g) g.classList.add('sel'); }
                stage.classList.toggle('focus', !!id);
            };
            const mark = (id) => {
                pinEls.forEach((b) => b.classList.toggle('sel', b.dataset.part === id));
                $('xv-list').querySelectorAll('button').forEach((b) => b.classList.toggle('sel', b.dataset.part === id));
            };
            const cardHtml = (i) => {
                const p = parts[i];
                const more = [p.info, p.how].filter(Boolean).map((x) => `<p>${x}</p>`).join('');
                const last = i === parts.length - 1;
                return `<div class="xv-card-head"><h4><span class="n${p.data ? ' is-data' : ''}">${p.num}</span>${p.name}</h4>` +
                    `<button type="button" class="xv-close" data-act="close" aria-label="Ganzes Gerät zeigen" title="Ganzes Gerät zeigen">×</button></div>` +
                    `<p class="short">${p.short || p.info}</p>` +
                    (p.data && p.howShort ? `<div class="xv-how"><b>So speichert es Daten:</b> ${p.howShort}</div>` : '') +
                    (more ? `<details class="more"><summary>Mehr erfahren</summary>${more}</details>` : '') +
                    `<div class="xv-nav"><button type="button" class="btn btn-ghost btn-sm" data-act="prev" ${i === 0 ? 'disabled' : ''} aria-label="Vorheriges Bauteil">‹</button>` +
                    `<span class="xv-count">${p.num} von ${parts.length}</span>` +
                    `<button type="button" class="btn btn-ghost btn-sm" data-act="${last ? 'close' : 'next'}">${last ? 'Ganzes Gerät' : 'Nächstes ›'}</button></div>`;
            };
            let swapT = 0;
            const showCard = (i, refocus) => {
                clearTimeout(swapT);
                const fill = () => {
                    card.innerHTML = cardHtml(i);
                    card.scrollTop = 0;
                    card.classList.remove('swap');
                    if (refocus) { const b = card.querySelector(`[data-act="${refocus}"]`) || card.querySelector('[data-act="close"]'); if (b && !b.disabled) b.focus({ preventScroll: true }); }
                };
                if (card.hidden) { card.hidden = false; card.classList.remove('swap'); fill(); }
                else { card.classList.add('swap'); swapT = setTimeout(fill, 180); }
            };
            const deselect = (fly = true) => {
                cur = -1;
                mark(null);
                clearTimeout(swapT);
                card.hidden = true;
                if (fly && exploded) cam.flyTo(cam.overview, { onDone: () => markSvg(null) });
                else markSvg(null);
            };
            const select = (i, opt = {}) => {
                if (i < 0 || i >= parts.length) return;
                if (!exploded || busy) { pending = i; if (!exploded) explode(true); return; }
                const p = parts[i];
                cur = i;
                mark(p.id);
                svgEl.querySelectorAll('.xv-part.sel').forEach((n) => n.classList.remove('sel'));
                showCard(i, opt.refocus);
                cam.flyTo(target(p), { onDone: () => { if (cur === i) markSvg(p.id); } });
                if (opt.focusPin) pinEls[i].focus({ preventScroll: true });
                if (p.data) {
                    this.xvSeen.add(d.id);
                    stage.classList.remove('hint-data');
                    $('to-est').disabled = false;
                    $('lock-hint').textContent = '';
                    this.say('Genau, hier liegen die Daten! Schau dir ruhig noch die anderen Bauteile an – dann „Weiter“.');
                }
                if (!wide) timers.push(setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 250));
            };
            const idx = (id) => parts.findIndex((p) => p.id === id);

            stage.addEventListener('click', (e) => {
                const a = e.target.closest('[data-act]');
                if (a) {
                    const act = a.dataset.act;
                    if (act === 'close') {
                        const back = cur >= 0 ? pinEls[cur] : null;
                        deselect();
                        if (back) back.focus({ preventScroll: true });
                    } else select(cur + (act === 'next' ? 1 : -1), { refocus: act });
                    return;
                }
                if (card.contains(e.target)) return;
                const n = e.target.closest('[data-part]');
                if (n && n.dataset.part && (exploded || n.classList.contains('xv-pin'))) select(idx(n.dataset.part));
            });
            stage.addEventListener('keydown', (e) => {
                if (e.target.closest('summary, input')) return;
                const onPin = !!e.target.closest('.xv-pin');
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    select(cur < 0 ? 0 : cur + (e.key === 'ArrowRight' ? 1 : -1), { focusPin: onPin });
                } else if (e.key === 'Escape' && cur >= 0) {
                    e.preventDefault();
                    const back = pinEls[cur];
                    deselect();
                    back.focus({ preventScroll: true });
                }
            });
            $('xv-list').addEventListener('click', (e) => {
                const b = e.target.closest('[data-part]');
                if (b) select(idx(b.dataset.part));
            });
            $('to-est').addEventListener('click', () => this.go(d.id, 3));

            /* ---- Start: zusammengebaut groß im Bild, dann sanft zerlegen ---- */
            groups.forEach((q) => setPart(q, 0));
            fit();
            cam.apply(asmView());
            window.addEventListener('resize', fit);
            requestAnimationFrame(() => requestAnimationFrame(() => timers.push(setTimeout(() => { if (!exploded) explode(true); }, 450))));
            this.anim = {
                stop: () => {
                    timers.forEach(clearTimeout); clearTimeout(swapT);
                    if (busy) busy.cancel();
                    cam.stop();
                    window.removeEventListener('resize', fit);
                },
            };
            this.say(unlocked ? 'Klicke auf die Nummern und schau dir die Bauteile an. Dann „Weiter“.' :
                `So sieht ${ART[d.article][0]} ${d.name} innen aus. Klicke auf die Nummern – fang bei 1 an. Das pinke Bauteil speichert deine Daten.`);
        },

        /* --- 3 Schätzfrage --- */
        renderEstimate(body, d) {
            const s = this.state.devices[d.id];
            const loaded = this.state.loaded;
            if (!loaded.length) {
                const sug = MV.fileById(d.file);
                body.innerHTML = `<div class="est"><h3>Zuerst brauchst du eine Datei</h3>` +
                    `<p class="lead">Lade im Datei-Explorer eine Datei. Danach geht es hier von selbst weiter.</p>` +
                    `<p class="hint">Gut passt: <b>${sug.name}</b> im Ordner ${MV.FOLDERS.find((f) => f.id === sug.folder).name}.</p></div>`;
                $('explorer').classList.add('pulse');
                setTimeout(() => $('explorer').classList.remove('pulse'), 2400);
                this.say(`Rechtsklick auf „${sug.name}“ → Eigenschaften → Größe unten eintragen.`);
                return;
            }
            let fid = s.guessFile && loaded.includes(s.guessFile) ? s.guessFile : loaded.includes(d.file) ? d.file : this.state.lastFile && loaded.includes(this.state.lastFile) ? this.state.lastFile : loaded[0];
            const draw = () => {
                const f = MV.fileById(fid);
                body.innerHTML =
                    `<div class="est">` +
                    `<h3 class="est-q">Wie viele <span class="hl-c">${f.name}</span> passen ${aufDen(d)} <span class="hl-p">${d.name}</span>?</h3>` +
                    `<div class="est-vs"><div class="est-obj"><span class="est-file">${MV.fileIcon(f)}</span><b>${f.name}</b><span>${U.winSize(f.bytes)}</span></div>` +
                    `<div class="est-x" aria-hidden="true">×&nbsp;?</div>` +
                    `<div class="est-obj"><span class="est-dev">${this.icon(d.id)}</span><b>${d.name}</b><span>${U.size(s.cap)}</span></div></div>` +
                    `<form class="est-form" id="est-form" autocomplete="off" novalidate>` +
                    `<label for="est-val">Deine Schätzung:</label>` +
                    `<input id="est-val" type="text" inputmode="numeric" placeholder="Zahl" aria-describedby="est-msg">` +
                    `<button class="btn btn-primary" type="submit">Weiter</button>` +
                    `</form><p class="msg" id="est-msg" aria-live="polite"></p>` +
                    (loaded.length > 1 ? `<details class="more more-files"><summary>Andere Datei nehmen</summary><div class="chips">${loaded.map((id) => { const x = MV.fileById(id); return `<button type="button" class="chip${id === fid ? ' on' : ''}" data-f="${id}" aria-pressed="${id === fid}">${MV.fileIcon(x)}${x.name}</button>`; }).join('')}</div></details>` : '') +
                    `</div>`;
                const mf = body.querySelector('.more-files');
                if (mf) mf.addEventListener('click', (e) => {
                    const b = e.target.closest('[data-f]');
                    if (b) { fid = b.dataset.f; draw(); }
                });
                $('est-val').focus();
                $('est-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const g = MV.parseNum($('est-val').value);
                    if (!isFinite(g) || g < 0) { $('est-msg').textContent = 'Gib eine Zahl ein.'; $('est-msg').className = 'msg bad'; $('est-val').setAttribute('aria-invalid', 'true'); return; }
                    s.guess = Math.round(g);
                    s.guessFile = fid;
                    s.reached = Math.max(s.reached || 1, 4);
                    this.save();
                    this.go(d.id, 4);
                });
            };
            draw();
            this.say('Schätze ohne Taschenrechner! Tipp: 1 GB = 1024 MB und 1 MB = 1024 KB.');
        },

        /* --- 4 Speichervorgang --- */
        renderStore(body, d) {
            const s = this.state.devices[d.id];
            if (s.guess == null || !s.guessFile) return this.go(d.id, 3);
            const f = MV.fileById(s.guessFile);
            const burn = d.verb === 'brennt';
            body.innerHTML = `<div class="store">` +
                `<h3>${burn ? `${ART[d.article][0][0].toUpperCase() + ART[d.article][0].slice(1)} ${d.name} wird gebrannt …` : `${ART[d.article][0][0].toUpperCase() + ART[d.article][0].slice(1)} ${d.name} wird beschrieben …`}</h3>` +
                `<div id="fv-host"></div>` +
                `<div id="fv-result" aria-live="polite"></div>` +
                `<div class="actions" id="fv-actions"><button type="button" class="link-btn" id="fv-skip">Schneller</button></div></div>`;
            this.say(`Schau zu: So viele ${f.name} wie möglich kommen ${aufDen(d)} ${d.name}.`);
            const anim = MV.fillViz.run($('fv-host'), {
                device: d, file: f, capacity: s.cap,
                onDone: (N) => {
                    s.n = N; s.nFile = f.id; s.reached = Math.max(s.reached || 1, 5);
                    this.save();
                    this.renderStepper();
                    $('fv-actions').innerHTML = `<button type="button" class="btn btn-primary" id="to-cmp">Weiter</button>`;
                    $('fv-result').innerHTML = this.resultCard(d, s, f, N);
                    $('to-cmp').addEventListener('click', () => this.go(d.id, 5));
                    this.say(N ? `Es passen ${U.num(N)} × ${f.name} drauf. Wie gut war deine Schätzung?` : `Die Datei ist zu groß für ${einen(d)} ${d.name}!`);
                },
            });
            this.anim = { stop: () => anim.cancel() };
            $('fv-skip').addEventListener('click', () => anim.skip());
        },
        resultCard(d, s, f, N) {
            const g = s.guess;
            let verdict, cls;
            if (N === 0) {
                verdict = `Passt nicht! Die Datei ist ${U.times(f.bytes / s.cap)}-mal so groß wie ${ART[d.article][0]} ganze ${d.name}.`;
                cls = 'bad';
            } else if (g === 0) { verdict = 'Du hast 0 geschätzt – es passt aber einiges drauf!'; cls = 'bad'; }
            else {
                const r = N / g;
                if (r >= 0.9 && r <= 1.1) { verdict = 'Volltreffer! Super geschätzt.'; cls = 'ok'; }
                else if (r > 1) { verdict = `Du hast ${U.times(r)}-mal zu wenig geschätzt.`; cls = r < 2 ? 'mid' : 'bad'; }
                else { verdict = `Du hast ${U.times(1 / r)}-mal zu viel geschätzt.`; cls = r > 0.5 ? 'mid' : 'bad'; }
            }
            return `<div class="result ${cls}">` +
                `<div class="res-col"><span class="res-l">Geschätzt</span><span class="res-v">${U.num(g)}</span></div>` +
                `<div class="res-col"><span class="res-l">Richtig</span><span class="res-v big">${U.num(N)}</span></div>` +
                `<div class="res-text"><p class="res-verdict">${verdict}</p>` +
                `<details class="more"><summary>So rechnet man</summary><p>${U.size(s.cap)} ÷ ${U.winSize(f.bytes)} = ${U.num(s.cap / f.bytes, 1)}. Nur ganze Dateien zählen: ${U.num(N)}.</p></details></div>` +
                `</div>`;
        },

        /* --- 5 Vergleich: große Zahl, Flächen-Zoom, ein Satz --- */
        renderCompare(body, d) {
            const me = { ...d, cap: this.state.devices[d.id].cap };
            const others = MV.DEVICES.filter((x) => x.id !== d.id && this.state.devices[x.id])
                .map((x) => ({ ...x, cap: this.state.devices[x.id].cap, order: this.state.devices[x.id].order || 0 }))
                .sort((a, b) => b.order - a.order);
            let other = (this._cmpWith && others.find((o) => o.id === this._cmpWith)) || others[0];

            const draw = () => {
                let head, legend, small, big, sentence = '';
                if (other) {
                    [small, big] = me.cap <= other.cap ? [me, other] : [other, me];
                    const k = big.cap / small.cap;
                    head = `<h3>Wie viele <span class="hl-p">${small.plural}</span> passen ${inDen(big)} <span class="hl-c">${big.name}</span>?</h3>` +
                        `<p class="cmp-answer"><span class="cmp-k">${U.ratio(k)}</span> ${k >= 1.995 || k < 1 ? small.plural : small.name}</p>`;
                    legend = `1 Kästchen = 1 ${small.name}. Die ganze Fläche = 1 ${big.name}.`;
                    sentence = MV.compareViz.stack(small, big).text;
                } else {
                    const f = MV.fileById(this.state.devices[d.id].nFile || this.state.loaded[0] || d.file);
                    if (f.bytes <= me.cap) {
                        small = { name: f.name, cap: f.bytes }; big = me;
                        head = `<h3>So viele <span class="hl-p">${f.name}</span> passen ${aufDen(d)} <span class="hl-c">${d.name}</span></h3>` +
                            `<p class="cmp-answer"><span class="cmp-k">${U.num(Math.floor(me.cap / f.bytes))}</span> Dateien</p>`;
                        legend = `1 Kästchen = 1 × ${f.name}. Die ganze Fläche = ${d.name}.`;
                    } else {
                        small = me; big = { name: f.name, cap: f.bytes };
                        head = `<h3>Wie viele <span class="hl-p">${d.plural}</span> bräuchtest du für <span class="hl-c">${f.name}</span>?</h3>` +
                            `<p class="cmp-answer"><span class="cmp-k">${U.num(Math.ceil(f.bytes / me.cap))}</span> ${d.plural}</p>`;
                        legend = `1 Kästchen = 1 ${d.name}. Die ganze Fläche = ${f.name}.`;
                    }
                    sentence = 'Wenn du ein zweites Gerät untersuchst, vergleichst du hier zwei Geräte miteinander.';
                }
                body.innerHTML =
                    `<div class="cmp">` + head +
                    `<div class="cmp-tiles"><canvas id="cmp-canvas" role="img" aria-label="${legend}"></canvas><p class="cmp-legend"><i class="sq pink" aria-hidden="true"></i>${legend}</p></div>` +
                    `<p class="cmp-sentence">${sentence}</p>` +
                    (others.length > 1 ? `<details class="more"><summary>Mit einem anderen Gerät vergleichen</summary><div class="chips">${others.map((o) => `<button type="button" class="chip${o.id === other.id ? ' on' : ''}" data-o="${o.id}" aria-pressed="${o.id === other.id}">${o.name}</button>`).join('')}</div></details>` : '') +
                    `<div class="actions"><button type="button" class="btn btn-primary" id="cmp-done">${this.state.devices[d.id].done ? 'Fertig' : 'Gerät geschafft ✓'}</button>` +
                    `<button type="button" class="link-btn" id="cmp-replay">Zoom noch einmal</button></div>` +
                    `</div>`;
                const run = () => { if (this.anim) this.anim.stop(); this.anim = MV.compareViz.tiles($('cmp-canvas'), small, big); };
                requestAnimationFrame(run);
                $('cmp-replay').addEventListener('click', run);
                const o = body.querySelector('.more .chips');
                if (o) o.addEventListener('click', (e) => {
                    const b = e.target.closest('[data-o]');
                    if (b) { this._cmpWith = b.dataset.o; other = others.find((x) => x.id === b.dataset.o); draw(); body.querySelector('.more').open = true; }
                });
                $('cmp-done').addEventListener('click', () => this.finishDevice(d));
            };
            draw();
            this.say(other ? 'Schau dir den Zoom an: Ein pinkes Kästchen ist das kleinere Gerät.' : 'Schau dir an, wie viele Dateien insgesamt drauf passen.');
        },

        finishDevice(d) {
            const s = this.state.devices[d.id];
            const first = !s.done;
            s.done = true;
            this.save();
            this.renderHud();
            this.go(null, 0);
            if (first && this.doneCount() === MV.DEVICES.length) {
                document.body.classList.add('all-done');
                this.confirm('Alle Geräte geschafft!', `<p>Du hast alle ${MV.DEVICES.length} Speichermedien untersucht – von der Diskette bis zur SSD.</p>` +
                    MV.compareViz.ladder(MV.DEVICES.map((x) => ({ ...x, cap: this.state.devices[x.id].cap })), []), 'Super!');
            }
        },
    };

    MV.app = app;
    document.addEventListener('DOMContentLoaded', () => app.init());
})();
