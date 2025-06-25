document.addEventListener('DOMContentLoaded', () => {
    const books = {
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
        // Add more mappings as needed
    };

    let bibleData = {};

    const translationSelect = document.getElementById('translation-select');
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const verseInput = document.getElementById('verse-input');
    const fetchVerseButton = document.getElementById('fetch-verse');
    const outputField = document.getElementById('output-field');

    // Load JSON file dynamically based on translation
    function loadTranslation(translation) {
        fetch(`${translation}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load translation');
                }
                return response.json();
            })
            .then(data => {
                bibleData = data;
                populateBooks();
            })
            .catch(error => {
                console.error(error);
                outputField.textContent = 'Error loading translation.';
            });
    }

    // Populate book dropdown
    function populateBooks() {
        bookSelect.innerHTML = '';
        Object.keys(books).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = books[key];
            bookSelect.appendChild(option);
        });
        chapterSelect.innerHTML = ''; // Clear chapters
    }

    // Populate chapter dropdown dynamically
    bookSelect.addEventListener('change', () => {
        const selectedBook = bookSelect.value;
        chapterSelect.innerHTML = ''; // Clear previous options

        if (bibleData[selectedBook]) {
            const chapters = Object.keys(bibleData[selectedBook]);
            chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = `Chapter ${chapter}`;
                chapterSelect.appendChild(option);
            });
        }
    });

    // Fetch and display a specific verse
    fetchVerseButton.addEventListener('click', () => {
        const input = verseInput.value.trim();
        const match = input.match(/^([1-3]?[A-Za-z]+)\s(\d+),(\d+)$/);

        if (match) {
            const bookKey = match[1];
            const chapter = match[2];
            const verse = match[3];

            if (bibleData[bookKey] && bibleData[bookKey][chapter] && bibleData[bookKey][chapter][verse]) {
                outputField.innerHTML = `<sup>${verse}</sup> ${bibleData[bookKey][chapter][verse]}`;
            } else {
                outputField.textContent = 'Verse not found.';
            }
        } else {
            outputField.textContent = 'Invalid input format. Use Book Chapter,Verse (e.g., J 3,16).';
        }
    });

    // Display entire chapter
    chapterSelect.addEventListener('change', () => {
        const selectedBook = bookSelect.value;
        const selectedChapter = chapterSelect.value;

        if (bibleData[selectedBook] && bibleData[selectedBook][selectedChapter]) {
            const verses = bibleData[selectedBook][selectedChapter];
            outputField.innerHTML = Object.keys(verses)
                .map(verse => `<span class='verse'><sup>${verse}</sup> ${verses[verse]}</span>`)
                .join(' ');
        } else {
            outputField.textContent = 'Chapter not found.';
        }
    });

    // Change translation
    translationSelect.addEventListener('change', () => {
        const selectedTranslation = translationSelect.value;
        loadTranslation(selectedTranslation);
    });

    // Initial load
    if (translationSelect.value) {
        loadTranslation(translationSelect.value);
    }
});
