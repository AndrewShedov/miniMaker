import fs from 'fs';
import path from 'path';
import { randomBytes } from "node:crypto";
import {
  int, pick, extractHashtags, cleanHashtag, word, fisherYatesShuffle
} from './helpers/utils.js';

// path to custom - mini-maker-storage.json
const dataPath = path.resolve(process.cwd(), 'src/utils/mini-maker/mini-maker-storage.json');
// path to custom - mini-maker-storage.json

if (!fs.existsSync(dataPath)) {
  throw new Error(`[mini-maker] storage file not found at ${dataPath}. Please create it manually.`);
}

const storage = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const getByPath = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

// One sentence generator
const sentence = ({ wordMin = 4, wordMax = 10, hashtagMin = 0, hashtagMax = 2 }) => {
  const wordsCount = int({ min: wordMin, max: wordMax });
  const sentenceWords = Array.from({ length: wordsCount }, () => word(storage.words));
  const availableTags = [...new Set(storage.hashtags)];
  const shuffledTags = fisherYatesShuffle(availableTags);
  const hashtagsCount = Math.min(int({ min: hashtagMin, max: hashtagMax }), availableTags.length);
  const hashtagsSet = new Set();
  shuffledTags.slice(0, hashtagsCount).forEach(tag => hashtagsSet.add(tag));

  const hashtags = Array.from(hashtagsSet);
  for (let tag of hashtags) {
    const index = int({ min: 0, max: sentenceWords.length });
    sentenceWords.splice(index, 0, tag);
  }

  const firstWord = sentenceWords[0];
  if (!firstWord.startsWith("#")) {
    sentenceWords[0] = firstWord[0].toUpperCase() + firstWord.slice(1);
  } else {
    const tag = firstWord.slice(1);
    sentenceWords[0] = "#" + tag[0].toUpperCase() + tag.slice(1);
  }

  const lastWord = sentenceWords[sentenceWords.length - 1];
  return lastWord.startsWith("#")
    ? sentenceWords.join(" ") + "."
    : sentenceWords.join(" ") + ".";
};
// /one sentence generator

// text generator from sentences
const sentences = ({ min = 1, max = 5, wordMin = 4, wordMax = 10, hashtagMin = 0, hashtagMax = 2 }) => {
  const count = int({ min, max });
  return Array.from({ length: count }, () =>
    sentence({ wordMin, wordMax, hashtagMin, hashtagMax })
  ).join(' ');
};
// /text generator from sentences

// generate text block
const generateTextBlock = (params) => {
  const text = sentences(params);
  return { text, hashtags: extractHashtags(text) };
};
// /generate text block

// full text with hashtags
const fullText = {
  title: { sentences: generateTextBlock },
  text: { sentences: generateTextBlock },
  generate: ({ titleOptions, textOptions }) => {
    const titleData = generateTextBlock(titleOptions);
    const textData = generateTextBlock(textOptions);
    const allHashtags = [...new Set([
      ...titleData.hashtags.map(cleanHashtag),
      ...textData.hashtags.map(cleanHashtag)
    ])];
    return {
      title: titleData.text,
      text: textData.text,
      hashtagsFromFullText: allHashtags
    };
  }
};
// /full text with hashtags

const emailRandom = () => `${randomBytes(14).toString("hex")}@gmail.com`;

const value = (value = {}) => {
  const storageKey = value.key ?? 'objectsIdUsers';
  const storageArray = getByPath(storage, storageKey) ?? [];

  if (!Array.isArray(storageArray) || storageArray.length === 0) return [];

  const min = value.min ?? 0;
  const max = Math.min(value.max ?? storageArray.length, storageArray.length);
  const duplicate = value.duplicate || false;
  const count = int({ min, max });

  if (duplicate) {
    const picked = Array.from({ length: count }, () => pick(storageArray));
    return value.reverse ? picked.reverse() : picked;
  }

  const shuffled = fisherYatesShuffle(storageArray);
  const sliced = shuffled.slice(0, count);
  return value.reverse ? sliced.reverse() : sliced;
};

const valueOne = (value = {}) => {
  const storageKey = value.key ?? 'objectsIdUsers';
  const storageArray = getByPath(storage, storageKey) ?? [];
  if (!Array.isArray(storageArray) || storageArray.length === 0) return null;

  const shuffled = fisherYatesShuffle(storageArray);
  return value.fromEnd ? shuffled.at(-1) : shuffled[0];
};

const miniMaker = {
  lorem: {
    word: () => word(storage.words),
    sentences,
    fullText
  },
  emailRandom,
  number: { int },
  take: {
    value,
    valueOne
  }
};

export { miniMaker, storage };
