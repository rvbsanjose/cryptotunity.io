import BaseSvc from './baseSvc';
import Coin from '../models/coin';
import { sleep, isEqual } from '../../helpers';
import { GET_SORTING_URI, GET_SORT_INTERVAL } from '../constants';

export default class SortSvc extends BaseSvc {
    constructor() {
        super();

        this.intervals = {};
        this.initFetchingSequence(`${GET_SORTING_URI}0`);
    }

    initFetchingSequence(uri) {
        this.initFetch(uri);
        this.intervals[ uri ] = this.setFetchingInterval(uri, GET_SORT_INTERVAL);
    }

    handleNextFetchingSequence(page) {
        // Sleep for 5 mins before hitting the API again so we are within our limits
        sleep(300000)
            .then(this.initFetchingSequence.bind(this, `${GET_SORTING_URI}${page + 1}`));
    }

    /**
     * We can't determine how many pages are available to fetch from the API
     * so if a page didn't return results, remove the fetch interval since it must have hit the end
     */
    removeFetchingInterval(uri) {
        clearInterval(this.intervals[ uri ]);
        delete this.intervals[ uri ];
    }

    processResponse(uri , { Data }) {
        if (!Data.length) {
            return this.removeFetchingInterval(uri);
        }

        /**
         * Since the API doesn't paginate, we need to manually keep track on where we are. Only way
         * to do that with the information we have is based on the page for which we have results for.
         */
        const page = parseInt(uri.split('page=')[ 1 ], 10);

        const documents = this.getDocumentsToUpdate(page, Data);

        if (documents) {
            Coin.bulkWrite(documents)
                .then(this.handleNextFetchingSequence.bind(this, page))
                .catch(err => BaseSvc.processErr(err));
        }
    }

    getDocumentsToUpdate(page, Data) {
        const documents = Data.reduce((accumulator, { CoinInfo }, idx) => {
            const sortOrder = page * 100 + idx + 1,
                  path = [ 'sortOrder', sortOrder - 1 ],
                  currentValue = (this.dataStore.getIn(path) || {}).SortOrder;

            // Don't do anything since the values are the same
            if (isEqual(sortOrder, currentValue) || typeof sortOrder !== 'number') {
                return accumulator;
            }

            this.dataStore.setIn(path, sortOrder);

            accumulator.push({
                updateOne: {
                    upsert: true,
                    filter: { Symbol: CoinInfo.Name },
                    update: { $set: { SortOrder: sortOrder } }
                }
            });

            return accumulator;
        }, []);

        return documents.length ? documents : null;
    }
}