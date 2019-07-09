/* 
*************************************************************
Bhagawad Gita Bilingual Corpus final.
=============================================================

written by: Dwi Prasetya Putra @prasetyaputraa
last updated: 2019-07-10 04:26:39 GMT+8

Description:
------------
Merged BG texts of sanskrit and indonesian.
From from previously created corpus

*************************************************************
 */

const xml           = require('xml');
const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;

for (let i = 1; i <= 18; i++) {
  (async function(i) {
    var root = xml.element();

    var xmlDocument = fs.createWriteStream('./raw_sentences_sanskrit_indonesian/raw_sentences_merged_bab' + i + '.xml');
    var stream = xml({root: root}, {indent: '\t', stream: true, declaration: true});

    stream.on('data', function (chunk) { 
      xmlDocument.write(chunk);
    });

    await fs.readFile(`./raw_sentences/raw_sentences_bab${i}.xml`, 'utf8', async (err, data) => {
      if (err) throw err;

      let sanskritBuffer = fs.readFileSync(`./raw_sentences_sanskrit/raw_sentences_sanskrit_bab${i}.xml`, 'utf8');

      let xmlSanskrit = new DOMParser().parseFromString(sanskritBuffer, 'text/xml');
      let xmlIndo     = new DOMParser().parseFromString(data, 'text/xml');

      let ind = xmlIndo.documentElement.getElementsByTagName('sentences');
      let san = xmlSanskrit.documentElement.getElementsByTagName('sentences');

      for (let sloka = 0; sloka < ind.length; sloka++) {

        let slokaNumberString = ind[sloka].getAttribute('sloka');

        let slokaMeta = parseSlokaNumber(slokaNumberString);

        let sanskrit   = '';
        let indonesian = '';

        indonesian = (ind[sloka].getElementsByTagName('indonesian')[0].firstChild !== null) ? 
          ind[sloka].getElementsByTagName('indonesian')[0].firstChild.nodeValue : '';
        
        if (!slokaMeta[0]) {

          let sanskrits = Object.values(san).filter((element) => {
            slokaIndex = i.toString().length + 1;

            return ((typeof element) === 'object') && (element.getAttribute('sloka').substring(slokaIndex) == slokaMeta[1]);
          });

          if (sanskrits.length > 0) {
            sanskrit = sanskrits[0].getElementsByTagName('sanskrit')[0].firstChild.nodeValue;
          }
        } else {

          sanskrits = Object.values(san).filter((element) => {
            slokaIndex = i.toString().length + 1;

            return ((typeof element) === 'object') && (element.getAttribute('sloka').substring(slokaIndex) >= (slokaMeta[1][0] - 1)) && (element.getAttribute('sloka').substring(slokaIndex) <= (slokaMeta[1][1] + 1));
          });

          if (sanskrits.length > 0) {
            for (let n = 0; n <= sanskrits.length; n++) {
              if ((typeof sanskrits[n]) === 'object') {
                sanskrit += sanskrits[n].getElementsByTagName('sanskrit')[0].firstChild.nodeValue + ' ';
              }
            }
          }
        }

        root.push({sentences: [{ _attr: {sloka: slokaNumberString}}, {sanskrit: sanskrit.trim()}, {indonesian: indonesian}]});
      }

      root.close();
      xmlDocument.end();
    });

    return(i);
  })(i)
  .then(function(j) {
  });
}

function parseSlokaNumber(slokaNumberString) {
  let containCompound = false;

  if (result = slokaNumberString.match(/-/)) {
    containCompound = true;

    let compoundBoundIndices = splitValue(slokaNumberString, result['index']);

    return [containCompound, compoundBoundIndices];
  }

  return [containCompound, parseInt(slokaNumberString)];
}

function splitValue(value, index) {
  return [parseInt(value.substring(0, index)), parseInt(value.substring(index + 1))];
}