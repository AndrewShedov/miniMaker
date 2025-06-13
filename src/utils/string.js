import { fisherYatesShuffle } from './index.js';

export const extractHashtags = (text) => {
    const matches = text.match(/#\w+/g);
    return matches ? [...new Set(matches.map(tag => tag.toLowerCase()))] : [];
};

export const cleanHashtag = (tag) => tag.replace(/\.$/, '');

export const word = (words) => fisherYatesShuffle(words)[0];