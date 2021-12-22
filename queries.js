const axios = require('axios');
const { depositAssetsIds, depositAssets, poolsAssetsIds, poolsAssets } = require('./data.js');

const getDepositCoins = async(variant) => {
    const results = await axios.all([
        axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false'),
        axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2&sparkline=false')
    ]);

    let myResponse, helperArr = [];
    results.map((query, index) => {
        if(index === 0){
            myResponse = query.data;
        }
        helperArr = query.data;
    });

    myResponse = myResponse.concat(helperArr);

    let acceptedIds
    if(variant === 'deposit'){
      acceptedIds = ['bitcoin', 'ethereum', 'usd-coin', 'dai', 'true-usd', 'tether', 'nusd','binance-usd'];
    } else if (variant === 'pools'){
      acceptedIds = ['bitcoin', 'ethereum', 'olympus', 'usd-coin', 'dai', 'tether'];
    }
    

    myResponse = myResponse.filter(item => acceptedIds.includes(item.id));

    return myResponse;
}

const getDepositCoinsPrices = async (variant) => {
    const result = await axios.post('https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan',
    {
        query: `
        {
            priceOracleAssets(first: 100){
                id
                priceInEth
            }
        }
        `
    });

    let myData = result.data.data.priceOracleAssets;

    let assets = [];
    if(variant === 'deposit'){
      myData = myData.filter(item => depositAssetsIds.includes(item.id));
      assets = depositAssets;
    } else if (variant === 'pools'){
      myData = myData.filter(item => poolsAssetsIds.includes(item.id));
      assets = poolsAssets;
    }

    myData.sort((a,b) => {
        return b.id - a.id;
    });
    

    assets.sort((a,b) => {
        return b.id - a.id;
    })

    const myAssetsWithPrices = assets.map((item, index) => {
        return {
            id: item.id,
            externalId: item.AssetSymbol,
            price: myData[index].priceInEth
        }
    });

    if(variant === "pools"){
      myAssetsWithPrices.push({
        id: null,
        externalId: 'OHM',
        price: 1,
      });
    }
    
    return myAssetsWithPrices;
}

exports.getDepositCoins = getDepositCoins;
exports.getDepositCoinsPrices = getDepositCoinsPrices;