const rp            = require('request-promise');
const cheerio       = require('cheerio');
const xml           = require('xml');
const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

let n = 0;

for (let i = 1; i <= 18; i++) {
  (async function(i) {
    numberString = (i === 1 || i === 7 || i ===8) ? i : i + '_6';
    const url = (i != 2) 
      ? 'http://penuntundiri.blogspot.com/2015/01/bhagavad-gita-bab-' + numberString + '.html'
      : 'http://penuntundiri.blogspot.com/2015/01/normal-0-false-false-false-en-us-x-none_6.html';

    var root = xml.element();

    var xmlDocument = fs.createWriteStream('./raw/raw_bab' + i + '.xml');
    var stream = xml({root: root}, {indent: '\t', stream: true, declaration: true});

    stream.on('data', 
      function (chunk) { 
        // console.log(chunk) ;
        xmlDocument.write(chunk);
      });

    await rp(url)
      .then(function(html){
        cheerio('i', html).each(function (index, element) {
          let sanskrit   = cheerio(element).text();
          let indonesian = cheerio(element)[0].nextSibling.nodeValue;

          root.push({word: [{sanskrit: sanskrit}, {indonesian: indonesian}]});
        });

        root.close();
        xmlDocument.end();
      })
      .catch(function(err){
        root.close();
        //handle error
      });


  })(i);
}