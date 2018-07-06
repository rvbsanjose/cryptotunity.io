import DBConnector from './db';
import Coin from './models/coin';
import DataStore from './dataStore';
import { SERVICES } from './constants';

// Establish a connection to MongoDB
new DBConnector().then(() => {
    Coin.find().sort({ SortOrder: 1 }).lean().exec((err, docs) => {
        // Init the data store
        DataStore.setDataStore(docs);

        // Init the services
        SERVICES.forEach(service => {
            const klass = require(service).default;
            new klass();
        });
    });
});