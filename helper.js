function getNoiseSlokaNumber(sentence) {
    let result = sentence.match(/\d+\.\d+/g);

    if (result) {
        return result.slice(-1)[0];
    }

    return null;
}

module.exports.getNoiseSlokaNumber = getNoiseSlokaNumber;