const rp            = require('request-promise');
const cheerio       = require('cheerio');
const xml           = require('xml');
const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

const pageUrls = [
  'http://web.archive.org/web/20180713021357/http://penuntundiri.blogspot.com/2015/01/bhagavad-gita-bab-1.html', //bab 1
  'http://web.archive.org/web/20180719154147/http://penuntundiri.blogspot.com/2015/01/normal-0-false-false-false-en-us-x-none_6.html', //bab 2
  'http://web.archive.org/web/20180806021951/http://penuntundiri.blogspot.com/2015/01/bhagavad-gita-bab-3_6.html', //bab 3
  'http://web.archive.org/web/20180727091525/http://penuntundiri.blogspot.com/2015/01/bhagavad-gita-bab-4_6.html', //bab 4
  'http://web.archive.org/web/20180813153302/http://penuntundiri.blogspot.com/2015/01/bhagavad-gita-bab-5_6.html', //bab 5
  'http://web.archive.org/web/20180813190014/http://penuntundiri.blogspot.com/2015/01/bhagavad-gita-bab-6_6.html', //bab 6
];

let totalSloka = 0;

for (let i = 1; i <= 18; i++) {
  (async function(i) {
    numberString = (i === 1 || i === 7 || i ===8) ? i : i + '_6';
    const url = (i != 2) 
      ? 'http://penuntundiri.blogspot.com/2015/01/bhagavad-gita-bab-' + numberString + '.html'
      : 'http://penuntundiri.blogspot.com/2015/01/normal-0-false-false-false-en-us-x-none_6.html';

    var root = xml.element();

    var xmlDocument = fs.createWriteStream('./raw_sentences/raw_sentences_bab' + i + '.xml');
    var stream = xml({root: root}, {indent: '\t', stream: true, declaration: true});

    stream.on('data', function (chunk) { 
        xmlDocument.write(chunk);
      });

    let n = 0;
    let curr = 0;

    let slokaCount = 0;

    await rp(url)
      .then(function(html){
        // the idea is to find a tag '<div>' with class of 't' and 'Terjemahan' string inside it, and
        // go to a couple next tags to find the translated sentences
        cheerio('.t', html).each(function (index, element) {

          let sanskrit   = "";
          let indonesian = "";

          let currentSloka = null;
          let currentEl = cheerio(element);

          for (let s = 0; s < 100; s++) {
            if (currentEl.prev().text().trim().substring(0, i.toString().length) == i) {
              currentSloka = currentEl.prev().text().trim().substring(i.toString().length + 1);
              curr = parseInt(currentSloka) + 1;
              break;
            }

            currentEl = currentEl.prev();
          }

          if (currentSloka == null) {
            curr = curr + 1;
            currentSloka == curr;
          }

          if (cheerio(element).text() == '\nTerjemahan') {
            if (cheerio(element).next()[0].nextSibling.nodeValue.trim() != '') {
              indonesian = cheerio(element).next()[0].nextSibling.nodeValue.trim().replace(/\n/g, " ");
            } else {
              indonesian = cheerio(element).next().next().text().trim().replace(/\n/g, " ");
            }
            root.push({sentences: [{ _attr: { sloka: currentSloka}}, {sanskrit: sanskrit}, {indonesian: indonesian}]});
          }

          slokaCount = currentSloka;

        });

        root.close();
        xmlDocument.end();
      })
      .catch(function(err){
        root.close();
      });
    return [i, parseInt(slokaCount)];
  })(i).then(function(i) {
    totalSloka += i[1];
    console.log('chapter: ' + i[0], 'jumlah sloka: ' + i[1]);
    console.log('sloka count: ' + totalSloka);
  });
}
