/* 
*************************************************************
cleaning Bilingual Corpus of Sanskrit-Indonesian
=============================================================


written by: Dwi Prasetya Putra @prasetyaputraa
last updated: 2019-07-11 12:06:58 GMT+8


Description:
------------
self descriptive

*************************************************************
 */

const fs            = require('fs');
const util          = require('util');
const helper        = require('./helper');
const xml           = require('xml');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

const readFile = util.promisify(fs.readFile);

/**
 * ! MAIN FUNCTION
 * ! -------------
 * 
 * @param {Function} callback function callback
 */
function main(callback) {
  let logString = '';

  for (let i = 1; i <= 18; i++) {
    let root = xml.element();

    let data = fs.readFileSync(`./raw_sentences_sanskrit_indonesian/raw_sentences_merged_bab${i}.xml`, 'utf8');

    let xmlData   = new DOMParser().parseFromString(data, 'text/xml');
    let sentences = xmlData.documentElement.getElementsByTagName('sentences');

    for (sentence in sentences) {
      if (typeof sentences[sentence].getAttribute !== 'undefined') {
        let slokaNumber = sentences[sentence].getAttribute('sloka');

        let _sanskritSentence = '';
        let _indonesiSentence = '';

        if ((sanSentenceText = sentences[sentence].getElementsByTagName('sanskrit')[0].firstChild) !== null) {
          _sanskritSentence = sanSentenceText.nodeValue;
        }

        if ((indSentenceText = sentences[sentence].getElementsByTagName('indonesian')[0].firstChild) !== null) {
          _indonesiSentence = indSentenceText.nodeValue;
        }

        let {_logString, sanskritSentence, indonesiSentence} = clearNoise(i, slokaNumber, _sanskritSentence, _indonesiSentence);

        let {sanskritWords, indonesiWords} = getWordCount(sanskritSentence, indonesiSentence);

        let sanskritWordCount = sanskritWords !== null ? sanskritWords.length : 0;
        let indonesiWordCount = indonesiWords !== null ? indonesiWords.length : 0;
        let wordsCountDiff    = sanskritWordCount - indonesiWordCount;

        let newData = {
          'wordDiff'         : wordsCountDiff,
          'sanskritSentence' : sanskritSentence,
          'indonesiSentence' : indonesiSentence,
          'sanskritWordCount': sanskritWordCount,
          'indonesiWordCount': indonesiWordCount
        };

        if (slokaNumber !== '') {
          let newNode = updateSentence(sentences[sentence], newData);

          xmlData.documentElement.replaceChild(newNode, sentence[sentence]);
        }

        logString += _logString;
      }
    }

    let xmlString = new XMLSerializer().serializeToString(xmlData);

    fs.writeFile(`./clean_sentences_sanskrit_indonesian/clean_merged_bab${i}.xml`, xmlString, 'utf-8', (err, data) => {
      console.log(`done for file: ${i}`);
    });
  }

  callback(logString);
}

/**
 * ! NOISE CLEANSING
 * ! ---------------
 * 
 * | 1st step: cleans from '(this kind of optional meaning words)'
 * ? ex: maddhusudana (pembunuh raksasa madhu)
 * * this should be useful later to make
 * * another dictionary of synonims
 * 
 * @param {int} chapter current chapter
 * @param {string | int} slokaNumber current sloka number being processed
 * @param {string} sanskritSentence current sloka's string of sanskrit
 * @param {string} indonesiSentence current sloka's string of indoensia
 */
function clearNoise(chapter, slokaNumber, sanskritSentence, indonesiSentence) {
  var _logString = '';

  _sanskritSentence = sanskritSentence.replace(/\((.*?)\)/g, '');
  _indonesiSentence = indonesiSentence.replace(/\((.*?)\)/g, '');

  if (!_sanskritSentence) {
    _logString += `[101] EMPTY SENTENCE FOUND: Chapter ${chapter} Sloka ${slokaNumber} in <SANSKRIT>\n`;
  }

  if (!_indonesiSentence) {
    _logString += `[102] EMPTY SENTENCE FOUND: Chapter ${chapter} Sloka ${slokaNumber} in <INDONESIAN>\n`;
  }

  if (helper.getNoiseSlokaNumber(_sanskritSentence)) {
    _logString += `[201] SLOKA NUMBER NOISE FOUND: Chapter ${chapter} Sloka ${slokaNumber} in <SANSKRIT>\n`;
  }

  return {_logString: _logString, sanskritSentence: _sanskritSentence, indonesiSentence: _indonesiSentence};
}

function getWordCount(sanskritSentence, indonesiSentence) {
  let _sanskritWords = sanskritSentence.match(/\s+/g);
  let _indonesiWords = indonesiSentence.match(/\s+/g);

  return {sanskritWords: _sanskritWords, indonesiWords: _indonesiWords};
}

function updateSentence(tag, newProps) {
  let newTag = tag;

  newTag.setAttribute('word-difference', newProps.wordDiff);

  newTag.getElementsByTagName('sanskrit')[0].textContent   = newProps.sanskritSentence;
  newTag.getElementsByTagName('indonesian')[0].textContent = newProps.indonesiSentence;

  newTag.getElementsByTagName('sanskrit')[0].setAttribute('count', newProps.sanskritWordCount);
  newTag.getElementsByTagName('indonesian')[0].setAttribute('count', newProps.indonesiWordCount);

  return newTag;
}

main(function(log) {
  let logger = fs.createWriteStream('./log/clean_merging_log');

  logger.write(log);
  logger.end();
  return;
});