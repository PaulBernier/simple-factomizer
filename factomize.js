const fs = require('fs'),
    path = require('path'),
    { sha512 } = require('./crypto'),
    { FactomCli, Entry, Chain } = require('factom');

// FCT address funded from the genesis block
const FUNDED_FCT_ADDRESS = 'Fs3E9gV6DXsYzf7Fqx1fVBQPQXV695eP3k5XbmHEZVRLkMdD9qCK';

async function factomize(filePath) {
    const cli = new FactomCli();

    const chain = buildChain(filePath);
    const { ecAddress } = await getEntryCredits(cli, chain.ecCost());
    const { entryHash, chainId } = await cli.add(chain, ecAddress);

    console.log(`File ${path.resolve(filePath)} secured on Factom blockchain.`);
    console.log(`Chain id: ${chainId}`);
    console.log(`Entry hash: ${entryHash}`);
}

async function getEntryCredits(cli, amount) {
    // https://docs.factom.com/api#generate-ec-address
    const { public: ecAddress } = await cli.walletdApi('generate-ec-address');
    const transaction = await cli.createEntryCreditPurchaseTransaction(FUNDED_FCT_ADDRESS, ecAddress, amount);
    const txId = await cli.sendTransaction(transaction);

    console.log(`Transaction ID of the entry credit purchase: ${txId}`);

    return { ecAddress };
}

function buildChain(filePath) {
    const data = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    const hash = sha512(data);

    const entry = Entry.builder()
        .extId('simple-factomizer', 'utf8')
        .extId(filename, 'utf8')
        .extId(Date.now().toString(), 'utf8')
        .content(hash)
        .build();

    return new Chain(entry);
}

factomize(process.argv[2])