const { getDepositCoins, getDepositCoinsPrices } = require('./queries.js');

async function start() {

    let myNewData = [];

    const myCoins = await getDepositCoins('deposit');

    const myPrices = await getDepositCoinsPrices('deposit');

    myCoins.sort((a,b) => {
        return b.symbol.localeCompare(a.symbol);
    })

    console.log(myCoins);

    myPrices.sort((a,b) => {
        return b.externalId.localeCompare(a.externalId);
    })

    console.log(myPrices);

    // myCoins.map((item, index) => {
    //     return {
    //         symbol: item.symbol,
    //         current_price: myPrices[index].price,
    //         price_change_percentage_24h: item.price_change_percentage_24h
    //     }
    // });

}

start();