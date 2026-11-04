/* Ablaufsteuerung: Gerät scannen → Explosionsansicht → Schätzfrage → Speichervorgang → Größenvergleich */
(function () {
    const MV = window.MV;
    const U = MV.units;
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const KEY = 'memory-scan-v2';

    const STEPS = [
        { n: 1, name: 'Scannen' },
        { n: 2, name: 'Zerlegen' },
        { n: 3, name: 'Schätzen' },
        { n: 4, name: 'Speichern' },
        { n: 5, name: 'Vergleichen' },
    ];
    const ART = { der: ['der', 'den', 'ein', 'einen'], die: ['die', 'die', 'eine', 'eine'], das: ['das', 'das', 'ein', 'ein'] };
    const aufDen = (d) => (d.article === 'der' ? 'auf den' : d.article === 'das' ? 'auf das' : 'auf die');
    const inDen = (d) => (d.article === 'der' ? 'in einen' : d.article === 'das' ? 'in ein' : 'in eine');

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
            this.go(null, 0);
            $('devices').addEventListener('click', (e) => {
                const b = e.target.closest('[data-dev]');
                if (b) this.pickDevice(b.dataset.dev);
            });
            $('stepper').addEventListener('click', (e) => {
                const b = e.target.closest('[data-step]');
                if (b && !b.disabled) this.go(this.flow.dev, Number(b.dataset.step));
            });
            $('reset-btn').addEventListener('click', () => this.confirm('Alles zurücksetzen?', 'Alle geladenen Dateien, gescannten Geräte und Schätzungen werden gelöscht.', 'Zurücksetzen', 'Abbrechen').then((ok) => {
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

        /* ---------- Assistent ---------- */
        say(text) {
            const el = $('sys-text');
            clearInterval(this._typer);
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
            let i = 0;
            el.textContent = '';
            this._typer = setInterval(() => {
                i += 2;
                el.textContent = text.slice(0, i);
                if (i >= text.length) clearInterval(this._typer);
            }, 16);
        },

        /* ---------- Modal ---------- */
        confirm(title, html, yes, no) {
            return new Promise((resolve) => {
                const m = $('modal');
                $('modal-title').textContent = title;
                $('modal-text').innerHTML = html;
                $('modal-btns').innerHTML = (no ? `<button class="btn btn-ghost" data-r="0">${no}</button>` : '') + `<button class="btn btn-primary" data-r="1">${yes}</button>`;
                m.hidden = false;
                const prev = document.activeElement;
                $('modal-btns').querySelector(no ? '[data-r="0"]' : '[data-r="1"]').focus();
                const close = (r) => { m.hidden = true; m.onclick = null; document.removeEventListener('keydown', key); prev && prev.focus && prev.focus(); resolve(r); };
                const key = (e) => { if (e.key === 'Escape') close(false); };
                document.addEventListener('keydown', key);
                m.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) close(b.dataset.r === '1'); };
            });
        },

        /* ---------- Dateien ---------- */
        onFileLoaded(f) {
            if (!this.state.loaded.includes(f.id)) this.state.loaded.push(f.id);
            this.state.lastFile = f.id;
            this.save();
            this.renderAblage();
            if (this.flow.step === 3) this.renderStage();
            else if (!this.flow.dev) {
                this.renderStage();
                this.say(`${f.name} ist geladen. Nimm jetzt ein Gerät vom Tisch und wähle es im Geräte-Hangar aus.`);
            } else this.say(`${f.name} ist geladen.`);
        },
        renderAblage() {
            const files = this.state.loaded.map(MV.fileById);
            $('ablage').innerHTML = files.length
                ? `<span class="ablage-label">GELADEN</span>` + files.map((f) => `<span class="chip t-${f.type}">${MV.fileIcon(f)}${esc(f.name)}<small>${U.winSize(f.bytes)}</small></span>`).join('')
                : `<span class="ablage-label">GELADEN</span><span class="ablage-empty">noch nichts – wähle im Explorer eine Datei</span>`;
        },

        /* ---------- HUD & Hangar ---------- */
        doneCount() { return MV.DEVICES.filter((d) => this.state.devices[d.id] && this.state.devices[d.id].done).length; },
        renderHud() {
            $('pips').innerHTML = MV.DEVICES.map((d) => {
                const s = this.state.devices[d.id];
                return `<span class="pip${s && s.done ? ' done' : s ? ' half' : ''}" title="${d.name}"></span>`;
            }).join('');
            $('hud-count').textContent = `${this.doneCount()}/${MV.DEVICES.length}`;
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
                return `<button type="button" class="dev${act ? ' active' : ''}${s && s.done ? ' done' : ''}" data-dev="${d.id}">` +
                    `<span class="dev-ico">${this.icon(d.id)}</span>` +
                    `<span class="dev-name">${d.name}</span>` +
                    `<span class="dev-state">${s ? (s.done ? '✓ ' : '') + U.size(s.cap) : 'nicht gescannt'}</span>` +
                    `</button>`;
            }).join('');
        },
        pickDevice(id) {
            const s = this.state.devices[id];
            this.go(id, s ? 2 : 1);
            if (window.innerWidth < 1100) $('stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        /* ---------- Ablauf ---------- */
        go(dev, step) {
            if (this.anim) { this.anim.stop && this.anim.stop(); this.anim.skip && this.anim.skip(); this.anim = null; }
            this.flow = { dev, step };
            if (dev) {
                const s = this.state.devices[dev];
                if (s) { s.reached = Math.max(s.reached || 1, step); this.save(); }
            }
            this.renderDevices();
            this.renderStepper();
            this.renderStage();
        },
        renderStepper() {
            const dev = this.flow.dev;
            const s = dev && this.state.devices[dev];
            const reached = s ? s.reached || 1 : 1;
            $('stepper').innerHTML = dev ? STEPS.map((st) =>
                `<li><button type="button" data-step="${st.n}" class="${st.n === this.flow.step ? 'cur' : st.n < this.flow.step || st.n <= reached ? 'ok' : ''}" ${st.n <= reached || st.n === 1 ? '' : 'disabled'} aria-current="${st.n === this.flow.step ? 'step' : 'false'}"><span>${st.n}</span>${st.name}</button></li>`).join('') : '';
            $('stage-name').textContent = dev ? MV.deviceById(dev).name : 'Labor';
        },
        renderStage() {
            const body = $('stage-body');
            const { dev, step } = this.flow;
            body.className = 'stage-body s' + step;
            if (!dev) return this.renderHome(body);
            const d = MV.deviceById(dev);
            [null, this.renderScan, this.renderExplode, this.renderEstimate, this.renderStore, this.renderCompare][step].call(this, body, d);
        },

        /* --- Start --- */
        renderHome(body) {
            const scanned = MV.DEVICES.filter((d) => this.state.devices[d.id]);
            const hasFile = this.state.loaded.length > 0;
            body.innerHTML =
                `<div class="home">` +
                `<div class="home-hero"><p class="kicker">MISSION</p><h3>Wie groß sind Daten – und wie groß ist ihr Speicher?</h3>` +
                `<p>Untersuche nacheinander die echten Geräte auf dem Tisch. Für jedes Gerät gibt es fünf Stationen.</p></div>` +
                `<ol class="home-steps">` +
                `<li class="${hasFile ? 'ok' : 'now'}"><b>Datei laden</b><span>Wähle im Datei-Explorer eine Datei, öffne mit Rechtsklick die <i>Eigenschaften</i> und trage die Größe ein.</span></li>` +
                `<li class="${hasFile ? 'now' : ''}"><b>Gerät wählen</b><span>Hol dir ein Gerät vom Tisch und klicke es rechts im Geräte-Hangar an. Lies die Kapazität ab.</span></li>` +
                `<li><b>Zerlegen &amp; verstehen</b><span>In der Explosionsansicht siehst du, woraus das Gerät besteht und wo die Daten liegen.</span></li>` +
                `<li><b>Schätzen, speichern, vergleichen</b><span>Wie viele Dateien passen drauf? Und wie viele Disketten passen in eine Festplatte?</span></li>` +
                `</ol>` +
                (scanned.length ? `<h4 class="home-sub">Bisher gescannt</h4>` + MV.compareViz.ladder(scanned.map((d) => ({ ...d, cap: this.state.devices[d.id].cap })), []) : '') +
                `</div>`;
            this.say(hasFile ? 'Wähle im Geräte-Hangar das Gerät, das vor dir auf dem Tisch liegt.' : 'Willkommen im Speicher-Labor! Starte im Datei-Explorer: Rechtsklick auf eine Datei → Eigenschaften → Größe ablesen.');
        },

        /* --- 1 Scannen --- */
        renderScan(body, d) {
            const s = this.state.devices[d.id];
            body.innerHTML =
                `<div class="scan">` +
                `<div class="scan-visual"><div class="scan-ico">${this.icon(d.id)}</div><div class="scan-beam" aria-hidden="true"></div></div>` +
                `<form class="scan-form" id="scan-form" autocomplete="off">` +
                `<p class="kicker">GERÄT SCANNEN</p>` +
                `<h3>Wie viel passt auf ${ART[d.article][1]} ${d.name}?</h3>` +
                `<p class="scan-hint">${d.hint}</p>` +
                `<div class="scan-row">` +
                `<label class="sr-only" for="cap-val">Kapazität</label>` +
                `<input id="cap-val" type="text" inputmode="decimal" placeholder="Zahl" value="${s ? esc(s.val) : ''}">` +
                `<label class="sr-only" for="cap-unit">Einheit</label>` +
                `<select id="cap-unit"><option value="">Einheit</option>${['kb', 'mb', 'gb', 'tb'].map((u) => `<option value="${u}"${s && s.unit === u ? ' selected' : ''}>${u.toUpperCase()}</option>`).join('')}</select>` +
                `<button class="btn btn-primary" type="submit">Kapazität erfassen</button>` +
                `</div>` +
                `<p class="scan-msg" id="scan-msg" aria-live="polite"></p>` +
                `</form></div>`;
            this.say(`Nimm ${ART[d.article][3]} ${d.name} in die Hand und lies die Speicherkapazität ab.`);
            $('cap-val').focus();
            $('scan-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const v = MV.parseNum($('cap-val').value), unit = $('cap-unit').value;
                const msg = $('scan-msg');
                if (!isFinite(v) || v <= 0) { msg.textContent = 'Bitte gib eine Zahl ein.'; msg.className = 'scan-msg bad'; return; }
                if (!unit) { msg.textContent = 'Wähle noch die Einheit (KB, MB, GB oder TB).'; msg.className = 'scan-msg bad'; $('cap-unit').focus(); return; }
                const cap = U.toBytes(v, unit);
                const ok = cap >= d.range[0] && cap <= d.range[1];
                const p = ok ? Promise.resolve(true) : this.confirm('Bist du sicher?',
                    `<p><b>${esc($('cap-val').value)} ${unit.toUpperCase()}</b> ist ungewöhnlich für ${ART[d.article][3]} ${d.name}.</p><p>Typisch sind <b>${d.typical}</b>. Schau noch einmal genau hin – stimmt die Einheit?</p>`,
                    'Ja, stimmt so', 'Nochmal nachsehen');
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

        /* --- 2 Explosionsansicht --- */
        renderExplode(body, d) {
            const xv = MV.renderExploded(MV.exploded[d.id]);
            const dataPart = xv.parts.find((p) => p.data);
            const seenKey = d.id;
            body.innerHTML =
                `<div class="xv-wrap">` +
                `<div class="xv-toolbar"><button type="button" class="btn btn-small" id="xv-toggle" aria-pressed="false">Zerlegen</button>` +
                `<span class="xv-legend"><i class="lg-data"></i>speichert die Daten</span>` +
                `<span class="xv-hint">Klicke auf ein Bauteil</span></div>` +
                `<div class="xv-main">` +
                `<div class="xv-stage" id="xv-stage">${xv.svg}</div>` +
                `<aside class="xv-side">` +
                `<ol class="xv-list" id="xv-list">${xv.parts.map((p) => `<li><button type="button" data-part="${p.id}" class="${p.data ? 'is-data' : ''}"><span class="n">${p.num}</span>${p.name}</button></li>`).join('')}</ol>` +
                `<div class="xv-info" id="xv-info" aria-live="polite"><p class="xv-info-empty">Wähle ein Bauteil aus – das <b class="pink">pink</b> markierte speichert deine Daten.</p></div>` +
                `</aside></div>` +
                (MV.exploded[d.id].note ? `<p class="xv-scale">⚠ ${MV.exploded[d.id].note}</p>` : `<p class="xv-scale">Vereinfachte, technisch korrekte Darstellung – Bauteile auseinandergezogen.</p>`) +
                `<div class="step-actions"><button type="button" class="btn btn-primary" id="to-est" ${this.xvSeen.has(seenKey) || (this.state.devices[d.id].reached || 0) > 2 ? '' : 'disabled'}>Weiter zur Schätzfrage →</button>` +
                `<span class="lock-hint" id="lock-hint">${this.xvSeen.has(seenKey) || (this.state.devices[d.id].reached || 0) > 2 ? '' : `🔒 Klicke zuerst auf das pink markierte Bauteil (${dataPart.num}) und lies, wie es Daten speichert.`}</span></div>` +
                `</div>`;
            const stage = $('xv-stage');
            const toggle = $('xv-toggle');
            const setExploded = (on) => {
                stage.classList.toggle('exploded', on);
                toggle.textContent = on ? 'Zusammenbauen' : 'Zerlegen';
                toggle.setAttribute('aria-pressed', String(on));
            };
            toggle.addEventListener('click', () => setExploded(!stage.classList.contains('exploded')));
            const t = setTimeout(() => setExploded(true), 700);
            const svgEl = stage.querySelector('svg');
            const fit = () => {
                const narrow = stage.clientWidth < 560;
                svgEl.setAttribute('viewBox', narrow ? xv.vbNarrow : xv.vbWide);
                stage.classList.toggle('narrow', narrow);
            };
            fit();
            window.addEventListener('resize', fit);
            this.anim = { stop: () => { clearTimeout(t); window.removeEventListener('resize', fit); } };

            const select = (id) => {
                const p = xv.parts.find((x) => x.id === id);
                if (!p) return;
                if (!stage.classList.contains('exploded')) setExploded(true);
                stage.querySelectorAll('.sel').forEach((n) => n.classList.remove('sel'));
                stage.querySelectorAll(`[data-part="${id}"]`).forEach((n) => n.classList.add('sel'));
                stage.classList.add('has-sel');
                $('xv-list').querySelectorAll('button').forEach((b) => b.classList.toggle('sel', b.dataset.part === id));
                $('xv-info').innerHTML =
                    `<p class="xv-info-num${p.data ? ' pink' : ''}">${p.num} · ${p.data ? 'DATENSPEICHER' : 'BAUTEIL'}</p>` +
                    `<h4>${p.name}</h4>` +
                    `<p>${p.info}</p>` +
                    (p.how ? `<div class="xv-how${p.data ? ' is-data' : ''}"><p class="xv-how-h">${p.data ? 'So speichert es Daten' : 'Gut zu wissen'}</p><p>${p.how}</p></div>` : '');
                if (p.data) {
                    this.xvSeen.add(seenKey);
                    $('to-est').disabled = false;
                    $('lock-hint').textContent = '';
                    this.say(`Genau! Hier liegen die Daten. Weiter geht's mit der Schätzfrage.`);
                }
                if (window.innerWidth < 900) $('xv-info').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            };
            stage.addEventListener('click', (e) => {
                const n = e.target.closest('[data-part]');
                if (n && n.dataset.part) select(n.dataset.part);
            });
            stage.addEventListener('keydown', (e) => {
                const n = e.target.closest('[data-part]');
                if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(n.dataset.part); }
            });
            $('xv-list').addEventListener('click', (e) => {
                const b = e.target.closest('[data-part]');
                if (b) select(b.dataset.part);
            });
            $('to-est').addEventListener('click', () => this.go(d.id, 3));
            this.say(`So sieht ${ART[d.article][0]} ${d.name} von innen aus. Klicke die Bauteile an – das pink leuchtende speichert deine Daten.`);
        },

        /* --- 3 Schätzfrage --- */
        renderEstimate(body, d) {
            const s = this.state.devices[d.id];
            const loaded = this.state.loaded;
            if (!loaded.length) {
                body.innerHTML = `<div class="est est-empty"><p class="kicker">SCHÄTZFRAGE</p><h3>Erst brauchst du eine Datei!</h3>` +
                    `<p>Wähle im Datei-Explorer eine Datei, öffne mit Rechtsklick die <b>Eigenschaften</b> und lade sie mit der richtigen Größe. Danach geht es hier automatisch weiter.</p>` +
                    `<p class="est-tip">Passend für ${ART[d.article][3]} ${d.name}: <b>${MV.fileById(d.file).name}</b> (Ordner ${MV.FOLDERS.find((f) => f.id === MV.fileById(d.file).folder).name})</p></div>`;
                $('explorer').classList.add('pulse');
                setTimeout(() => $('explorer').classList.remove('pulse'), 2400);
                this.say('Ohne Datei keine Schätzung: Lade im Datei-Explorer zuerst eine Datei.');
                return;
            }
            let fid = s.guessFile && loaded.includes(s.guessFile) ? s.guessFile : loaded.includes(d.file) ? d.file : this.state.lastFile && loaded.includes(this.state.lastFile) ? this.state.lastFile : loaded[0];
            const draw = () => {
                const f = MV.fileById(fid);
                body.innerHTML =
                    `<div class="est">` +
                    `<p class="kicker">SCHÄTZFRAGE</p>` +
                    `<h3 class="est-q">Wie viele <span class="hl-c">${f.name}</span> <small>(${U.winSize(f.bytes)})</small> passen ${aufDen(d)} <span class="hl-p">${d.name}</span> <small>(${U.size(s.cap)})</small>?</h3>` +
                    `<div class="est-vs"><div class="est-obj"><span class="est-file t-${f.type}">${MV.fileIcon(f)}</span><b>${f.name}</b><small>${U.winSize(f.bytes)}</small></div>` +
                    `<div class="est-x">× ?</div>` +
                    `<div class="est-obj"><span class="est-dev">${this.icon(d.id)}</span><b>${d.name}</b><small>${U.size(s.cap)}</small></div></div>` +
                    `<div class="est-files"><span>Datei:</span>${loaded.map((id) => { const x = MV.fileById(id); return `<button type="button" class="chip t-${x.type}${id === fid ? ' on' : ''}" data-f="${id}">${MV.fileIcon(x)}${x.name}</button>`; }).join('')}</div>` +
                    `<form class="est-form" id="est-form" autocomplete="off">` +
                    `<label for="est-val">Deine Schätzung:</label>` +
                    `<input id="est-val" type="text" inputmode="numeric" placeholder="z. B. 50">` +
                    `<button class="btn btn-primary" type="submit">Schätzung abgeben</button>` +
                    `</form><p class="scan-msg" id="est-msg" aria-live="polite"></p>` +
                    `<p class="est-tip">Ohne Taschenrechner! Tipp: 1 GB = 1024 MB, 1 MB = 1024 KB.</p>` +
                    `</div>`;
                body.querySelector('.est-files').addEventListener('click', (e) => {
                    const b = e.target.closest('[data-f]');
                    if (b) { fid = b.dataset.f; draw(); }
                });
                $('est-val').focus();
                $('est-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const g = MV.parseNum($('est-val').value);
                    if (!isFinite(g) || g < 0) { $('est-msg').textContent = 'Bitte gib eine Zahl ein.'; $('est-msg').className = 'scan-msg bad'; return; }
                    s.guess = Math.round(g);
                    s.guessFile = fid;
                    s.reached = Math.max(s.reached || 1, 4);
                    this.save();
                    this.go(d.id, 4);
                });
            };
            draw();
            this.say('Schätze zuerst – ganz ohne Taschenrechner. Danach wird gespeichert und du siehst, ob du richtig lagst.');
        },

        /* --- 4 Speichervorgang --- */
        renderStore(body, d) {
            const s = this.state.devices[d.id];
            if (s.guess == null || !s.guessFile) return this.go(d.id, 3);
            const f = MV.fileById(s.guessFile);
            body.innerHTML = `<div class="store"><p class="kicker">${d.verb === 'brennt' ? 'BRENNVORGANG' : 'SPEICHERVORGANG'}</p>` +
                `<h3>${d.verb === 'brennt' ? 'Der Brenner brennt' : 'Der Computer speichert'} so viele ${f.name} wie möglich ${aufDen(d)} ${d.name}</h3>` +
                `<div id="fv-host"></div>` +
                `<div class="step-actions"><button type="button" class="btn btn-ghost btn-small" id="fv-skip">Schneller ⏩</button></div>` +
                `<div id="fv-result"></div></div>`;
            this.say(`${d.name}: ${d.verb === 'brennt' ? 'Brennvorgang' : 'Schreibvorgang'} läuft …`);
            const anim = MV.fillViz.run($('fv-host'), {
                device: d, file: f, capacity: s.cap,
                onDone: (N) => {
                    s.n = N; s.nFile = f.id; s.reached = Math.max(s.reached || 1, 5);
                    this.save();
                    this.renderStepper();
                    const skip = $('fv-skip'); if (skip) skip.remove();
                    $('fv-result').innerHTML = this.resultCard(d, s, f, N);
                    $('to-cmp').addEventListener('click', () => this.go(d.id, 5));
                    this.say(N ? `Fertig! Es passen genau ${U.num(N)} × ${f.name} ${aufDen(d)} ${d.name}.` : `Die Datei ist zu groß für ${ART[d.article][3]} ${d.name}!`);
                },
            });
            this.anim = { stop: () => anim.cancel() };
            $('fv-skip').addEventListener('click', () => anim.skip());
        },
        resultCard(d, s, f, N) {
            const g = s.guess;
            let verdict, cls;
            if (N === 0) {
                verdict = `Passt nicht! ${f.name} ist ${U.times(f.bytes / s.cap)}-mal so groß wie ${ART[d.article][0]} ganze ${d.name}.`;
                cls = 'bad';
            } else if (g === 0) { verdict = 'Du hast 0 geschätzt – es passt aber einiges drauf!'; cls = 'bad'; }
            else {
                const r = N / g;
                if (r >= 0.9 && r <= 1.1) { verdict = 'Volltreffer! Super geschätzt.'; cls = 'ok'; }
                else if (r > 1) { verdict = `Du hast ${U.times(r)}-mal zu wenig geschätzt.`; cls = r < 2 ? 'mid' : 'bad'; }
                else { verdict = `Du hast ${U.times(1 / r)}-mal zu viel geschätzt.`; cls = r > 0.5 ? 'mid' : 'bad'; }
            }
            const rest = s.cap - N * f.bytes;
            return `<div class="result ${cls}">` +
                `<div class="res-col"><span class="res-l">Deine Schätzung</span><span class="res-v">${U.num(g)}</span></div>` +
                `<div class="res-col"><span class="res-l">Tatsächlich</span><span class="res-v big">${U.num(N)}</span></div>` +
                `<div class="res-text"><p class="res-verdict">${verdict}</p>` +
                `<p class="res-calc">Rechnung: ${U.size(s.cap)} ÷ ${U.winSize(f.bytes)} = ${U.num(s.cap / f.bytes, 1)} → ${U.num(N)} ganze Dateien. Es bleiben ${U.size(rest)} frei.</p></div>` +
                `<div class="res-act"><button type="button" class="btn btn-primary" id="to-cmp">Weiter zum Größenvergleich →</button></div>` +
                `</div>`;
        },

        /* --- 5 Vergleich --- */
        renderCompare(body, d) {
            const me = { ...d, cap: this.state.devices[d.id].cap };
            const others = MV.DEVICES.filter((x) => x.id !== d.id && this.state.devices[x.id])
                .map((x) => ({ ...x, cap: this.state.devices[x.id].cap, order: this.state.devices[x.id].order || 0 }))
                .sort((a, b) => b.order - a.order);
            const all = [me, ...others].sort((a, b) => a.cap - b.cap);
            let other = this._cmpWith && others.find((o) => o.id === this._cmpWith) || others[0];

            const draw = () => {
                let head, tilesLegend, small, big, stackHtml = '';
                if (other) {
                    [small, big] = me.cap <= other.cap ? [me, other] : [other, me];
                    const k = big.cap / small.cap;
                    head = `<h3>Wie viele <span class="hl-p">${small.plural}</span> passen ${inDen(big)} <span class="hl-c">${big.name}</span>?</h3>` +
                        `<p class="cmp-answer"><span class="cmp-k">${U.ratio(k)}</span> ${k >= 1.995 || k < 1 ? small.plural : small.name}</p>` +
                        `<p class="cmp-sub">${U.size(big.cap)} ÷ ${U.size(small.cap)} = ${U.ratio(k)}</p>`;
                    tilesLegend = `<span><i class="sq pink"></i>1 Kästchen = 1 ${small.name} (${U.size(small.cap)})</span><span><i class="sq cyan"></i>gesamte Fläche = 1 ${big.name} (${U.size(big.cap)}) = ${U.ratio(k)} Kästchen</span>`;
                    const st = MV.compareViz.stack(small, big);
                    stackHtml = `<div class="cmp-card"><h4>Stapel-Check</h4>${st.svg}<p>${st.text}</p></div>`;
                } else {
                    const f = MV.fileById(this.state.devices[d.id].nFile || this.state.loaded[0] || d.file);
                    const hint = `<p class="cmp-sub">Scanne ein zweites Gerät – dann vergleichst du hier Datenträger miteinander!</p>`;
                    if (f.bytes <= me.cap) {
                        small = { name: f.name, plural: f.name, cap: f.bytes }; big = me;
                        head = `<h3>So viele <span class="hl-p">${f.name}</span> passen ${aufDen(d)} <span class="hl-c">${d.name}</span></h3>` +
                            `<p class="cmp-answer"><span class="cmp-k">${U.num(Math.floor(me.cap / f.bytes))}</span> ganze Dateien</p>` + hint;
                        tilesLegend = `<span><i class="sq pink"></i>1 Kästchen = 1 × ${f.name} (${U.winSize(f.bytes)})</span><span><i class="sq cyan"></i>gesamte Fläche = ${d.name} (${U.size(me.cap)})</span>`;
                    } else {
                        small = me; big = { name: f.name, cap: f.bytes };
                        head = `<h3>Wie viele <span class="hl-p">${d.plural}</span> bräuchtest du für <span class="hl-c">${f.name}</span>?</h3>` +
                            `<p class="cmp-answer"><span class="cmp-k">${U.num(Math.ceil(f.bytes / me.cap))}</span> ${d.plural}</p>` + hint;
                        tilesLegend = `<span><i class="sq pink"></i>1 Kästchen = 1 ${d.name} (${U.size(me.cap)})</span><span><i class="sq cyan"></i>gesamte Fläche = ${f.name} (${U.winSize(f.bytes)})</span>`;
                    }
                }
                body.innerHTML =
                    `<div class="cmp">` +
                    `<p class="kicker">DIMENSIONSVERGLEICH</p>` +
                    (others.length ? `<div class="est-files"><span>Vergleichen mit:</span>${others.map((o) => `<button type="button" class="chip${o.id === other.id ? ' on' : ''}" data-o="${o.id}">${o.name}</button>`).join('')}</div>` : '') +
                    head +
                    `<div class="cmp-grid">` +
                    `<div class="cmp-card cmp-tiles"><h4>Flächen-Zoom</h4><canvas id="cmp-canvas" aria-label="Kachelvergleich"></canvas><div class="cmp-legend">${tilesLegend}</div><button type="button" class="btn btn-ghost btn-small" id="cmp-replay">↻ Zoom wiederholen</button></div>` +
                    stackHtml +
                    `<div class="cmp-card cmp-ladder"><h4>Rangliste deiner Geräte</h4>${MV.compareViz.ladder(all, [d.id, other ? other.id : ''])}</div>` +
                    `</div>` +
                    `<div class="step-actions"><button type="button" class="btn btn-primary" id="cmp-done">${this.state.devices[d.id].done ? 'Zurück zum Labor' : 'Gerät abschließen ✓'}</button></div>` +
                    `</div>`;
                const run = () => { if (this.anim) this.anim.stop(); this.anim = MV.compareViz.tiles($('cmp-canvas'), small, big); };
                requestAnimationFrame(run);
                $('cmp-replay').addEventListener('click', run);
                const o = body.querySelector('.est-files');
                if (o) o.addEventListener('click', (e) => {
                    const b = e.target.closest('[data-o]');
                    if (b) { this._cmpWith = b.dataset.o; other = others.find((x) => x.id === b.dataset.o); draw(); }
                });
                $('cmp-done').addEventListener('click', () => this.finishDevice(d));
            };
            draw();
            this.say(other ? `Wie viele ${me.cap <= other.cap ? me.plural : other.plural} passen hinein? Schau dir den Zoom und den Stapel an!` : `Das ist dein erstes Gerät. Scanne ein weiteres, um Datenträger zu vergleichen.`);
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
                this.confirm('ALLE SYSTEME GESCANNT', `<p>Du hast alle ${MV.DEVICES.length} Speichermedien untersucht – von der Diskette bis zur Festplatte. Du bist jetzt Speicher-Expert*in!</p>` +
                    MV.compareViz.ladder(MV.DEVICES.map((x) => ({ ...x, cap: this.state.devices[x.id].cap })), []), 'Weiter');
                this.say('Mission erfüllt: Alle Geräte gescannt!');
            } else if (first) {
                this.say(`${d.name} abgeschlossen (${this.doneCount()}/${MV.DEVICES.length}). Nimm das nächste Gerät vom Tisch!`);
            }
        },
    };

    MV.app = app;
    document.addEventListener('DOMContentLoaded', () => app.init());
})();
