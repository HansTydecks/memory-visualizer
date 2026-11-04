/* Simulierter Datei-Explorer mit Kontextmenü und Eigenschaften-Dialog. */
(function () {
    const MV = window.MV;
    const U = MV.units;
    const $ = (id) => document.getElementById(id);

    const ICONS = {
        doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 2v4h4M9 11h6M9 14h6M9 17h4" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
        img: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 18l5-6 4 4 2-2 3 4" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="16" cy="9" r="1.6" fill="currentColor"/></svg>',
        music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6.5" cy="18" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.5" cy="16" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
        video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="15" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M17 10l5-3v10l-5-3z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
        folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h7l2 2h11v11H2z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    };
    const typeIcon = { text: 'doc', image: 'img', music: 'music', video: 'video' };
    MV.fileIcon = (f) => ICONS[typeIcon[f.type]];

    function parseNum(str) {
        const s = String(str).trim().replace(/\s/g, '');
        if (!s) return NaN;
        // „1.234,5“ oder „1,5“ oder „1.5“
        let t = s;
        if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
        else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
        return Number(t);
    }
    MV.parseNum = parseNum;

    class Explorer {
        constructor(opts) {
            this.onLoad = opts.onLoad;
            this.isLoaded = opts.isLoaded;
            this.folder = 'music';
            this.sel = null;
            this.renderSide();
            this.renderList();
            this.bind();
        }

        renderSide() {
            $('win-side').innerHTML = MV.FOLDERS.map((f) =>
                `<button type="button" class="side-item${f.id === this.folder ? ' active' : ''}" data-folder="${f.id}">${ICONS.folder}<span>${f.name}</span></button>`).join('');
        }

        renderList() {
            const files = MV.FILES.filter((f) => f.folder === this.folder);
            const folder = MV.FOLDERS.find((f) => f.id === this.folder);
            $('win-path').textContent = `C:\\Schule\\Tauschordner\\ausgeteilt\\${folder.name}`;
            $('win-list').innerHTML = `<div class="list-head"><span>Name</span></div>` + files.map((f) =>
                `<div class="file-row${this.sel === f.id ? ' sel' : ''}${this.isLoaded(f.id) ? ' loaded' : ''}" role="option" tabindex="0" aria-selected="${this.sel === f.id}" data-file="${f.id}">` +
                `<span class="fr-ico t-${f.type}">${MV.fileIcon(f)}</span>` +
                `<span class="fr-name">${f.name}</span>` +
                `<span class="fr-kind">${f.kind.split(' (')[0]}</span>` +
                `<button type="button" class="fr-more" data-more="${f.id}" aria-label="Menü für ${f.name}">⋯</button>` +
                `</div>`).join('');
            $('win-status').textContent = `${files.length} Elemente` + (this.sel ? ` · 1 Element ausgewählt` : ' · Rechtsklick auf eine Datei → Eigenschaften');
        }

        select(id) {
            this.sel = id;
            this.renderList();
            const f = MV.fileById(id);
            $('loader-file').textContent = f.name;
            ['loader-size', 'loader-unit', 'loader-btn'].forEach((i) => ($(i).disabled = false));
            $('loader-msg').textContent = '';
            $('loader-msg').className = 'loader-msg';
        }

        openCtx(id, x, y) {
            this.select(id);
            const ctx = $('ctx');
            const win = ctx.parentElement.getBoundingClientRect();
            ctx.hidden = false;
            const w = ctx.offsetWidth, h = ctx.offsetHeight;
            ctx.style.left = Math.max(4, Math.min(x - win.left, win.width - w - 4)) + 'px';
            ctx.style.top = Math.max(4, Math.min(y - win.top, win.height - h - 4)) + 'px';
            ctx.querySelector('[data-act="props"]').focus();
        }
        closeCtx() { $('ctx').hidden = true; }

        openProps(id) {
            const f = MV.fileById(id);
            const box = $('props');
            box.innerHTML =
                `<div class="props-bar"><span id="props-title">Eigenschaften von ${f.name}</span><button type="button" class="props-x" data-close aria-label="Schließen">×</button></div>` +
                `<div class="props-tabs"><span class="on">Allgemein</span><span>Details</span><span>Sicherheit</span></div>` +
                `<div class="props-body">` +
                `<div class="props-file"><span class="fr-ico big t-${f.type}">${MV.fileIcon(f)}</span><span>${f.name}</span></div>` +
                `<dl>` +
                `<dt>Dateityp:</dt><dd>${f.kind}</dd>` +
                `<dt>Öffnen mit:</dt><dd>${f.app}</dd>` +
                `<dt class="sep">Ort:</dt><dd class="sep">C:\\Schule\\Tauschordner\\ausgeteilt\\${MV.FOLDERS.find((x) => x.id === f.folder).name}</dd>` +
                `<dt class="hl">Größe:</dt><dd class="hl">${U.winSize(f.bytes)} (${U.num(f.bytes)} Bytes)</dd>` +
                `<dt class="sep">Erstellt:</dt><dd class="sep">${f.date}</dd>` +
                `</dl></div>` +
                `<div class="props-foot"><button type="button" class="btn btn-small" data-close>OK</button></div>`;
            box.hidden = false;
            box.querySelector('.props-foot [data-close]').focus();
            MV.app && MV.app.say(`Lies die Größe ab und trage sie unten bei „Datei laden“ ein – Zahl UND Einheit!`);
        }
        closeProps() { $('props').hidden = true; }

        bind() {
            $('win-side').addEventListener('click', (e) => {
                const b = e.target.closest('[data-folder]');
                if (!b) return;
                this.folder = b.dataset.folder;
                this.renderSide();
                this.renderList();
                this.closeCtx();
            });
            const list = $('win-list');
            list.addEventListener('click', (e) => {
                const more = e.target.closest('[data-more]');
                if (more) {
                    const r = more.getBoundingClientRect();
                    this.openCtx(more.dataset.more, r.left, r.bottom);
                    e.stopPropagation();
                    return;
                }
                const row = e.target.closest('[data-file]');
                if (row) { this.select(row.dataset.file); this.closeCtx(); }
            });
            list.addEventListener('dblclick', (e) => {
                const row = e.target.closest('[data-file]');
                if (row) this.say('open');
            });
            list.addEventListener('contextmenu', (e) => {
                const row = e.target.closest('[data-file]');
                if (!row) return;
                e.preventDefault();
                this.openCtx(row.dataset.file, e.clientX, e.clientY);
            });
            list.addEventListener('keydown', (e) => {
                const row = e.target.closest('[data-file]');
                if (!row) return;
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(row.dataset.file); }
                if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                    e.preventDefault();
                    const r = row.getBoundingClientRect();
                    this.openCtx(row.dataset.file, r.left + 40, r.bottom);
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const rows = [...list.querySelectorAll('.file-row')];
                    const i = rows.indexOf(row) + (e.key === 'ArrowDown' ? 1 : -1);
                    if (rows[i]) { this.select(rows[i].dataset.file); list.querySelector(`[data-file="${rows[i].dataset.file}"]`).focus(); }
                }
            });
            $('ctx').addEventListener('click', (e) => {
                const b = e.target.closest('[data-act]');
                if (!b) return;
                this.closeCtx();
                if (b.dataset.act === 'props') this.openProps(this.sel);
                else this.say('open');
            });
            $('ctx').addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeCtx(); });
            document.addEventListener('click', (e) => { if (!e.target.closest('#ctx')) this.closeCtx(); });
            $('props').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) this.closeProps(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { this.closeCtx(); this.closeProps(); } });

            $('loader').addEventListener('submit', (e) => {
                e.preventDefault();
                this.tryLoad();
            });
        }

        say(kind) {
            if (kind === 'open') MV.app && MV.app.say('Öffnen geht hier nicht – wir brauchen nur die Größe. Rechtsklick → Eigenschaften!');
        }

        tryLoad() {
            const f = MV.fileById(this.sel);
            if (!f) return;
            const v = parseNum($('loader-size').value);
            const unit = $('loader-unit').value;
            const msg = $('loader-msg');
            const bad = (t) => { msg.textContent = t; msg.className = 'loader-msg bad'; $('loader-size').focus(); };
            if (!isFinite(v) || v <= 0) return bad('Bitte gib eine Zahl ein, z. B. 4,11.');
            const entered = U.toBytes(v, unit);
            const close = (a, b) => Math.abs(a / b - 1) <= 0.03;
            if (close(entered, f.bytes)) {
                msg.textContent = `✓ ${f.name} geladen: ${U.winSize(f.bytes)}`;
                msg.className = 'loader-msg ok';
                $('loader-size').value = '';
                this.onLoad(f);
                this.renderList();
                return;
            }
            const unitHit = Object.keys(U.FACT).find((u) => u !== unit && close(U.toBytes(v, u), f.bytes));
            if (unitHit) return bad(`Die Zahl stimmt – aber die Einheit nicht! Schau noch mal genau hinter die Zahl.`);
            if (close(v, f.bytes)) return bad('Das ist die Größe in Byte. Wähle dann auch „Byte“ als Einheit – oder nimm die kürzere Zahl davor.');
            bad('Das passt nicht zur Datei. Öffne die Eigenschaften (Rechtsklick) und lies die Größe genau ab.');
        }
    }
    MV.Explorer = Explorer;
})();
