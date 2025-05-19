const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // Replaces body-parser
app.use(cors());

// Serve static files from the "base" directory at /base URL path
app.use('/base', express.static(path.join(__dirname, '..', 'base')));

// Connect to MongoDB with Mongoose
mongoose.connect('mongodb://localhost:27017/train_database', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB client setup (optional, only if you want to use the native driver)
const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'train_database';

// Import ClientInfo model
const ClientInfo = require('./models/clientInfo');
const Train = require('./models/trains');
// Define Train Schema and Model

// API endpoint to save client info 
app.post('/api/saveClientInfo', async (req, res) => {
    const { nom, prenom, creditCard, expiryMonth, expiryYear, paymentMethod, trainId } = req.body;

    // Generate a random seat number
    const seatNumber = `S-${Math.floor(Math.random() * 100) + 1}`; // Example: S-45

    try {
        const clientInfo = new ClientInfo({
            nom,
            prenom,
            creditCard,
            expiryMonth,
            expiryYear,
            paymentMethod,
            trainId,
            seatNumber
        });

        await clientInfo.save();
        res.status(201).json({ 
            message: 'Client information saved successfully!', 
            seatNumber
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save client information.' });
    }
});

// API endpoint to fetch all client info using Mongoose
app.get('/api/clientinfos', async (req, res) => {
    try {
        const clientInfos = await ClientInfo.find();
        res.status(200).json(clientInfos);
    } catch (error) {
        console.error('Error fetching client info:', error);
        res.status(500).json({ message: 'Failed to fetch client information.' });
    }
});

// API endpoint to fetch all client info using MongoDB native client (optional)
app.get('/api/mongodb/clientinfos', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('clientinfos');

        const clientInfos = await collection.find({}).toArray();
        res.json(clientInfos);
    } catch (error) {
        console.error('Error fetching client info:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});

// API endpoint to search for trains
app.post('/api/trains', async (req, res) => {
    const { dateDep, departureStation, arrivalStation } = req.body;

    try {
        const query = {};
        if (dateDep) query.departure_date = dateDep;
        if (departureStation) query.departure_station = departureStation;
        if (arrivalStation) query.arrival_station = arrivalStation;

        const trains = await Train.find(query); // Use Train here
        if (trains.length === 0) {
            return res.status(404).json({ message: 'No trains found based on the provided criteria.' });
        }
        res.status(200).json(trains);
    } catch (error) {
        console.error('Error fetching trains:', error);
        res.status(500).json({ message: 'Failed to fetch trains.' });
    }
});

// API endpoint to get train price by trainId
app.get('/api/getTrainPrice/:trainId', async (req, res) => {
    const { trainId } = req.params;
    try {
        const train = await Train.findById(trainId); // Use Train here
        if (!train) {
            return res.status(404).json({ message: 'Train not found' });
        }
        res.status(200).json({ price: train.price });
    } catch (error) {
        console.error('Error fetching train price:', error);
        res.status(500).json({ message: 'Failed to fetch train price' });
    }
});

// API endpoint to get train by ID (for fetching train name or details)
app.get('/api/trains/:trainId', async (req, res) => {
    try {
        const train = await Train.findById(req.params.trainId);
        if (!train) {
            return res.status(404).json({ message: 'Train not found' });
        }
        res.json(train);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch train' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/base/index.html`);
});