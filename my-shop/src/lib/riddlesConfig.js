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
        correctPassword: 'love4games', 
        targetProductId: 101, 
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    { 
        // Druga zagadka pod stroną love4games
        id: 2, 
        pageName: 'love4games', 
        correctPassword: 'MessiOrRonaldo', 
        targetProductId: 101, 
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 3,
        pageName: 'szym1',
        correctPassword: 'Novigrad', 
        targetProductId: 101,              
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 4,
        pageName: 'szym2',
        correctPassword: 'NieznoszePortali', 
        targetProductId: 101,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 5,
        pageName: 'LoginMystery1',
        correctPassword: 'bit.ly/arg02', 
        targetProductId: 101,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 6,
        pageName: 'LoginMystery2',
        correctPassword: 'bit.ly/arg01', 
        targetProductId: 101,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 7,
        pageName: 'zagadki/4',
        correctPassword: '6721', 
        targetProductId: 101,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    },
    {
        id: 8,
        pageName: 'zagadki/9',
        correctPassword: '0701', 
        targetProductId: 101,                     
        rewardName: 'Wiedźmin 3 z 99.99 zł na 50 zł!'
    }
];