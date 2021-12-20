const axios = require('axios');

const assetsIds = [
    '0xd1b98b6607330172f1d991521145a22bce793277',
    '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    '0xe22da380ee6b445bb8273c81944adeb6e8450422',
    '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
    '0x016750ac630f711882812f24dba6c95b9d35856d',
    '0x13512979ade267ab5100878e2e0f485b568328a4',
    '0x99b267b9d96616f906d53c26decf3c5672401282',
    '0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf'
];

const assets = [
    {
      id: "0xd1b98b6607330172f1d991521145a22bce793277",
      externalId: "bitcoin",
      image: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg?v=014",
      AssetSymbol: "BTC",
      Name: "WBTC Coin",
    },
    {
      id: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
      externalId: "ethereum",
      image: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=014",
      AssetSymbol: "ETH",
      Name: "Ethereum",
    },
    {
      id: "0xe22da380ee6b445bb8273c81944adeb6e8450422",
      externalId: "usd-coin",
      image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=014",
      AssetSymbol: "USDC",
      Name: "USD Coin",
    },
    {
      id: "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd",
      externalId: "dai",
      image: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=014",
      AssetSymbol: "DAI",
      Name: "DAI",
    },
    {
      id: "0x016750ac630f711882812f24dba6c95b9d35856d",
      externalId: "true-usd",
      image: "https://cryptologos.cc/logos/trueusd-tusd-logo.svg?v=014",
      AssetSymbol: "TUSD",
      Name: "TrueUSD",
    },
    {
      id: "0x13512979ade267ab5100878e2e0f485b568328a4",
      externalId: "tether",
      image: "https://cryptologos.cc/logos/tether-usdt-logo.svg?v=014",
      AssetSymbol: "USDT",
      Name: "USDT Coin",
    },
    {
      id: "0x99b267b9d96616f906d53c26decf3c5672401282",
      externalId: "nusd",
      image: "https://coindataflow.com/uploads/coins/nusd.png?ts=1630513759",
      AssetSymbol: "SUSD",
      Name: "sUSD",
    },
    {
      id: "0x4c6e1efc12fdfd568186b7baec0a43fffb4bcccf",
      externalId: "binance-usd",
      image: "https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=014",
      AssetSymbol: "BUSD",
      Name: "Binance USD",
    },
  ];

const getDepositCoins = async() => {
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

    const acceptedIds = ['bitcoin', 'ethereum', 'usd-coin', 'dai', 'true-usd', 'tether', 'nusd','binance-usd'];

    myResponse = myResponse.filter(item => acceptedIds.includes(item.id));

    return myResponse;
}

const getDepositCoinsPrices = async () => {
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

    myData = myData.filter(item => assetsIds.includes(item.id));

    myData.sort((a,b) => {
        return b.id - a.id;
    });

    assets.sort((a,b) => {
        return b.id - a.id;
    })

    const myAssetsWithPrices = assets.map((item, index) => {
        return {
            externalId: item.AssetSymbol,
            price: myData[index].priceInEth
        }
    });
    
    return myAssetsWithPrices;
}

exports.getDepositCoins = getDepositCoins;
exports.getDepositCoinsPrices = getDepositCoinsPrices;