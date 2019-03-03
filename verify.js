const fs = require('fs'),
    path = require('path'),
    { sha512 } = require('./crypto'),
    { FactomCli } = require('factom');

async function verify(filePath, entryHash) {
    const fileHash = getFileHash(filePath);
    const recordedHash = await getRecordedHash(entryHash);

    if (fileHash.equals(recordedHash)) {
        console.log(`Integrity of file ${path.resolve(filePath)} verified against Factom record.`);
    } else {
        console.log('Hash of file *DOES NOT* match the proof recorded on Factom.');
    }
}

function getFileHash(filePath) {
    const fileData = fs.readFileSync(filePath);
    return sha512(fileData);
}

async function getRecordedHash(entryHash) {
    const cli = new FactomCli();
    const entry = await cli.getEntry(entryHash);

    if (entry.extIds[0].toString() !== 'simple-factomizer') {
        throw new Error(`Entry [${entryHash}] is not a simple factomizer entry`);
    }

    return entry.content;
}

verify(process.argv[2], process.argv[3]);