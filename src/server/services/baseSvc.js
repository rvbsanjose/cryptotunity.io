import axios from 'axios';
import DataStore from '../dataStore';

export default class BaseSvc {
    constructor() {
        this.dataStore = new DataStore();
    }
    
    setFetchingInterval(uri, interval) {
        return setInterval(() => this.initFetch(uri), interval);
    }

    initFetch(uri) {
        return BaseSvc.fetch(uri)
            .then(rsp => this.processResponse(uri, rsp.data))
            .catch(err => BaseSvc.processErr(err));
    }

    static fetch(uri) {
        return axios.get(uri);
    }

    static processErr(e) {
        console.log(`Error fetching from cryptocompare.com API: ${e.stack}`);
    }
}