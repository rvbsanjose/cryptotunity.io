import BaseSvc from './baseSvc';
import Coin from '../models/coin';
import Price from '../models/price';
import { isEqual, sleep } from '../../helpers';
import { MAX_PRICE_FETCH_SIZE, GET_PRICES_URI, GET_PRICE_INTERVAL, GET_PRICE_RESET_INTERVAL } from '../constants';

export default class PriceSvc extends BaseSvc {
    constructor() {
        super();

        this.intervals = {};
        this.initFetchingSequence();

        /**
         * Clear out current fetching intervals once every hour since the importance (sort order)
         * of a symbol may change over time. The sort order is based on total trading volume over
         * a 24 hour period.
         */
        setInterval(() => this.updateFetchingSequence(), GET_PRICE_RESET_INTERVAL);
    }

    // Save the id returned from setInterval so we can clear it out later when we do the reset
    setIntervalId(timeDelay, intervalId) {
        this.intervals[ timeDelay ].intervalId = intervalId;
    }

    setInitialSequence(coinInfo, timeDelay) {
        this.intervals[ timeDelay ] = {
            intervalId: null,
            fsyms: [ coinInfo.Symbol ]
        }
    }

    addToSequence(coinInfo, timeDelay) {
        this.intervals[ timeDelay ].fsyms.push(coinInfo.Symbol);
    }

    getFetchingUri(timeDelay) {
        return `${GET_PRICES_URI}${this.intervals[ timeDelay ].fsyms.join(',')}`;
    }

    initFetchingSequence() {
        this.dataStore.getIn([ 'sortOrder' ]).forEach(coinInfo => {
            const timeDelay = PriceSvc.getTimeDelay(coinInfo.SortOrder);

            if (!this.intervals.hasOwnProperty(timeDelay)) {
                return this.setInitialSequence(coinInfo, timeDelay);
            }

            if (this.intervals[ timeDelay ].fsyms.length < MAX_PRICE_FETCH_SIZE) {
                this.addToSequence(coinInfo, timeDelay);
            }

            /**
             * The API allows us to construct urls of length no greater then 300. Going to be
             * more conservative since the length of the symbols are arbitrary in length. If
             * we only construct the url based on no more then 30 symbols, then we should be pretty safe.
             */
            if (this.intervals[ timeDelay ].fsyms.length >= MAX_PRICE_FETCH_SIZE) {
                // Hit the API immediately for the first request then chill out for 5 minutes for all other requests
                sleep(timeDelay <= GET_PRICE_INTERVAL ? 0 : GET_PRICE_INTERVAL)
                    .then(this.initFetchingInterval.bind(this, this.getFetchingUri(timeDelay), timeDelay));
            }
        });
    }

    updateFetchingSequence() {
        // Clear out all the current intervals
        for (const interval in this.intervals) {
            if (this.intervals.hasOwnProperty(interval)) {
                clearInterval(this.intervals[ interval ].intervalId);
            }
        }

        // Reset the intervals map to the initial state
        this.intervals = {};

        // Init the fetching sequence again
        this.initFetchingSequence();
    }

    /**
     * This API is so inconsistent in how data is returned. Some of the data points
     * is camelcase and some is all in caps. Why is it not all camelcased?. It just
     * looks so weird pulling the data out of "DISPLAY".
     */
    processResponse(_, { DISPLAY }) {
        if (!DISPLAY || !Object.keys(DISPLAY).length) {
            return;
        }

        const documents = this.getDocumentsToUpdate(DISPLAY);

        if (documents) {
            Coin.bulkWrite(documents)
                .catch(err => BaseSvc.processErr(err));
        }
    }

    initFetchingInterval(uri, timeDelay) {
        this.initFetch(uri)
            .then(this.setFetchingInterval.bind(this, uri, timeDelay))
            .then(this.setIntervalId.bind(this, timeDelay));
    }

    getDocumentsToUpdate(data) {
        const documents = Object.keys(data).reduce((accumulator, symbol) => {
            Object.keys(data[ symbol ]).forEach(tradingPair => {
                if (tradingPair !== symbol) {
                    const key = `Prices.${tradingPair}`,
                          price = data[ symbol ][ tradingPair ],
                          path = [ 'prices', symbol, tradingPair ],
                          currentPrice = this.dataStore.getIn(path) || {};

                    // Remove the MongoDB key "id" so we can do a comparison check
                    delete currentPrice._id;

                    // Don't do anything since the values are the same
                    if (isEqual(currentPrice, price)) {
                        return accumulator;
                    }

                    this.dataStore.setIn(path, price);

                    accumulator.push({
                        updateOne: {
                            upsert: true,
                            filter: { Symbol: symbol },
                            update: { $set: { [ `${key}` ]: new Price(price) } }
                        }
                    });
                }
            });

            return accumulator;
        }, []);

        return documents.length ? documents : null;
    }

    static getTimeDelay(sortOrder) {
        return Math.ceil(sortOrder / MAX_PRICE_FETCH_SIZE) * GET_PRICE_INTERVAL;
    }
}