require('dotenv').config();
const { ethers } = require('ethers');
const network = 'mainnet';
const express = require('express');
const app = express();
const { getDepositCoins, getDepositCoinsPrices } = require('./queries.js');
const cors = require('cors');
const { Contract, Provider } = require('ethcall');
const ethAbi = require('./abi/eth.json');
const ohmAbi = require('./abi/ohm.json');

var corsOptions = {
    origin: ['http://localhost:3000', 'https://new-design--quipto.netlify.app']
  }

app.get('/deposit', cors(corsOptions), async (req, res) => {

    // Set up provider
    const provider = new ethers.providers.InfuraProvider(network, {
        projectId: process.env.projectId,
        projectSecret: process.env.projectSecret
    });
    
    // Create interface for price feed
    const ethUsdContract = new ethers.Contract(
        '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
        [
        'function latestAnswer() public view returns (int256 answer)'
        ],
        provider
    );

    // Get latest price
    const priceNow = await ethUsdContract.latestAnswer()
    
    // Get and sort data
    const myCoins = await getDepositCoins('deposit');
    const myPrices = await getDepositCoinsPrices('deposit');

    // Build response object
    let myNewData = [];
    myNewData = myCoins.map((item, index) => {
        return {
            symbol: item.symbol,
            current_price: ethers.utils.formatEther(myPrices[index].price) * ethers.utils.formatUnits(priceNow, 8),
            price_change_percentage_24h: item.price_change_percentage_24h
        }
    });

    res.send(JSON.stringify(myNewData));
    
});

app.get('/pools', cors(corsOptions), async (req, res) => {

    // Set up provider to allow multicall
    const ethcallProvider = new Provider();
    const provider = new ethers.providers.InfuraProvider(network, {
        projectId: process.env.projectId,
        projectSecret: process.env.projectSecret
    });
    await ethcallProvider.init(provider);

    // Create interfaces for price feeds
    const ethUsdContract = new Contract(
        '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
        ethAbi
    );

    const ohmEthContract = new Contract(
        '0x90c2098473852e2f07678fe1b6d595b1bd9b16ed',
        ohmAbi
    );

    // Call functions in a single call
    const data = await ethcallProvider.all([ethUsdContract.latestRoundData(), ohmEthContract.latestRoundData()]);

    // Create response object
    const ethPrice = data[0].answer.toString();
    const ohmPrice = data[1].answer.toString();

    // Get and sort data
    const myCoins = await getDepositCoins('pools');
    const myPrices = await getDepositCoinsPrices('pools');

    // Add price to additional coins
    myPrices.map(item => {
        if(item.externalId === 'OHM'){
            item.price = ohmPrice;
        }
    });

    // Build response object
    let myNewData = [];
    myNewData = myCoins.map((item, index) => {
        return {
            symbol: item.symbol,
            current_price: ethers.utils.formatEther(myPrices[index].price) * ethers.utils.formatUnits(ethPrice, 8),
            price_change_percentage_24h: item.price_change_percentage_24h
        }
    });

    res.send(JSON.stringify(myNewData));
});

app.listen(3001, () => console.log('Listening on port 3001...'));