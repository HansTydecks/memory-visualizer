/* Simulierter Datei-Explorer im Stil von Windows 11 – mit Kontextmenü und Eigenschaften-Dialog. */
(function () {
    const MV = window.MV;
    const U = MV.units;
    const $ = (id) => document.getElementById(id);

    /* Symbole in Windows-Optik (farbig auf hellem Grund) */
    const ICONS = {
        doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h8l4.5 4.5v14.5H6z" fill="#fff" stroke="#6b7a90" stroke-width="1.2"/><path d="M14 2.5V7h4.5" fill="#e8edf4" stroke="#6b7a90" stroke-width="1.2"/><path d="M8.5 11h7.5M8.5 14h7.5M8.5 17h5" stroke="#2b7cd3" stroke-width="1.3"/></svg>',
        img: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4.5" width="18" height="15" rx="1.5" fill="#fff" stroke="#6b7a90" stroke-width="1.2"/><path d="M4.5 18l5-5.5 3.5 3.5 2-2 4.5 4" fill="#57b05b" stroke="#3c8a40" stroke-width="1"/><circle cx="15.5" cy="9" r="1.8" fill="#f5b400"/></svg>',
        music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5V5.5l10-2v12" fill="none" stroke="#c2477d" stroke-width="1.8"/><circle cx="6.5" cy="17.5" r="2.7" fill="#e05a99"/><circle cx="16.5" cy="15.5" r="2.7" fill="#e05a99"/></svg>',
        video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="14" height="13" rx="1.5" fill="#7a5af5" stroke="#5a3fd1" stroke-width="1"/><path d="M16.5 10l5-3v10l-5-3z" fill="#9b84ff" stroke="#5a3fd1" stroke-width="1"/></svg>',
        folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.5a1.5 1.5 0 0 1 1.5-1.5h5l2 2h9a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5z" fill="#ffc83d" stroke="#e0a526" stroke-width="1"/><path d="M2.5 9.5h19" stroke="#e0a526" stroke-width="1"/></svg>',
        props: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" fill="#fff" stroke="#5f6b7a" stroke-width="1.3"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#005fb8" stroke-width="1.5"/></svg>',
        open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h6M5 5v14h14v-6M13 5h6v6M19 5l-8 8" fill="none" stroke="#5f6b7a" stroke-width="1.5"/></svg>',
    };
    const typeIcon = { text: 'doc', image: 'img', music: 'music', video: 'video' };
    MV.fileIcon = (f) => ICONS[typeIcon[f.type]];

    function parseNum(str) {
        const s = String(str).trim().replace(/\s/g, '');
        if (!s) return NaN;
        let t = s;
        if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
        else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
        return Number(t);
    }
    MV.parseNum = parseNum;

    const onDisk = (b) => Math.ceil(b / 4096) * 4096;

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

        folderName(id = this.folder) { return MV.FOLDERS.find((f) => f.id === id).name; }

        renderSide() {
            $('win-side').innerHTML = MV.FOLDERS.map((f) =>
                `<button type="button" class="side-item${f.id === this.folder ? ' active' : ''}" data-folder="${f.id}" aria-current="${f.id === this.folder}">${ICONS.folder}<span>${f.name}</span></button>`).join('');
        }

        renderList(focusId) {
            const files = MV.FILES.filter((f) => f.folder === this.folder);
            const name = this.folderName();
            $('win-tab').textContent = name;
            $('win-path').innerHTML = ['Schule', 'Tauschordner', name].map((p) => `<span>${p}</span>`).join('<i aria-hidden="true">›</i>');
            const hasSel = files.some((f) => f.id === this.sel);
            $('win-list').innerHTML = `<div class="list-head" aria-hidden="true"><span>Name</span></div>` + files.map((f, i) =>
                `<div class="file-row${this.sel === f.id ? ' sel' : ''}" role="option" tabindex="${this.sel === f.id || (!hasSel && i === 0) ? 0 : -1}" aria-selected="${this.sel === f.id}" data-file="${f.id}">` +
                `<span class="fr-ico">${MV.fileIcon(f)}</span>` +
                `<span class="fr-name">${f.name}${this.isLoaded(f.id) ? '<span class="fr-ok" aria-label="geladen"> ✓</span>' : ''}</span>` +
                `</div>`).join('');
            $('win-status').textContent = `${files.length} Elemente` + (hasSel ? '   |   1 Element ausgewählt' : '');
            $('cmd-props').disabled = !hasSel;
            if (focusId) { const r = $('win-list').querySelector(`[data-file="${focusId}"]`); r && r.focus(); }
        }

        select(id, focus) {
            this.sel = id;
            this.renderList(focus ? id : null);
            const f = MV.fileById(id);
            $('loader-file').textContent = f.name;
            ['loader-size', 'loader-unit', 'loader-btn'].forEach((i) => ($(i).disabled = false));
            this.msg('', '');
        }

        msg(text, cls) {
            const m = $('loader-msg');
            m.textContent = text;
            m.className = 'loader-msg' + (cls ? ' ' + cls : '');
            $('loader-size').setAttribute('aria-invalid', cls === 'bad' ? 'true' : 'false');
        }

        openCtx(id, x, y) {
            this.select(id);
            const ctx = $('ctx');
            const win = $('win').getBoundingClientRect();
            ctx.hidden = false;
            const w = ctx.offsetWidth, h = ctx.offsetHeight;
            ctx.style.left = Math.max(4, Math.min(x - win.left, win.width - w - 4)) + 'px';
            ctx.style.top = Math.max(4, Math.min(y - win.top, win.height - h - 4)) + 'px';
            ctx.querySelector('[data-act="props"]').focus();
        }
        closeCtx(refocus) {
            if ($('ctx').hidden) return;
            $('ctx').hidden = true;
            if (refocus && this.sel) this.renderList(this.sel);
        }

        openProps(id) {
            const f = MV.fileById(id);
            if (!f) return;
            this.closeCtx();
            const box = $('props');
            const where = `C:\\Schule\\Tauschordner\\${this.folderName(f.folder)}`;
            box.innerHTML =
                `<div class="props-bar"><span class="props-ico">${MV.fileIcon(f)}</span><span id="props-title">Eigenschaften von ${f.name}</span><button type="button" class="props-x" data-close aria-label="Schließen">✕</button></div>` +
                `<div class="props-tabs" aria-hidden="true"><span class="on">Allgemein</span><span>Sicherheit</span><span>Details</span><span>Vorgängerversionen</span></div>` +
                `<div class="props-page">` +
                `<div class="props-file"><span class="fr-ico big">${MV.fileIcon(f)}</span><span class="props-namebox">${f.name}</span></div>` +
                `<dl>` +
                `<dt>Dateityp:</dt><dd>${f.kind}</dd>` +
                `<dt>Öffnen mit:</dt><dd>${f.app}</dd>` +
                `<dt class="sep">Ort:</dt><dd class="sep">${where}</dd>` +
                `<dt>Größe:</dt><dd>${U.winSize(f.bytes)} (${U.num(f.bytes)} Bytes)</dd>` +
                `<dt>Größe auf Datenträger:</dt><dd>${U.winSize(onDisk(f.bytes))} (${U.num(onDisk(f.bytes))} Bytes)</dd>` +
                `<dt class="sep">Erstellt:</dt><dd class="sep">${f.date}</dd>` +
                `</dl></div>` +
                `<div class="props-foot"><button type="button" class="wbtn wbtn-primary" data-close>OK</button><button type="button" class="wbtn" data-close>Abbrechen</button><button type="button" class="wbtn" disabled>Übernehmen</button></div>`;
            box.hidden = false;
            box.querySelector('.wbtn-primary').focus();
            MV.app && MV.app.say('Lies in der Zeile „Größe“ ab, wie groß die Datei ist. Trage Zahl und Einheit unten ein.');
        }
        closeProps() {
            if ($('props').hidden) return;
            $('props').hidden = true;
            $('loader-size').focus();
        }

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
                const row = e.target.closest('[data-file]');
                if (row) { this.select(row.dataset.file, true); this.closeCtx(); }
            });
            list.addEventListener('dblclick', (e) => {
                if (e.target.closest('[data-file]')) this.hintOpen();
            });
            list.addEventListener('contextmenu', (e) => {
                const row = e.target.closest('[data-file]');
                if (!row) return;
                e.preventDefault();
                this.openCtx(row.dataset.file, e.clientX, e.clientY);
            });
            // langes Drücken auf Touch-Geräten = Rechtsklick (wie unter Windows)
            let press;
            list.addEventListener('pointerdown', (e) => {
                const row = e.target.closest('[data-file]');
                if (!row || e.pointerType === 'mouse') return;
                press = setTimeout(() => this.openCtx(row.dataset.file, e.clientX, e.clientY), 550);
            });
            ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => list.addEventListener(t, () => clearTimeout(press)));

            list.addEventListener('keydown', (e) => {
                const row = e.target.closest('[data-file]');
                if (!row) return;
                const id = row.dataset.file;
                if (e.key === 'Enter' && e.altKey) { e.preventDefault(); this.select(id); this.openProps(id); return; }
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(id, true); return; }
                if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                    e.preventDefault();
                    const r = row.getBoundingClientRect();
                    this.openCtx(id, r.left + 40, r.bottom);
                    return;
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const rows = [...list.querySelectorAll('.file-row')];
                    const next = rows[rows.indexOf(row) + (e.key === 'ArrowDown' ? 1 : -1)];
                    if (next) this.select(next.dataset.file, true);
                }
            });
            $('cmd-props').addEventListener('click', () => this.openProps(this.sel));

            const ctx = $('ctx');
            ctx.addEventListener('click', (e) => {
                const b = e.target.closest('[data-act]');
                if (!b) return;
                if (b.dataset.act === 'props') this.openProps(this.sel);
                else { this.closeCtx(true); this.hintOpen(); }
            });
            ctx.addEventListener('keydown', (e) => {
                const items = [...ctx.querySelectorAll('[role="menuitem"]')];
                const i = items.indexOf(document.activeElement);
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
                } else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); this.closeCtx(true); }
            });
            document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#ctx')) this.closeCtx(); });

            const props = $('props');
            props.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) this.closeProps(); });
            props.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { e.preventDefault(); this.closeProps(); }
            });

            $('loader').addEventListener('submit', (e) => { e.preventDefault(); this.tryLoad(); });
        }

        hintOpen() {
            MV.app && MV.app.say('Öffnen brauchen wir nicht. Mach einen Rechtsklick auf die Datei und wähle „Eigenschaften“.');
        }

        tryLoad() {
            const f = MV.fileById(this.sel);
            if (!f) return;
            const v = parseNum($('loader-size').value);
            const unit = $('loader-unit').value;
            const bad = (t) => { this.msg(t, 'bad'); $('loader-size').focus(); };
            if (!isFinite(v) || v <= 0) return bad('Gib eine Zahl ein, zum Beispiel 4,11.');
            const entered = U.toBytes(v, unit);
            const close = (a, b) => Math.abs(a / b - 1) <= 0.03;
            if (close(entered, f.bytes)) {
                this.msg(`✓ ${f.name} ist geladen (${U.winSize(f.bytes)}).`, 'ok');
                $('loader-size').value = '';
                this.closeProps();
                this.onLoad(f);
                this.renderList();
                return;
            }
            if (Object.keys(U.FACT).some((u) => u !== unit && close(U.toBytes(v, u), f.bytes))) return bad('Die Zahl stimmt, aber die Einheit nicht. Schau genau, was hinter der Zahl steht.');
            if (close(entered, onDisk(f.bytes)) && !close(onDisk(f.bytes), f.bytes)) return bad('Das ist die „Größe auf Datenträger“. Nimm die Zeile darüber: „Größe“.');
            if (close(v, f.bytes)) return bad('Das ist die Zahl in Bytes. Wähle dann auch „Byte“ als Einheit.');
            bad('Das passt nicht. Öffne die Eigenschaften (Rechtsklick) und lies die Zeile „Größe“ ab.');
        }
    }
    MV.Explorer = Explorer;
})();
