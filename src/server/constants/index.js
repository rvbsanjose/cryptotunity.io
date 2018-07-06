const EXTRA_PARAMS = 'extraParams=cryptotunity.io';
const BASE_URI = 'https://min-api.cryptocompare.com/data';

export const SERVICES = [
    './services/sortSvc',
    './services/priceSvc'
];

export const DB_NAME = 'cryptotunity';
export const MAX_PRICE_FETCH_SIZE = 30;
export const GET_PRICE_INTERVAL = 300000;
export const GET_SORT_INTERVAL = 3600000;
export const GET_PRICE_RESET_INTERVAL = 3600000;
export const GET_TRADING_PAIRS = [ 'BTC', 'ETH', 'USD', 'USDT' ];
export const GET_SORTING_URI = `${BASE_URI}/top/totalvol?limit=100&tsym=USD&${EXTRA_PARAMS}&page=`;
export const GET_PRICES_URI = `${BASE_URI}/pricemultifull?${EXTRA_PARAMS}&tsyms=${GET_TRADING_PAIRS}&fsyms=`;
