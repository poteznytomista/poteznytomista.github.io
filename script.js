// Lista dostępnych tłumaczeń (nazwa wyświetlana oraz plik JSON)
const translations = [
    { name: "Biblia Jakuba Wujka", file: "WUJ.json" },
    { name: "Vulgata Clementina", file: "VUL.json" },
    { name: "Nestle-Aland 1904", file: "NA1904.json" },
    { name: "Douay-Rheims Bible",  file: "DRA.json" }
    // W przyszłości można dodać kolejne tłumaczenia
];

// Mapowanie kodów ksiąg biblijnych na pełne nazwy (do wyboru)
const bookNames = {
        "Rdz": "Rodzaju",
        "Wj": "Wyjścia",
        "Kpł": "Kapłańska",
        "Lb": "Liczb",
        "Pwt": "Powtórzonego Prawa",
        "Joz": "Jozuego",
        "Sdz": "Sędziów",
        "Rt": "Rut",
        "1Sm": "I Królewska (I Samuela)",
        "2Sm": "II Królewska (II Samuela)",
        "1Krl": "III Królewska (I Królewska)",
        "2Krl": "IV Królewska (II Królewska)",
        "1Krn": "I Paralipomenon (I Kronik)",
        "2Krn": "II Paralipomenon (II Kronik)",
        "Ezd": "Ezdrasza",
        "Ne": "II Ezdrasza (Nehemiasza)",
        "Tb": "Tobiasza",
        "Jdt": "Judyty",
        "Est": "Estery",
        "1Mch": "I Machabejska",
        "2Mch": "II Machabejska",
        "Hi": "Joba (Hioba)",
        "Ps": "Psalmów",
        "Prz": "Przysłów (Przypowieści)",
        "Koh": "Eklezjastesa (Koheleta)",
        "Pnp": "Pieśń nad Pieśniami",
        "Mdr": "Mądrości",
        "Syr": "Eklezjastyk (Mądrość Syracha)",
        "Iz": "Izajasza",
        "Jr": "Jeremiasza",
        "Lm": "Treny (Lamentacje Jeremiasza)",
        "Ba": "Barucha",
        "Ez": "Ezechiela",
        "Dn": "Daniela",
        "Oz": "Ozeasza",
        "Jl": "Joela",
        "Am": "Amosa",
        "Ab": "Abdiasza",
        "Jon": "Jonasza",
        "Mi": "Micheasza",
        "Na": "Nahuma",
        "Ha": "Habakuka",
        "So": "Sofoniasza",
        "Ag": "Aggeusza",
        "Za": "Zachariasza",
        "Ml": "Malachiasza",
        "Mt": "Mateusza",
        "Mk": "Marka",
        "Łk": "Łukasza",
        "J": "Jana",
        "Dz": "Dzieje Apostolskie",
        "Rz": "Rzymian",
        "1Kor": "I Koryntian",
        "2Kor": "II Koryntian",
        "Ga": "Galatów",
        "Ef": "Efezjan",
        "Flp": "Filipian",
        "Kol": "Kolosan",
        "1Tes": "I Tesaloniczan",
        "2Tes": "II Tesaloniczan",
        "1Tm": "I Tymoteusza",
        "2Tm": "II Tymoteusza",
        "Tt": "Tytusa",
        "Flm": "Filemona",
        "Hbr": "Żydów (Hebrajczyków)",
        "Jk": "Jakuba",
        "1P": "I Piotra",
        "2P": "II Piotra",
        "1J": "I Jana",
        "2J": "II Jana",
        "3J": "III Jana",
        "Jud": "Judy",
        "Ap": "Apokalipsa św. Jana"
    // Można dodać więcej skrótów według potrzeb
};

// Stan aplikacji
let bibleData = {};      // pobrane teksty z JSON
let currentTranslation;  // aktualny plik tłumaczenia (np. "WUJ.json")
let currentBook = null;  // aktualnie wybrana księga (kod, np. "Rdz")
let currentChapter = 1;  // aktualny rozdział
let currentRefs = null;  // ostatnie ręcznie wpisane odwołanie (jeśli wystąpiło)

// Elementy DOM
let translationSelect, bookSelect, chapterSelect;
let referenceInput, refSubmit, textDisplay;

// Inicjalizacja po wczytaniu strony
window.addEventListener("DOMContentLoaded", () => {
    // pobranie referencji do elementów
    translationSelect = document.getElementById("translationSelect");
    bookSelect        = document.getElementById("bookSelect");
    chapterSelect     = document.getElementById("chapterSelect");
    referenceInput    = document.getElementById("referenceInput");
    refSubmit         = document.getElementById("refSubmit");
    textDisplay       = document.getElementById("textDisplay");

    // Wypełnienie listy tłumaczeń
    for (let tr of translations) {
        let opt = document.createElement("option");
        opt.value = tr.file;
        opt.textContent = tr.name;
        translationSelect.appendChild(opt);
    }
    // Wybór domyślnego tłumaczenia (pierwszy na liście)
    if (translations.length > 0) {
        translationSelect.value = translations[0].file;
        loadTranslation();
    }

    // Obsługa zdarzeń zmian wyboru i kliknięć
    translationSelect.addEventListener("change", loadTranslation);

    bookSelect.addEventListener("change", () => {
        // Po zmianie księgi: ustawiamy rozdział 1 i pokazujemy pierwszy werset
        currentRefs = null;  // wyłączamy tryb ręcznej referencji
        currentBook = bookSelect.value;
        fillChapters();
        currentChapter = 1;
        chapterSelect.value = currentChapter;
        displayChapter(currentBook, currentChapter);
    });

    chapterSelect.addEventListener("change", () => {
        // Po zmianie rozdziału: pokazujemy wskazany rozdział
        currentRefs = null;
        currentChapter = parseInt(chapterSelect.value);
        displayChapter(currentBook, currentChapter);
    });

    refSubmit.addEventListener("click", () => {
        applyReferenceInput();
    });
    // Wyszukiwanie z klawiatury Enter w polu input
    referenceInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyReferenceInput();
        }
    });
});

// Ładuje dane wybranego tłumaczenia (pobranie JSON)
function loadTranslation() {
    currentTranslation = translationSelect.value;
    if (!bibleData[currentTranslation]) {
        fetch("bibles/" + currentTranslation)
            .then(response => {
                if (!response.ok) throw new Error("Błąd HTTP");
                return response.json();
            })
            .then(data => {
                bibleData[currentTranslation] = data;
                afterTranslationLoaded();
            })
            .catch(err => {
                console.error(err);
                textDisplay.innerHTML = `<p>Błąd: nie można wczytać tłumaczenia.</p>`;
            });
    } else {
        afterTranslationLoaded();
    }
}

// Po załadowaniu danych tłumaczenia: wypełnienie list książek i rozdziałów
function afterTranslationLoaded() {
    let data = bibleData[currentTranslation];
    // Wypełniamy listę ksiąg dostępną w danych
    bookSelect.innerHTML = "";
    // Zachowujemy kolejność zdefiniowaną w bookNames, reszta (nieznane sigla) na końcu
let books = Object.keys(data);
let orderedBooks = [];

for (let key of Object.keys(bookNames)) {
    if (books.includes(key)) orderedBooks.push(key);
}
// dodajemy ewentualne brakujące księgi, które są w danych, ale nie w bookNames
for (let key of books) {
    if (!orderedBooks.includes(key)) orderedBooks.push(key);
}

// wypełniamy selecta w tej kolejności
bookSelect.innerHTML = "";
for (let code of orderedBooks) {
    let opt = document.createElement("option");
    opt.value = code;
    opt.textContent = bookNames[code] || code;
    bookSelect.appendChild(opt);
}

    // Ustawiamy bieżącą księgę:
    // Jeśli wcześniej wybrana jest dostępna w nowym tłumaczeniu, zostawiamy ją,
    // w przeciwnym razie staramy się wybrać "Rdz", a jeśli nie ma, to pierwszą na liście.
    if (currentBook && data[currentBook]) {
        // zachowujemy currentBook
    } else {
        if (data["Rdz"]) currentBook = "Rdz";
        else currentBook = books.length > 0 ? books[0] : null;
    }
    bookSelect.value = currentBook;
    // Wypełniamy listę rozdziałów i ustawiamy rozdział 1 lub poprzedni, jeśli istnieje
    fillChapters();
    if (!currentChapter || !data[currentBook] || !data[currentBook][currentChapter]) {
        currentChapter = 1;
    }
    chapterSelect.value = currentChapter;
    // Wyświetlamy tekst odpowiednio
    if (currentRefs) {
        // Jeśli mieliśmy wcześniej wpisane referencje, wczytujemy je ponownie
        displayReferences(currentRefs);
    } else {
        displayChapter(currentBook, currentChapter);
    }
}

// Wypełnia listę rozdziałów dla bieżącej księgi
function fillChapters() {
    let data = bibleData[currentTranslation];
    chapterSelect.innerHTML = "";
    if (!currentBook || !data[currentBook]) return;
    let chapNums = Object.keys(data[currentBook]).map(x => parseInt(x)).sort((a,b) => a-b);
    for (let ch of chapNums) {
        let opt = document.createElement("option");
        opt.value = ch;
        opt.textContent = ch;
        chapterSelect.appendChild(opt);
    }
}

// Wyświetla wybrany rozdział książki (ciągły tekst)
function displayChapter(book, chap) {
    let data = bibleData[currentTranslation];
    textDisplay.innerHTML = "";
    if (!data[book]) {
        textDisplay.innerHTML = `<p>Brak księgi w tekście tego tłumaczenia.</p>`;
        return;
    }
    if (!data[book][chap]) {
        textDisplay.innerHTML = `<p>Brak rozdziału w tekście tego tłumaczenia.</p>`;
        return;
    }

    let verses = data[book][chap];
    let nums = Object.keys(verses).map(x => parseInt(x)).sort((a,b) => a-b);

    let html = "";
    for (let v of nums) {
        let verseText = verses[v];
        html += `<sup class="verseNumber">${v}</sup> ${verseText} `;
    }

    // Wrzuć wszystko jako jeden ciągły tekst
    textDisplay.innerHTML = `<div>${html.trim()}</div>`;
}

// Parsuje i wyświetla wpisaną przez użytkownika sygnaturę/zakres(y)
function applyReferenceInput() {
    let input = referenceInput.value.trim();
    if (!input) return;
    let parts = input.split(";");
    let refs = [];
    for (let part of parts) {
        let p = part.trim();
        if (!p) continue;
        // Normalizacja (np. "1 J" -> "1J")
        p = p.replace(/\s+/g, " ");
        p = p.replace(/1 J/g, "1J").replace(/2 J/g, "2J").replace(/3 J/g, "3J");
        let idx = p.indexOf(" ");
        if (idx < 0) continue;
        let book = p.substring(0, idx);
        let rest = p.substring(idx+1).replace(/\s/g, "");
        rest = rest.replace(/\./g, ","); // kropkę traktujemy jako przecinek
        let chapStart, verseStart, chapEnd, verseEnd;
        if (rest.includes("-")) {
            let [left, right] = rest.split("-");
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
        chapEnd   = chapEnd   !== undefined ? parseInt(chapEnd)   : undefined;
        verseEnd  = verseEnd  !== undefined ? parseInt(verseEnd)  : undefined;
        if (!chapEnd)   chapEnd   = chapStart;
        if (!verseEnd)  verseEnd  = verseStart;
        refs.push({ book, chapStart, verseStart, chapEnd, verseEnd });
    }
    if (refs.length === 0) return;
    currentRefs = refs;
    // Ustawiamy UI według pierwszej referencji
    let first = refs[0];
    if (bibleData[currentTranslation][first.book]) {
        currentBook = first.book;
        bookSelect.value = currentBook;
        fillChapters();
    }
    currentChapter = first.chapStart;
    chapterSelect.value = currentChapter;
    displayReferences(refs);
}

// Wyświetla tekst odpowiadający liście referencji (ciągły tekst)
function displayReferences(refs) {
    let data = bibleData[currentTranslation];
    textDisplay.innerHTML = "";
    let html = "";

    for (let i = 0; i < refs.length; i++) {
        let { book, chapStart, verseStart, chapEnd, verseEnd } = refs[i];
        if (!data[book]) {
            html += `<p>Brak księgi ${book} w tekście tego tłumaczenia.</p>`;
            continue;
        }
        if (!data[book][chapStart]) {
            html += `<p>Brak rozdziału ${chapStart} w księdze ${book} w tym tłumaczeniu.</p>`;
            continue;
        }

        // Iteracja po rozdziałach (dla zakresów)
        for (let ch = chapStart; ch <= chapEnd; ch++) {
            if (!data[book][ch]) break;
            let verses = data[book][ch];
            let nums = Object.keys(verses).map(x => parseInt(x)).sort((a,b) => a-b);
            let start = (ch === chapStart && verseStart) ? verseStart : nums[0];
            let end   = (ch === chapEnd   && verseEnd)   ? verseEnd   : nums[nums.length-1];
            for (let v of nums) {
                if (v < start) continue;
                if (v > end) break;
                html += `<sup class="verseNumber">${v}</sup> ${verses[v]} `;
            }
        }
        if (i < refs.length - 1) html += "<br><br>";
    }

    textDisplay.innerHTML = `<div>${html.trim()}</div>`;
}
