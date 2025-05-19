const mongoose = require('mongoose'); // Add this line

const trainSchema = new mongoose.Schema({
    name: String,
    departure_station: String,
    arrival_station: String,
    departure_date: String,
    departure_time: String,
    arrival_time: String,
    price: Number // Added price field
});

module.exports = mongoose.model('Train', trainSchema); // Export the model
