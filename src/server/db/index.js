import mongoose from 'mongoose';
import { DB_NAME } from '../constants';

export default class DBConnector {
    constructor() {
        return mongoose.connect('mongodb://localhost:27017', { dbName: DB_NAME })
            // TODO: handle the case where the connection wasn't established
            .catch(err => console.log.bind(console, err));
    }
}