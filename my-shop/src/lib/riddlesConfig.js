// // src/lib/riddlesConfig.js

// /**
//  * @typedef {Object} RiddleConfig
//  * @property {number} id - Numer kafelka w Navbarze (1-12)
//  * @property {string} pageName - Dokładna nazwa podstrony (musi pasować do folderu i bazy)
//  * @property {string} correctPassword - PRAWIDŁOWE HASŁO DO TEJ ZAGADKI
//  */

// /**
//  * Centralny rejestr wszystkich 12 zagadek w sklepie.
//  * @type {RiddleConfig[]}
//  */
// //TODO WPROWADZIĆ SZYFROWANIE ODPOWIEDZI ORAZ ZABEZPIECZENIE ZWIĄZANE Z LOCAL STORAGE
// export const riddlesConfig = [
//     { id: 1, pageName: 'MessiOrRonaldo', correctPassword: 'love4games' },
//     { id: 2, pageName: 'love4games', correctPassword: 'MessiOrRonaldo' },
//     { id: 3, pageName: 'wiedzmin-sekret', correctPassword: 'geralt' },
//     { id: 4, pageName: 'cyber-kod', correctPassword: 'matrix' },
//     { id: 5, pageName: 'zagadka-5', correctPassword: 'haslo5' },
//     { id: 6, pageName: 'zagadka-6', correctPassword: 'haslo6' },
//     { id: 7, pageName: 'zagadka-7', correctPassword: 'haslo7' },
//     { id: 8, pageName: 'zagadka-8', correctPassword: 'haslo8' },
//     { id: 9, pageName: 'zagadka-9', correctPassword: 'haslo9' },
//     { id: 10, pageName: 'zagadka-10', correctPassword: 'haslo10' },
//     { id: 11, pageName: 'zagadka-11', correctPassword: 'haslo11' },
//     { id: 12, pageName: 'final-boss', correctPassword: 'halflife3' }
// ];

// src/lib/riddlesConfig.js

/**
 * @typedef {Object} RiddleConfig
 * @property {number} id - Numer kafelka w Navbarze (1-12)
 * @property {string} pageName - Nazwa podstrony (np. 'MessiOrRonaldo')
 * @property {string} correctPassword - Poprawne hasło
 * @property {any} targetProductId - ID gry w Waszej bazie Supabase (tekst lub liczba, zależnie od bazy)
 * @property {string} rewardName - Komunikat o odblokowanej promocji
 */

/**
 * Centralny rejestr wszystkich 12 zagadek i ukrytych promocji.
 * @type {RiddleConfig[]}
 */
export const riddlesConfig = [
    { 
        id: 1, 
        pageName: 'MessiOrRonaldo', 
        correctPassword: 'cr7', 
        targetProductId: 101, // Przykładowe ID produktu w bazie Supabase
        rewardName: '🔥 50 zł zniżki na grę Wiedźmin 4!' 
    },
    { 
        // Druga zagadka pod stroną love4games
        id: 2, 
        pageName: 'love4games', 
        correctPassword: 'gothicremake', 
        targetProductId: 102, 
        rewardName: '⚔️ Obniżkę ceny Gothic 1 Remake do 149.99 zł!' 
    }
    // ... uzupełniacie kolejne aż do 12
];