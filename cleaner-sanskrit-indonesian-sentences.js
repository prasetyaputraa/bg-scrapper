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
function(callback) {
  var logString = '';
  for (let i = 1; i <= 18; i++) {
    (async function(i) {
      var root = xml.element();

      //return await readFile('./raw_sentences_sanskrit_indonesian/raw_sentences_merged_bab' + i + '.xml', 'utf8', async (err, data) => {
      return await readFile('./raw_sentences_sanskrit_indonesian/raw_sentences_merged_bab' + i + '.xml', 'utf8');
    })(i)
    .then((data) => {
      let xmlData   = new DOMParser().parseFromString(data, 'text/xml');
      let sentences = xmlData.documentElement.getElementsByTagName('sentences');

      for (sentence in sentences) {
        if (typeof sentences[sentence].getAttribute !== 'undefined') {
          let slokaNumber      = sentences[sentence].getAttribute('sloka');
          let sanskritSentence = '';
          let indonesiSentence = '';

          if (sentences[sentence].getElementsByTagName('sanskrit')[0].firstChild !== null) {
            sanskritSentence = sentences[sentence].getElementsByTagName('sanskrit')[0].firstChild.nodeValue;
          }

          if (sentences[sentence].getElementsByTagName('indonesian')[0].firstChild !== null) {
            indonesiSentence = sentences[sentence].getElementsByTagName('indonesian')[0].firstChild.nodeValue;
          }

          let {_logString, sanskritSentence, indonsiSentence} 
            = clearNoise(i, slokaNumber, sanskritSentence, indonesiSentence);

          logString += _logString;

          console.log('INI BELAKANG');
        }
      }
    });
  }

  callback('finish');
}(function(message) {
  console.log(message);

  var log = fs.createWriteStream('./log/clean_merging_log');
  log.write(logString);
  log.end();
  console.log('INI DULUAN');
});

/**
 * ! NOISE CLEANSING
 * ! ---------------
 * 
 * | first cleans from '(this kind of optional meaning words)'
 * ? ex: maddhusudana (pembunuh raksasa madhu)
 * * this should be useful later to make
 * * another dictionary of synonims
 * 
 * @param {string} chapter current chapter
 * @param {string | int} slokaNumber current sloka number being processed
 * @param {string} sanskritSentence current sloka's string of sanskrit
 * @param {string} indonesiSentence current sloka's string of indoensia
 */
function clearNoise(chapter, slokaNumber, sanskritSentence, indonesiSentence) {
  var logString = ''

  sanskritSentence.replace(/\((.*?)\)/g, '');
  indonesiSentence.replace(/\((.*?)\)/g, '');

  if (!sanskritSentence) {
    logString += `EMPTY SENTENCE FOUND: Chapter ${chapter} Sloka ${slokaNumber} in <SANSKRIT>\n`;
  }

  if (!indonesiSentence) {
    logString += `EMPTY SENTENCE FOUND: Chapter ${chapter} Sloka ${slokaNumber} in <INDONESIAN>\n`;
  }

  return {logString, sanskritSentence, indonesiSentence};
}