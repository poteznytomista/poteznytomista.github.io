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
        'Genesis': '01_Rdz',
        'Exodus': '02_Wj',
        'Leviticus': '03_Kpł',
        'Numeri': '04_Lb',
        'Deuteronomium': '05_Pwt',
        'Jozue': '06_Joz',
        'Sędziowie': '07_Sdz',
        'Ruth': '08_Rt',
        'Królewskie Pierwsze': '09_1Sm',
        'Królewskie Wtóre': '10_2Sm',
        'Królewskie Trzecie': '11_1Krl',
        'Królewskie Czwarte': '12_2Krl',
        'Paralipomenon Pierwsze': '13_1Krn',
        'Paralipomenon Wtóre': '14_2Krn',
        'Księgi Psalmów': '21_Ps',
        'Według Mateusza': '47_Mt',
        'Według Marka': '48_Mk',
        'Według Łukasza': '49_Łk',
        'Według Jana': '50_J',
        'Dzieje Apostolskie': '51_Dz',
        'Do Rzymian': '52_Rz',
        'Do Korynthów Pierwszy': '53_1Kor',
        'Do Korynthów Wtóry': '54_2Kor',
        'Do Galatów': '55_Ga',
        'Do Ephezów': '56_Ef',
        'Do Philippensów': '57_Flp',
        'Do Kolossan': '58_Kol',
        'Do Thessaloniczan Pierwszy': '59_1Tes',
        'Do Thessaloniczan Wtóry': '60_2Tes',
        'Do Tymotheusza Pierwszy': '61_1Tm',
        'Do Tymotheusza Wtóry': '62_2Tm',
        'Do Tytusa': '63_Tt',
        'Do Philemona': '64_Fil',
        'Do Żydów': '65_Hbr',
        'S. Jakóba Apostoła': '66_Jk',
        'S. Piotra Pierwszy': '67_1P',
        'S. Piotra Wtóry': '68_2P',
        'S. Jana Pierwszy': '69_1J',
        'S. Jana Wtóry': '70_2J',
        'S. Jana Trzeci': '71_3J',
        'S. Judasa Apostoła': '72_Jud',
        'Objawienie Jana S.': '73_Ap',
        'Ezdraszowe Trzecie': '76_3Ezd',
        'Modlitwa Manassesa': '75_Mns'
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
    const books = ['Genesis', 'Exodus', 'Leviticus', 'Numeri', 'Deuteronomium', 'Jozue', 'Sędziowie', 'Ruth', 'Królewskie Pierwsze', 'Królewskie Wtóre', 'Królewskie Trzecie', 'Królewskie Czwarte', 'Paralipomenon Pierwsze', 'Paralipomenon Wtóre', 'Księgi Psalmów', '--------------', 'Ezdraszowe Trzecie', 'Modlitwa Manassesa', '--------------', 'Według Mateusza', 'Według Marka', 'Według Łukasza', 'Według Jana', 'Dzieje Apostolskie', 'Do Rzymian', 'Do Korynthów Pierwszy', 'Do Korynthów Wtóry', 'Do Galatów', 'Do Ephezów', 'Do Philippensów', 'Do Kolossan', 'Do Thessaloniczan Pierwszy', 'Do Thessaloniczan Wtóry', 'Do Tymotheusza Pierwszy', 'Do Tymotheusza Wtóry', 'Do Tytusa', 'Do Philemona', 'Do Żydów', 'S. Jakóba Apostoła', 'S. Piotra Pierwszy', 'S. Piotra Wtóry', 'S. Jana Pierwszy', 'S. Jana Wtóry', 'S. Jana Trzeci', 'S. Judasa Apostoła', 'Objawienie Jana S.'/* Add all other books here */];
    
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
        'Genesis': '01_Rdz',
        'Exodus': '02_Wj',
        'Leviticus': '03_Kpł',
        'Numeri': '04_Lb',
        'Deuteronomium': '05_Pwt',
        'Jozue': '06_Joz',
        'Sędziowie': '07_Sdz',
        'Ruth': '08_Rt',
        'Królewskie Pierwsze': '09_1Sm',
        'Królewskie Wtóre': '10_2Sm',
        'Królewskie Trzecie': '11_1Krl',
        'Królewskie Czwarte': '12_2Krl',
        'Paralipomenon Pierwsze': '13_1Krn',
        'Paralipomenon Wtóre': '14_2Krn',
        'Księgi Psalmów': '21_Ps',
        'Według Mateusza': '47_Mt',
        'Według Marka': '48_Mk',
        'Według Łukasza': '49_Łk',
        'Według Jana': '50_J',
        'Dzieje Apostolskie': '51_Dz',
        'Do Rzymian': '52_Rz',
        'Do Korynthów Pierwszy': '53_1Kor',
        'Do Korynthów Wtóry': '54_2Kor',
        'Do Galatów': '55_Ga',
        'Do Ephezów': '56_Ef',
        'Do Philippensów': '57_Flp',
        'Do Kolossan': '58_Kol',
        'Do Thessaloniczan Pierwszy': '59_1Tes',
        'Do Thessaloniczan Wtóry': '60_2Tes',
        'Do Tymotheusza Pierwszy': '61_1Tm',
        'Do Tymotheusza Wtóry': '62_2Tm',
        'Do Tytusa': '63_Tt',
        'Do Philemona': '64_Fil',
        'Do Żydów': '65_Hbr',
        'S. Jakóba Apostoła': '66_Jk',
        'S. Piotra Pierwszy': '67_1P',
        'S. Piotra Wtóry': '68_2P',
        'S. Jana Pierwszy': '69_1J',
        'S. Jana Wtóry': '70_2J',
        'S. Jana Trzeci': '71_3J',
        'S. Judasa Apostoła': '72_Jud',
        'Objawienie Jana S.': '73_Ap',
        'Ezdraszowe Trzecie': '76_3Ezd',
        'Modlitwa Manassesa': '75_Mns'
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

