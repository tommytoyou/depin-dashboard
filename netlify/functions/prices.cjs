const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event, context) => {
  const tokens = [
    'render-token',
    'filecoin',
    'bittensor',
    'internet-computer',
    'the-graph',
    'helium',
    'arweave',
    'akash-network',
    'iotex',
    'io-net',
    'storj',
    'chainlink',
  ];

  const ids = tokens.join(',');
  const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;
  const categoriesUrl = 'https://api.coingecko.com/api/v3/coins/categories';

  try {
    const [marketsResponse, categoriesResponse] = await Promise.all([
      fetch(marketsUrl),
      fetch(categoriesUrl),
    ]);

    if (!marketsResponse.ok) {
      return {
        statusCode: marketsResponse.status,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch markets from CoinGecko' }),
      };
    }

    const marketsData = await marketsResponse.json();

    const formattedTokens = marketsData.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
    }));

    let categoryData = null;
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      const depinCategory = categoriesData.find(
        (cat) =>
          cat.id === 'depin' ||
          cat.name?.toLowerCase() === 'depin' ||
          cat.name?.toLowerCase().includes('decentralized physical infrastructure')
      );

      if (depinCategory) {
        categoryData = {
          marketCap: depinCategory.market_cap,
          marketCapChange24h: depinCategory.market_cap_change_24h,
          totalCoins: depinCategory.content?.split(',').length || depinCategory.coins_count || 0,
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ tokens: formattedTokens, category: categoryData }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
