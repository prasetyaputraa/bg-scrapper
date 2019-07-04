const rp            = require('request-promise');
const cheerio       = require('cheerio');
const xml           = require('xml');
const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

for (let i = 1; i <= 1; i++) {
  (async function(i) {
    var root = xml.element();

    var xmlDocument = fs.createWriteStream('./raw_sentences_sanskrit_indonesian/raw_sentences_merged_bab' + i + '.xml');
    var stream = xml({root: root}, {indent: '\t', stream: true, declaration: true});

    stream.on('data', function (chunk) { 
      xmlDocument.write(chunk);
    });

    await fs.readFile(`./raw_sentences/raw_sentences_bab${i}.xml`, 'utf8', (err, data) => {
      if (err) throw err;

      let xmlData = new DOMParser().parseFromString(data, 'text/xml');

      let foo = xmlData.documentElement.getElementsByTagName('sentences');

      // TODO: find how to access sentences element in $xmlData

      for (let x = 0; x < foo[0].childNodes.length; x++) {
        console.log(foo[0].childNodes[x].nodeValue);
      }
    });
  
  })(i)
  .then(function(j) {
  });
}