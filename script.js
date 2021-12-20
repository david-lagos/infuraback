require('dotenv').config();
const { ethers } = require('ethers');
const network = 'mainnet';
const express = require('express');
const app = express();
const { getDepositCoins, getDepositCoinsPrices } = require('./queries.js');
const cors = require('cors');

var corsOptions = {
    origin: ['http://localhost:3000']
  }

app.get('/', cors(corsOptions), async (req, res) => {
    const provider = new ethers.providers.InfuraProvider(network, {
        projectId: process.env.projectId,
        projectSecret: process.env.projectSecret
    });
    
    const ethUsdContract = new ethers.Contract(
        '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
        [
        'function latestAnswer() public view returns (int256 answer)'
        ],
        provider
    );

    const priceNow = await ethUsdContract.latestAnswer()
    
    let myNewData = [];

    const myCoins = await getDepositCoins();

    const myPrices = await getDepositCoinsPrices();

    myCoins.sort((a,b) => {
        return b.symbol.localeCompare(a.symbol);
    })  

    myPrices.sort((a,b) => {
        return b.externalId.localeCompare(a.externalId);
    })

    myNewData = myCoins.map((item, index) => {
        return {
            symbol: item.symbol,
            current_price: ethers.utils.formatEther(myPrices[index].price) * ethers.utils.formatUnits(priceNow, 8),
            price_change_percentage_24h: item.price_change_percentage_24h
        }
    });

    res.send(JSON.stringify(myNewData));
    
});

app.listen(3001, () => console.log('Listening on port 3001...'));