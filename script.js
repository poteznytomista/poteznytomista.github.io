/**
 * Scriptura Sacra - Core Logic
 * Refactored for modularity, modern ES6+ standards, and elegance.
 */

class BibleApp {
    constructor() {
        // Configuration Constants
        this.TRANSLATIONS = [
            { name: "Biblia Jakuba Wujka", file: "WUJ.json" },
            { name: "Vulgata Clementina", file: "VUL.json" },
            { name: "Nestle-Aland 1904", file: "NA1904.json" },
            { name: "Douay-Rheims Bible", file: "DRA.json" }
        ];

        this.BOOK_NAMES = {
            "Rdz": "Rodzaju", "Wj": "Wyjścia", "Kpł": "Kapłańska", "Lb": "Liczb", "Pwt": "Powtórzonego Prawa",
            "Joz": "Jozuego", "Sdz": "Sędziów", "Rt": "Rut", "1Sm": "I Królewska (I Samuela)",
            "2Sm": "II Królewska (II Samuela)", "1Krl": "III Królewska (I Królewska)", "2Krl": "IV Królewska (II Królewska)",
            "1Krn": "I Paralipomenon (I Kronik)", "2Krn": "II Paralipomenon (II Kronik)", "Ezd": "Ezdrasza",
            "Ne": "II Ezdrasza (Nehemiasza)", "Tb": "Tobiasza", "Jdt": "Judyty", "Es": "Estery",
            "1Mch": "I Machabejska", "2Mch": "II Machabejska", "Hi": "Joba (Hioba)", "Ps": "Psalmów",
            "Prz": "Przysłów (Przypowieści)", "Koh": "Eklezjastesa (Koheleta)", "Pnp": "Pieśń nad Pieśniami",
            "Mdr": "Mądrości", "Syr": "Eklezjastyk (Mądrość Syracha)", "Iz": "Izajasza", "Jr": "Jeremiasza",
            "Lm": "Treny (Lamentacje Jeremiasza)", "Ba": "Barucha", "Ez": "Ezechiela", "Dn": "Daniela",
            "Oz": "Ozeasza", "Jo": "Joela", "Am": "Amosa", "Ab": "Abdiasza", "Jon": "Jonasza",
            "Mi": "Micheasza", "Na": "Nahuma", "Ha": "Habakuka", "So": "Sofoniasza", "Ag": "Aggeusza",
            "Za": "Zachariasza", "Ml": "Malachiasza", "Mt": "Mateusza", "Mk": "Marka", "Łk": "Łukasza",
            "J": "Jana", "Dz": "Dzieje Apostolskie", "Rz": "Rzymian", "1Kor": "I Koryntian",
            "2Kor": "II Koryntian", "Ga": "Galatów", "Ef": "Efezjan", "Flp": "Filipian", "Kol": "Kolosan",
            "1Tes": "I Tesaloniczan", "2Tes": "II Tesaloniczan", "1Tm": "I Tymoteusza", "2Tm": "II Tymoteusza",
            "Tt": "Tytusa", "Fil": "Filemona", "Hbr": "Żydów (Hebrajczyków)", "Jk": "Jakuba",
            "1P": "I Piotra", "2P": "II Piotra", "1J": "I Jana", "2J": "II Jana", "3J": "III Jana",
            "Jd": "Judy", "Ap": "Apokalipsa św. Jana"
        };

        // Application State
        this.state = {
            bibleData: {},
            currentTranslation: null,
            currentBook: null,
            currentChapter: 1,
            currentRefs: null,
            selection: new Set(),
            userData: { highlights: {}, notes: [] }
        };

        // DOM Elements Cache
        this.dom = {
            translationSelect: document.getElementById("translationSelect"),
            bookSelect: document.getElementById("bookSelect"),
            chapterSelect: document.getElementById("chapterSelect"),
            referenceInput: document.getElementById("referenceInput"),
            refSubmit: document.getElementById("refSubmit"),
            textDisplay: document.getElementById("textDisplay")
        };

        this.init();
    }

    init() {
        this.populateTranslations();
        this.bindEvents();
        this.injectStyles();
        this.createActionMenu();

        if (this.TRANSLATIONS.length > 0) {
            this.dom.translationSelect.value = this.TRANSLATIONS[0].file;
            this.loadTranslation(this.TRANSLATIONS[0].file);
        }
    }

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .verse-span {
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 3px;
                transition: background-color 0.2s;
                position: relative;
                line-height: 1.6;
            }
            .verse-selected {
                background-color: rgba(255, 255, 255, 0.3) !important;
                box-shadow: 0 0 2px rgba(255,255,255,0.5);
            }
            /* Highlight Colors (Eye-friendly for Black-Gold theme) */
            .hl-gold { background-color: rgba(192, 160, 98, 0.4) !important; }
            .hl-olive { background-color: rgba(107, 142, 35, 0.4) !important; }
            .hl-blue { background-color: rgba(70, 130, 180, 0.4) !important; }
            .hl-red { background-color: rgba(205, 92, 92, 0.4) !important; }
            .hl-purple { background-color: rgba(147, 112, 219, 0.4) !important; }

            /* Action Menu */
            #bibleActionMenu {
                position: fixed;
                background: #1a1a1a;
                border: 1px solid #d4af37;
                padding: 8px;
                border-radius: 6px;
                display: none;
                z-index: 1000;
                box-shadow: 0 4px 8px rgba(0,0,0,0.6);
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 150px;
            }
            .menu-actions {
                display: flex;
                gap: 8px;
                align-items: center;
                justify-content: center;
            }
            .color-dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                border: 1px solid #555;
                transition: transform 0.1s;
            }
            .color-dot:hover { transform: scale(1.2); border-color: #fff; }
            
            .menu-divider { width: 1px; height: 20px; background: #444; }
            
            .note-btn {
                background: transparent;
                color: #d4af37;
                border: 1px solid #d4af37;
                padding: 2px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.2s;
            }
            .note-btn:hover { background: #d4af37; color: #000; }

            /* Note Input Area in Menu */
            #noteInputArea {
                display: none;
                flex-direction: column;
                gap: 5px;
                width: 100%;
            }
            #noteInputArea textarea {
                background: #222;
                border: 1px solid #444;
                color: #ddd;
                padding: 5px;
                border-radius: 4px;
                resize: vertical;
                min-height: 60px;
                font-family: inherit;
            }
            .note-save-btn {
                background: #d4af37;
                color: #000;
                border: none;
                padding: 4px;
                border-radius: 3px;
                cursor: pointer;
                font-weight: bold;
            }

            /* Sticky Notes */
            .sticky-note {
                position: fixed;
                width: 220px;
                background: #252525;
                border: 1px solid #d4af37;
                border-radius: 4px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                z-index: 950;
                display: flex;
                flex-direction: column;
                font-size: 0.9rem;
            }
            .sticky-header {
                background: #1a1a1a;
                padding: 5px 8px;
                cursor: move;
                border-bottom: 1px solid #444;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #d4af37;
                font-size: 0.8rem;
                user-select: none;
            }
            .sticky-content {
                padding: 8px;
                color: #ddd;
                white-space: pre-wrap;
                max-height: 200px;
                overflow-y: auto;
            }
            .sticky-close {
                cursor: pointer;
                color: #888;
                font-weight: bold;
            }
            .sticky-close:hover { color: #cd5c5c; }
        `;
        document.head.appendChild(style);
    }

    createActionMenu() {
        const menu = document.createElement('div');
        menu.id = 'bibleActionMenu';
        menu.style.display = 'none';
        
        // Action Buttons Container
        const actions = document.createElement('div');
        actions.className = 'menu-actions';
        
        const colors = [
            { c: 'hl-gold', hex: '#C0A062' },
            { c: 'hl-olive', hex: '#6B8E23' },
            { c: 'hl-blue', hex: '#4682B4' },
            { c: 'hl-red', hex: '#CD5C5C' },
            { c: 'hl-purple', hex: '#9370DB' }
        ];

        colors.forEach(col => {
            const dot = document.createElement('div');
            dot.className = 'color-dot';
            dot.style.backgroundColor = col.hex;
            dot.onclick = (e) => {
                e.stopPropagation();
                this.applyHighlight(col.c);
            };
            actions.appendChild(dot);
        });

        const removeDot = document.createElement('div');
        removeDot.className = 'color-dot';
        removeDot.style.backgroundColor = '#222';
        removeDot.style.color = '#ccc';
        removeDot.style.display = 'flex';
        removeDot.style.alignItems = 'center';
        removeDot.style.justifyContent = 'center';
        removeDot.innerHTML = '&times;';
        removeDot.onclick = (e) => {
            e.stopPropagation();
            this.removeHighlight();
        };
        actions.appendChild(removeDot);

        const divider = document.createElement('div');
        divider.className = 'menu-divider';
        actions.appendChild(divider);

        const noteBtn = document.createElement('button');
        noteBtn.className = 'note-btn';
        noteBtn.textContent = 'Notatka';
        actions.appendChild(noteBtn);
        
        // Note Input Area
        const inputArea = document.createElement('div');
        inputArea.id = 'noteInputArea';
        inputArea.innerHTML = `
            <textarea placeholder="Wpisz notatkę..."></textarea>
            <button class="note-save-btn">Zapisz</button>
        `;

        menu.appendChild(actions);
        menu.appendChild(inputArea);
        document.body.appendChild(menu);

        // Event Listeners
        const saveBtn = menu.querySelector('.note-save-btn');
        const textarea = menu.querySelector('textarea');

        noteBtn.onclick = (e) => {
            e.stopPropagation();
            inputArea.style.display = 'flex';
            textarea.focus();
        };

        saveBtn.onclick = (e) => {
            e.stopPropagation();
            this.saveNote(textarea.value);
            textarea.value = '';
            inputArea.style.display = 'none';
        };
        
        // Prevent menu clicks from closing selection
        menu.addEventListener('click', (e) => e.stopPropagation());
    }

    populateTranslations() {
        this.TRANSLATIONS.forEach(tr => {
            const opt = document.createElement("option");
            opt.value = tr.file;
            opt.textContent = tr.name;
            this.dom.translationSelect.appendChild(opt);
        });
    }

    bindEvents() {
        this.dom.translationSelect.addEventListener("change", (e) => this.loadTranslation(e.target.value));
        
        this.dom.bookSelect.addEventListener("change", (e) => {
            this.state.currentRefs = null;
            this.state.currentBook = e.target.value;
            this.fillChapters();
            this.state.currentChapter = 1;
            this.dom.chapterSelect.value = this.state.currentChapter;
            this.displayChapter(this.state.currentBook, this.state.currentChapter);
        });

        this.dom.chapterSelect.addEventListener("change", (e) => {
            this.state.currentRefs = null;
            this.state.currentChapter = parseInt(e.target.value);
            this.displayChapter(this.state.currentBook, this.state.currentChapter);
        });

        this.dom.refSubmit.addEventListener("click", () => this.applyReferenceInput());
        
        this.dom.referenceInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.applyReferenceInput();
            }
        });

        // Verse Selection Logic
        this.dom.textDisplay.addEventListener("click", (e) => {
            const verseSpan = e.target.closest(".verse-span");
            if (verseSpan) {
                this.handleVerseClick(verseSpan, e);
            } else if (!e.target.closest("#bibleActionMenu")) {
                this.clearSelection();
            }
        });
        
        // Hide menu on scroll
        window.addEventListener('scroll', () => {
            if(this.state.selection.size === 0) document.getElementById('bibleActionMenu').style.display = 'none';
        });
    }

    async loadTranslation(filename) {
        this.state.currentTranslation = filename;
        
        if (!this.state.bibleData[filename]) {
            try {
                const response = await fetch(`bibles/${filename}`);
                if (!response.ok) throw new Error("HTTP Error");
                const data = await response.json();
                this.state.bibleData[filename] = data;
                this.afterTranslationLoaded();
            } catch (err) {
                console.error(err);
                this.dom.textDisplay.innerHTML = `<p style="color: #800000;">Błąd: nie można wczytać tłumaczenia.</p>`;
            }
        } else {
            this.afterTranslationLoaded();
        }
    }

    afterTranslationLoaded() {
        const data = this.state.bibleData[this.state.currentTranslation];
        const books = Object.keys(data);
        
        // Sort books: defined order first, then others
        const orderedBooks = [
            ...Object.keys(this.BOOK_NAMES).filter(key => books.includes(key)),
            ...books.filter(key => !this.BOOK_NAMES[key])
        ];

        // Populate Book Select
        this.dom.bookSelect.innerHTML = "";
        orderedBooks.forEach(code => {
            const opt = document.createElement("option");
            opt.value = code;
            opt.textContent = this.BOOK_NAMES[code] || code;
            this.dom.bookSelect.appendChild(opt);
        });

        // Persist current book if possible, else default
        if (!this.state.currentBook || !data[this.state.currentBook]) {
            this.state.currentBook = data["Rdz"] ? "Rdz" : (books.length > 0 ? books[0] : null);
        }
        this.dom.bookSelect.value = this.state.currentBook;

        this.fillChapters();

        // Ensure valid chapter
        if (!this.state.currentChapter || !data[this.state.currentBook]?.[this.state.currentChapter]) {
            this.state.currentChapter = 1;
        }
        this.dom.chapterSelect.value = this.state.currentChapter;

        // Render view
        if (this.state.currentRefs) {
            this.displayReferences(this.state.currentRefs);
        } else {
            this.displayChapter(this.state.currentBook, this.state.currentChapter);
        }
    }

    fillChapters() {
        const data = this.state.bibleData[this.state.currentTranslation];
        this.dom.chapterSelect.innerHTML = "";
        
        if (!this.state.currentBook || !data[this.state.currentBook]) return;

        const chapNums = Object.keys(data[this.state.currentBook])
            .map(x => parseInt(x))
            .sort((a, b) => a - b);

        chapNums.forEach(ch => {
            const opt = document.createElement("option");
            opt.value = ch;
            opt.textContent = ch;
            this.dom.chapterSelect.appendChild(opt);
        });
    }

    displayChapter(book, chap) {
        const data = this.state.bibleData[this.state.currentTranslation];
        
        if (!data[book]) {
            this.dom.textDisplay.innerHTML = `<p>Brak księgi w tekście tego tłumaczenia.</p>`;
            return;
        }
        if (!data[book][chap]) {
            this.dom.textDisplay.innerHTML = `<p>Brak rozdziału w tekście tego tłumaczenia.</p>`;
            return;
        }

        const verses = data[book][chap];
        const nums = Object.keys(verses).map(x => parseInt(x)).sort((a, b) => a - b);
        
        const html = nums.map(v => this.buildVerseHTML(book, chap, v, verses[v])).join("");
        this.dom.textDisplay.innerHTML = `<div>${html.trim()}</div>`;
        
        this.renderNotesForCurrentView();
        this.clearSelection();
    }

    applyReferenceInput() {
        const input = this.dom.referenceInput.value.trim();
        if (!input) return;

        const parts = input.split(";");
        const refs = [];

        for (let part of parts) {
            let p = part.trim();
            if (!p) continue;

            // Normalize input
            p = p.replace(/\s+/g, " ")
                 .replace(/1 J/g, "1J")
                 .replace(/2 J/g, "2J")
                 .replace(/3 J/g, "3J");

            const idx = p.indexOf(" ");
            if (idx < 0) continue;

            const book = p.substring(0, idx);
            let rest = p.substring(idx + 1).replace(/\s/g, "").replace(/\./g, ",");

            let chapStart, verseStart, chapEnd, verseEnd;

            if (rest.includes("-")) {
                const [left, right] = rest.split("-");
                if (left.includes(",")) {
                    [chapStart, verseStart] = left.split(",");
                } else {
                    chapStart = left;
                }
                if (right.includes(",")) {
                    [chapEnd, verseEnd] = right.split(",");
                } else {
                    verseEnd = right;
                }
            } else {
                if (rest.includes(",")) {
                    [chapStart, verseStart] = rest.split(",");
                } else {
                    chapStart = rest;
                }
            }

            if (!chapStart) continue;

            chapStart = parseInt(chapStart);
            verseStart = verseStart !== undefined ? parseInt(verseStart) : undefined;
            chapEnd = chapEnd !== undefined ? parseInt(chapEnd) : undefined;
            verseEnd = verseEnd !== undefined ? parseInt(verseEnd) : undefined;

            if (!chapEnd) chapEnd = chapStart;
            if (!verseEnd) verseEnd = verseStart;

            refs.push({ book, chapStart, verseStart, chapEnd, verseEnd });
        }

        if (refs.length === 0) return;

        this.state.currentRefs = refs;
        
        // Update UI to match first reference
        const first = refs[0];
        if (this.state.bibleData[this.state.currentTranslation][first.book]) {
            this.state.currentBook = first.book;
            this.dom.bookSelect.value = this.state.currentBook;
            this.fillChapters();
        }
        this.state.currentChapter = first.chapStart;
        this.dom.chapterSelect.value = this.state.currentChapter;

        this.displayReferences(refs);
    }

    displayReferences(refs) {
        const data = this.state.bibleData[this.state.currentTranslation];
        let html = "";

        refs.forEach((ref, index) => {
            const { book, chapStart, verseStart, chapEnd, verseEnd } = ref;

            if (!data[book]) {
                html += `<p>Brak księgi ${book} w tekście tego tłumaczenia.</p>`;
                return;
            }
            if (!data[book][chapStart]) {
                html += `<p>Brak rozdziału ${chapStart} w księdze ${book}.</p>`;
                return;
            }

            for (let ch = chapStart; ch <= chapEnd; ch++) {
                if (!data[book][ch]) break;
                
                const verses = data[book][ch];
                const nums = Object.keys(verses).map(x => parseInt(x)).sort((a, b) => a - b);
                
                const start = (ch === chapStart && verseStart) ? verseStart : nums[0];
                const end = (ch === chapEnd && verseEnd) ? verseEnd : nums[nums.length - 1];

                nums.forEach(v => {
                    if (v >= start && v <= end) {
                        html += this.buildVerseHTML(book, ch, v, verses[v]);
                    }
                });
            }
            if (index < refs.length - 1) html += "<br><br>";
        });

        this.renderNotesForCurrentView();
        this.clearSelection();
        this.dom.textDisplay.innerHTML = `<div>${html.trim()}</div>`;
    }

    buildVerseHTML(book, chap, verseNum, text) {
        const refId = `${book}-${chap}-${verseNum}`;
        const highlightClass = this.state.userData.highlights[refId] || "";
        
        return `<span class="verse-span ${highlightClass}" data-ref="${refId}">
                    <sup class="verseNumber">${verseNum}</sup> ${text}
                </span> `;
    }

    handleVerseClick(target, event) {
        const ref = target.dataset.ref;
        
        if (this.state.selection.has(ref)) {
            this.state.selection.delete(ref);
            target.classList.remove('verse-selected');
        } else {
            this.state.selection.add(ref);
            target.classList.add('verse-selected');
        }

        this.updateActionMenu(event.clientX, event.clientY);
    }

    clearSelection() {
        this.state.selection.clear();
        document.querySelectorAll('.verse-selected').forEach(el => el.classList.remove('verse-selected'));
        document.getElementById('bibleActionMenu').style.display = 'none';
    }

    updateActionMenu(x, y) {
        const menu = document.getElementById('bibleActionMenu');
        if (this.state.selection.size > 0) {
            menu.style.display = 'flex';
            // Reset input area
            const inputArea = document.getElementById('noteInputArea');
            if (inputArea) inputArea.style.display = 'none';
            
            // Position near click, keep within bounds
            const menuWidth = 200; 
            let left = x + 10;
            let top = y + 10;
            
            if (left + menuWidth > window.innerWidth) left = x - menuWidth;
            
            menu.style.left = `${left}px`;
            menu.style.top = `${top}px`;
        } else {
            menu.style.display = 'none';
        }
    }

    applyHighlight(colorClass) {
        this.state.selection.forEach(ref => {
            // Remove existing highlight classes
            const el = document.querySelector(`.verse-span[data-ref="${ref}"]`);
            if (el) {
                ['hl-gold', 'hl-olive', 'hl-blue', 'hl-red', 'hl-purple'].forEach(c => el.classList.remove(c));
                el.classList.add(colorClass);
            }
            this.state.userData.highlights[ref] = colorClass;
        });
        this.clearSelection();
    }

    removeHighlight() {
        this.state.selection.forEach(ref => {
            const el = document.querySelector(`.verse-span[data-ref="${ref}"]`);
            if (el) {
                ['hl-gold', 'hl-olive', 'hl-blue', 'hl-red', 'hl-purple'].forEach(c => el.classList.remove(c));
            }
            delete this.state.userData.highlights[ref];
        });
        this.clearSelection();
    }

    saveNote(text) {
        if (!text.trim()) return;
        
        const ids = Array.from(this.state.selection).sort((a, b) => {
            const [, , vA] = a.split('-');
            const [, , vB] = b.split('-');
            return parseInt(vA) - parseInt(vB);
        });

        if (ids.length === 0) return;

        // Remove old notes for these verses
        this.state.userData.notes = this.state.userData.notes.filter(n => 
            !n.ids.some(id => ids.includes(id))
        );

        const noteObj = {
            id: Date.now().toString(),
            ids: ids,
            text: text,
            x: window.innerWidth - 250,
            y: 100 + (this.state.userData.notes.length * 30) % 500
        };

        this.state.userData.notes.push(noteObj);
        this.renderStickyNote(noteObj);
        this.clearSelection();
    }

    renderNotesForCurrentView() {
        // Remove existing notes
        document.querySelectorAll('.sticky-note').forEach(el => el.remove());

        // Find notes relevant to current view
        this.state.userData.notes.forEach(note => {
            const isVisible = note.ids.some(id => document.querySelector(`.verse-span[data-ref="${id}"]`));
            if (isVisible) {
                this.renderStickyNote(note);
            }
        });
    }

    renderStickyNote(note) {
        const div = document.createElement('div');
        div.className = 'sticky-note';
        div.dataset.noteId = note.id;
        div.style.left = (note.x !== undefined ? note.x : window.innerWidth - 250) + 'px';
        div.style.top = (note.y !== undefined ? note.y : 100) + 'px';

        const firstId = note.ids[0];
        const [book, chap, verse] = firstId.split('-');
        const bookName = this.BOOK_NAMES[book] || book;
        let refText = `${bookName} ${chap}:${verse}`;
        if (note.ids.length > 1) {
            const lastId = note.ids[note.ids.length - 1];
            const [, , lastVerse] = lastId.split('-');
            refText += `-${lastVerse}`;
        }

        div.innerHTML = `
            <div class="sticky-header">
                <span>${refText}</span>
                <span class="sticky-close">&times;</span>
            </div>
            <div class="sticky-content">${note.text}</div>
        `;

        div.querySelector('.sticky-close').onclick = () => this.deleteNote(note.id);
        document.body.appendChild(div);
        this.makeDraggable(div);
    }

    makeDraggable(el) {
        const header = el.querySelector('.sticky-header');
        let isDragging = false, startX, startY, initialLeft, initialTop;

        const onMouseDown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = el.offsetLeft;
            initialTop = el.offsetTop;
            el.style.zIndex = 1000;
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            el.style.left = (initialLeft + e.clientX - startX) + 'px';
            el.style.top = (initialTop + e.clientY - startY) + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                el.style.zIndex = 950;
                const note = this.state.userData.notes.find(n => n.id === el.dataset.noteId);
                if (note) {
                    note.x = parseInt(el.style.left);
                    note.y = parseInt(el.style.top);
                }
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            }
        };

        header.addEventListener('mousedown', onMouseDown);
    }

    deleteNote(id) {
        const idx = this.state.userData.notes.findIndex(n => n.id === id);
        if (idx > -1) {
            this.state.userData.notes.splice(idx, 1);
            const el = document.querySelector(`.sticky-note[data-note-id="${id}"]`);
            if (el) el.remove();
        }
    }
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    new BibleApp();
});
