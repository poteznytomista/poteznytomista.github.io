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
            currentRefs: null
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

        if (this.TRANSLATIONS.length > 0) {
            this.dom.translationSelect.value = this.TRANSLATIONS[0].file;
            this.loadTranslation(this.TRANSLATIONS[0].file);
        }
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
        
        const html = nums.map(v => `<sup class="verseNumber">${v}</sup> ${verses[v]} `).join("");
        this.dom.textDisplay.innerHTML = `<div>${html.trim()}</div>`;
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
                        html += `<sup class="verseNumber">${v}</sup> ${verses[v]} `;
                    }
                });
            }
            if (index < refs.length - 1) html += "<br><br>";
        });

        this.dom.textDisplay.innerHTML = `<div>${html.trim()}</div>`;
    }
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    new BibleApp();
});
