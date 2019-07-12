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

const fs        = require('fs');
const util      = require('util');
const xml       = require('xml');
const DOMParser = require('xmldom').DOMParser;

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

        let sanskritSentence = '';
        let indonesiSentence = '';

        if ((sanSentenceText = sentences[sentence].getElementsByTagName('sanskrit')[0].firstChild) !== null) {
          sanskritSentence = sanSentenceText.nodeValue;
        }

        if ((indSentenceText = sentences[sentence].getElementsByTagName('indonesian')[0].firstChild) !== null) {
          indonesiSentence = indSentenceText.nodeValue;
        }

        const {_logString, _sanskritSentence, _indonesiSentence} = clearNoise(i, slokaNumber, sanskritSentence, indonesiSentence);

        logString += _logString;
      }
    }

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
  var logString = ''

  sanskritSentence.replace(/\((.*?)\)/g, '');
  indonesiSentence.replace(/\((.*?)\)/g, '');

/* 
  if (slokaNumber == ' ') {
    console.log(`FOUND ON chapter ${i}`);
    console.log('sanskrit', sanskritSentence);
    console.log('indonesia', indonesiSentence);
    console.log('\n');
    console.log('\n');
  }
 */

  if (!sanskritSentence) {
    logString += `EMPTY SENTENCE FOUND: Chapter ${chapter} Sloka ${slokaNumber} in <SANSKRIT>\n`;
  }

  if (!indonesiSentence) {
    logString += `EMPTY SENTENCE FOUND: Chapter ${chapter} Sloka ${slokaNumber} in <INDONESIAN>\n`;
  }

  return {_logString: logString, _sanskritSentence: sanskritSentence, _indonesiSentence: indonesiSentence};
}

main(function(log) {
  let logger = fs.createWriteStream('./log/clean_merging_log');

  logger.write(log);
  logger.end();
  return;
});