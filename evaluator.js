//NOTES TO MYSELF IN THE FUTURE
//
//there is this strange behavior with for...in in javascript and xmldom parser
//
//

const fs        = require('fs');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

for (let i = 1; i <= 18; i++) {
  (async function(i) {
    await fs.readFile('./clean/clean_bab' + i + '.xml', 'utf-8', async function (err, data) {
      if (err) {
        throw err;
      }

      let emptyInd = 0;
      let emptySan = 0;

      doc         = new DOMParser().parseFromString(data, 'application/xml');
      indonesians = doc.getElementsByTagName('indonesian');
      sanskrits   = doc.getElementsByTagName('sanskrit');

      let temp = new DOMParser().parseFromString(
        '<?xml version="1.0" encoding="UTF-8"?>'+
        '<temp>'+
        '</temp>'
        , 'application/xml'
      );

      for (let indo = 0; indo < indonesians.length; indo++) {
        if (indonesians[indo].firstChild !== null) {
          if (indonesians[indo].firstChild.nodeValue.length > 1) {
            continue;
          }

          temp.documentElement.appendChild(indonesians[indo].parentNode)

          emptyInd++;
        } else {
          temp.documentElement.appendChild(indonesians[indo].parentNode)
          emptyInd++;
        }
      }

      for (let s = 0; s < sanskrits.length; s++) {
        if (sanskrits[s].firstChild !== null) {
          if (sanskrits[s].firstChild.nodeValue.length > 1) {
            continue;
          }

          temp.documentElement.appendChild(sanskrits[s].parentNode)

          emptySan++;
        } else {
          temp.documentElement.appendChild(sanskrits[s].parentNode)
          emptySan++;
        }
      }

      await fs.writeFile('./malscrapp/malscrapp_bab' + i + '.xml', new XMLSerializer().serializeToString(temp), function (err) {if(err) {console.log('errornya ', err)} else { console.log('yay')}});
    });
  })(i);
}