const rp            = require('request-promise');
const cheerio       = require('cheerio');
const xml           = require('xml');
const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

let totalSloka = 0;

for (let i = 1; i <= 18; i++) {
  (async function(i) {
    let chapterNum = i < 10 ? i : "0" + i;

    let pageUrl = "http://sacred-texts.com/hin/bgs/bgs" + chapterNum + ".htm";
    var root = xml.element();

    var xmlDocument = fs.createWriteStream('./raw_sentences_sanskrit/raw_sentences_sanskrit_bab' + i + '.xml');
    var stream = xml({root: root}, {indent: '\t', stream: true, declaration: true});

    stream.on('data', function (chunk) { 
        xmlDocument.write(chunk);
      });

    await rp(pageUrl)
      .then(function(html){
        // the idea is to find tags <br> and read their next element first word on end of it's string

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
