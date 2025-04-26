const mongoose = require('mongoose');

const clientInfoSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    creditCard: { type: String, required: true },
    expiryMonth: { type: String, required: true },
    expiryYear: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    trainId: { type: String, required: true }
});

module.exports = mongoose.model('ClientInfo', clientInfoSchema);
