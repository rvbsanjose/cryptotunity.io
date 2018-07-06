import mongoose, { Schema } from 'mongoose';

export default mongoose.model('Coin', Schema({
    _id: Number,
    Prices: {},
    Name: String,
    Symbol: String,
    StartDate: Date,
    Twitter: String,
    ImageUrl: String,
    BlockTime: Number,
    SortOrder: Number,
    Algorithm: String,
    Technology: String,
    ProofType: String,
    Description: String,
    WebsiteUrl: String,
    BlockReward: Number,
    BlockNumber: Number,
    TotalCoinSupply: Number,
    TotalCoinsMined: Number,
    NetHashesPerSecond: Number,
    DifficultyAdjustment: Number,
    BlockRewardReduction: Number,
    PreviousTotalCoinsMined: Number,
    LastBlockExplorerUpdateTS: Number
}));