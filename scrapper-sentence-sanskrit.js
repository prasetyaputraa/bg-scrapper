const rp            = require('request-promise');
const cheerio       = require('cheerio');
const xml           = require('xml');
const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

let totalSloka = 0;

for (let i = 1; i <= 18; i++) {
  (async function(i) {
    let chapterNum = i < 10 ? "0" + i : i;

    let slokaCount = 0;

    let pageUrl = "http://sacred-texts.com/hin/bgs/bgs" + chapterNum + ".htm";
    var root = xml.element();

    console.log('Fetching and processing data at url:', pageUrl);

    var xmlDocument = fs.createWriteStream('./raw_sentences_sanskrit/raw_sentences_sanskrit_bab' + i + '.xml');
    var stream = xml({root: root}, {indent: '\t', stream: true, declaration: true});

    stream.on('data', function (chunk) { 
        xmlDocument.write(chunk);
      });

    await rp(pageUrl)
      .then(function(html){
        let currentSlokaString = '';

        // the idea is to find tags <br> and read their next element first word on end of it's string
        cheerio('*', html).each(function (index, element) {

          let nextEl = cheerio(element)[0].nextSibling.nodeValue;

          if (((typeof nextEl) === 'string') && nextEl.trim().length >= 1) {

            // --------------------------------------------
            // Dividing Slokas
            // --------------------------------------------
            // if the last 4 or 5 of nextEl value is number
            // then add $currenSlokaString to the document
            // indicating new line of sloka.
            // --------------------------------------------
            if (!isNaN(slokaNumber = parseFloat(nextEl.substr(-4).trim()))) {
              currentSlokaString = currentSlokaString == '' ? '' : currentSlokaString + '\n';

              if (nextEl.trim().length >= 4) {
                currentSlokaString += nextEl.substring(0, nextEl.length - 4).trim();
              } else {
                currentSlokaString += nextEl.trim();
              }
              // add $currentSlokaString to document
              // clear $currentSlokaString.

                // keeping slokaNumber to 2 precision float
                // if the number higher than .9
              if ((slokaCount + 1 > 9) && ((slokaCount + 1) % 10 === 0)) {
                slokaNumber = slokaNumber + '0';
              }

              currentSlokaString = currentSlokaString.replace(/\n/g, " ").trim();

              root.push({sentences: [{ _attr: {sloka: slokaNumber}}, {sanskrit: currentSlokaString}]});
              slokaCount += 1;
              currentSlokaString = '';
            } else {
              currentSlokaString += '\n' + nextEl.trim();
            }

          }
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
