const mongoose = require('mongoose');// Import mongoose library to interact with MongoDB

const clientInfoSchema = new mongoose.Schema({// Define a schema for client information to be stored in the database
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    creditCard: { type: String, required: true },
    expiryMonth: { type: String, required: true },
    expiryYear: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    trainId: { type: String, required: true }
});

module.exports = mongoose.model('ClientInfo', clientInfoSchema);
// Export the model so it can be used in other parts of the application
// The model is named 'ClientInfo' and is based on the clientInfoSchema defined above