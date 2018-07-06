let dataStore;

export default class DataStore {
    getIn(path) {
        return path.reduce((ds, key) => {
            return ds[ key ];
        }, dataStore);
    }

    setIn(path, value) {
        const key = path.pop(),
              objToSet = this.getIn(path);

        objToSet[ key ] = value;
    }

    static setDataStore(docs) {
        dataStore = docs.reduce((accumulator, doc) => {
            if (doc.Prices) {
                accumulator[ 'prices' ][ doc.Symbol ] = doc.Prices;
            }

            if (doc.SortOrder) {
                accumulator[ 'sortOrder' ].push({
                    Symbol: doc.Symbol,
                    SortOrder: doc.SortOrder
                });
            }

            return accumulator;
        }, { prices: {}, sortOrder: [] });
    }
}