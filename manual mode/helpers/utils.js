export const fisherYatesShuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const int = ({ min = 0, max }) => Math.floor(Math.random() * (max - min + 1)) + min;

export const pick = (array) => array[Math.floor(Math.random() * array.length)];

export const extractHashtags = (text) => {
    const matches = text.match(/#\w+/g);
    return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
};

export const cleanHashtag = (tag) => tag.replace(/\.$/, '');

export const word = (words) => fisherYatesShuffle(words)[0];
