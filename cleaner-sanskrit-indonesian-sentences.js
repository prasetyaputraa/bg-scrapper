const rp            = require('request-promise');
const cheerio       = require('cheerio');
const xml           = require('xml');
const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

for (let i = 2; i <= 2; i++) {
  (async function(i) {
    var root = xml.element();
    console.log('current doc:', i);

    // var xmlDocument = fs.createWriteStream('./raw_sentences_sanskrit_indonesian/raw_sentences_merged_bab' + i + '.xml');
    // var stream = xml({root: root}, {indent: '\t', stream: true, declaration: true});

    // stream.on('data', function (chunk) { 
    //   xmlDocument.write(chunk);
    // });

    await fs.readFile('./raw_sentences_sanskrit_indonesian/raw_sentences_merged_bab' + i + '.xml', 'utf8', (err, data) => {
      if (err) throw err;

      let xmlData = new DOMParser().parseFromString(data, 'text/xml');

      let sentences = xmlData.documentElement.getElementsByTagName('sentences');

      for (sentence in sentences) {
        console.log(typeof sentences[sentence].getElementsByTagName('sanskrit')[0].firstChild);
        sanskritSentence = sentences[sentence].getElementsByTagName('sanskrit')[0].firstChild.nodeValue;

        //console.log(sanskritSentence);
      }
    });

  })(i)
  .then(function(returned) {

  });
}