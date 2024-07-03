const githubRepo = 'https://api.github.com/repos/p-o-t-a-t-o-g-a-m-i-n-g/Biblia-Jakuba-Wujka-/contents/ksiegi/';

async function fetchFileList(bookFolder) {
    const url = `${githubRepo}${bookFolder}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (Array.isArray(data)) {
            return data.map(file => file.name);
        } else {
            console.error('Invalid data format:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching file list:', error);
        return [];
    }
}

async function loadBibleVerses(book, chapter) {
    const bookMapping = {
        'Rodzaju': '01_Rdz',
        'Wyjścia': '02_Wj',
        'Kapłańska': '03_Kpł',
        'Liczb': '04_Lb',
        'Deuteronomium': '05_Pwt',
        'Jozuego': '06_Joz',
        'Psalmów': '23_Ps',
        'Mateusza': '47_Mt',
        'Marka': '48_Mk',
        'Łukasza': '49_Łk',
        'Jana': '50_J',
        'Dziejów': '51_Dz',
        'Rzymian': '52_Rz',
        'Jakuba': '66_Jk',
        '1 Piotra': '67_1P',
        '2 Piotra': '68_2P',
        'Objawienie': '73_Ap'
        // Add mappings for all other books
    };

    const bookFolder = bookMapping[book];
    if (!bookFolder) {
        console.error('Book not found in mapping');
        return null;
    }

    const chapterPadded = chapter.padStart(2, '0');
    const fileUrls = [
        `https://raw.githubusercontent.com/p-o-t-a-t-o-g-a-m-i-n-g/Biblia-Jakuba-Wujka-/main/ksiegi/${bookFolder}/${chapterPadded}.txt`,
        `https://raw.githubusercontent.com/p-o-t-a-t-o-g-a-m-i-n-g/Biblia-Jakuba-Wujka-/main/ksiegi/${bookFolder}/${chapterPadded}`
    ];

    for (const fileUrl of fileUrls) {
        try {
            const response = await fetch(fileUrl);
            if (response.ok) {
                const text = await response.text();
                const verses = text.split('\n').reduce((acc, line, index) => {
                    acc[index + 1] = line;
                    return acc;
                }, {});
                return { [book]: { [chapter]: verses } };
            }
        } catch (error) {
            console.error('Error loading Bible verses:', error);
        }
    }
    console.error('Failed to load Bible verses from any source');
    return null;
}

async function populateBooks() {
    const bookSelect = document.getElementById('book-select');
    const books = ['Rodzaju', 'Wyjścia', 'Kapłańska', 'Liczb', 'Deuteronomium', 'Jozuego', 'Psalmów', 'Mateusza', 'Marka', 'Łukasza', 'Jana', 'Dziejów', 'Rzymian', 'Jakuba', '1 Piotra', '2 Piotra', 'Objawienie'/* Add all other books here */];
    
    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book;
        option.textContent = book;
        bookSelect.appendChild(option);
    });
}

async function populateChapters() {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    chapterSelect.innerHTML = '<option value="">--Wybierz Rozdział--</option>';

    const selectedBook = bookSelect.value;
    const bookMapping = {
        'Rodzaju': '01_Rdz',
        'Wyjścia': '02_Wj',
        'Kapłańska': '03_Kpł',
        'Liczb': '04_Lb',
        'Deuteronomium': '05_Pwt',
        'Jozuego': '06_Joz',
        'Psalmów': '23_Ps',
        'Mateusza': '47_Mt',
        'Marka': '48_Mk',
        'Łukasza': '49_Łk',
        'Jana': '50_J',
        'Dziejów': '51_Dz',
        'Rzymian': '52_Rz',
        'Jakuba': '66_Jk',
        '1 Piotra': '67_1P',
        '2 Piotra': '68_2P',
        'Objawienie': '73_Ap'
        // Add mappings for all other books
    };

    const bookFolder = bookMapping[selectedBook];
    if (!bookFolder) {
        console.error('Book not found in mapping');
        return;
    }

    const fileList = await fetchFileList(bookFolder);
    const chapters = fileList.map(file => {
        const chapterNumber = file.replace('.txt', '');
        return parseInt(chapterNumber);
    }).filter(chapter => !isNaN(chapter)).sort((a, b) => a - b);

    chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter.toString();
        option.textContent = chapter.toString();
        chapterSelect.appendChild(option);
    });
}

async function showVerses() {
    const input = document.getElementById('verse-input').value;
    const verses = parseInput(input);
    const display = document.getElementById('verse-display');
    display.innerHTML = '';

    let previousBook = '';
    let previousChapter = '';

    for (const verse of verses) {
        const bibleVerses = await loadBibleVerses(verse.book, verse.chapter);
        if (!bibleVerses) {
            display.innerHTML = 'Failed to load Bible verses. Please try again later.';
            return;
        }

        const verseText = getVerseText(bibleVerses, verse.book, verse.chapter, verse.verse);
        if (verseText) {
            if (verse.book !== previousBook || verse.chapter !== previousChapter) {
                display.innerHTML += `<h3>${verse.book} ${verse.chapter}</h3>`;
                previousBook = verse.book;
                previousChapter = verse.chapter;
            }
            display.innerHTML += `<span class="verse-number">${verse.verse}</span> ${verseText} `;
        }
    }
}

async function showSelectedVerse() {
    const bookSelect = document.getElementById('book-select').value;
    const chapterSelect = document.getElementById('chapter-select').value;
    const display = document.getElementById('verse-display');
    display.innerHTML = '';

    if (!bookSelect || !chapterSelect) {
        display.innerHTML = 'Please select both a book and a chapter.';
        return;
    }

    const bibleVerses = await loadBibleVerses(bookSelect, chapterSelect);
    if (!bibleVerses) {
        display.innerHTML = 'Failed to load Bible verses. Please try again later.';
        return;
    }

    const verses = bibleVerses[bookSelect][chapterSelect];
    if (verses) {
        display.innerHTML += `<h3>${bookSelect} ${chapterSelect}</h3>`;
        for (const verse in verses) {
            display.innerHTML += `<span class="verse-number">${verse}</span> ${verses[verse]} `;
        }
    } else {
        display.innerHTML = 'No verses found for the selected chapter.';
    }
}

function parseInput(input) {
    const verseList = [];
    const parts = input.split(',');

    parts.forEach(part => {
        const [book, ranges] = part.trim().split(' ');
        const [chapter, verseRanges] = ranges.split(':');

        verseRanges.split(',').forEach(range => {
            const [start, end] = range.split('-');
            if (end) {
                for (let i = parseInt(start); i <= parseInt(end); i++) {
                    verseList.push({ book, chapter, verse: i.toString() });
                }
            } else {
                verseList.push({ book, chapter, verse: start });
            }
        });
    });

    return verseList;
}

function getVerseText(bibleVerses, book, chapter, verse) {
    if (bibleVerses[book] && bibleVerses[book][chapter] && bibleVerses[book][chapter][verse]) {
        return bibleVerses[book][chapter][verse];
    } else {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', populateBooks);
