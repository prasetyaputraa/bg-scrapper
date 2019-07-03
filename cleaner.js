const fs            = require('fs');
const DOMParser     = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

for (let i = 1; i <= 18; i++) {
  (async function(i) {
    await fs.readFile('./raw/raw_bab' + i + '.xml', 'utf-8', async function (err, data) {
      if (err) {
        throw err;
      } 
   
      doc         = new DOMParser().parseFromString(data, 'application/xml');
      indonesians = doc.getElementsByTagName('indonesian');
      sanskrits   = doc.getElementsByTagName('sanskrit');

      for (ind in indonesians) {
        if (indonesians[ind].firstChild && indonesians[ind].firstChild.nodeValue !== null) {
          indonesians[ind].firstChild.textContent = indonesians[ind].firstChild.nodeValue.trim();

          //TODO: refactor this regexes later
          indonesians[ind].firstChild.textContent = indonesians[ind].firstChild.nodeValue.replace(/^\u2014+|[\u2014,;]+$/, '');
          indonesians[ind].firstChild.textContent = indonesians[ind].firstChild.nodeValue.replace(/^\u2014+|[\u2014,;]+$/, '');
          indonesians[ind].firstChild.textContent = indonesians[ind].firstChild.nodeValue.replace(/^\u2014+|[\u2014,;]+$/, '');

          indonesians[ind].firstChild.textContent = indonesians[ind].firstChild.nodeValue.replace(/\n/g, ' ');
          //END OF TODO

          indonesians[ind].firstChild.textContent = indonesians[ind].firstChild.nodeValue.trim();
        }
      }

      for (san in sanskrits) {
        if (sanskrits[san].firstChild && sanskrits[san].firstChild.nodeValue !== null) {
          sanskrits[san].firstChild.textContent = sanskrits[san].firstChild.nodeValue.trim();
          sanskrits[san].firstChild.textContent = sanskrits[san].firstChild.nodeValue.replace(/^\u2014+|\u2014+$/, '');
        }
      }

      await fs.writeFile('./clean/clean_bab' + i + '.xml', new XMLSerializer().serializeToString(doc), function (err) {if(err) {console.log('errornya ', err)} else { console.log('yay')}});
    });
  })(i);
}