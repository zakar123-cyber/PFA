const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { MongoClient } = require('mongodb');
const path = require('path');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files (e.g., train_admin.html)
app.use(express.static(path.join(__dirname)));

// Default route to serve train_admin.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'train_admin.html'));
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/train_database', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB client setup
const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'train_database';

// Import ClientInfo model
const ClientInfo = require('./models/clientInfo');

// Define Train Schema and Model
const trainSchema = new mongoose.Schema({
    name: String,
    departure_station: String,
    arrival_station: String,
    departure_date: String,
    departure_time: String,
    arrival_time: String,
    price: Number // NEW: Added price field
});
const Train = mongoose.model('Train', trainSchema);

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
            seatNumber // Save the generated seat number
        });

        await clientInfo.save(); // Save to database
        res.status(201).json({ 
            message: 'Client information saved successfully!', 
            seatNumber // Include the seat number in the response
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save client information.' });
    }
});

// API endpoint to fetch all client info
app.get('/api/clientinfos', async (req, res) => {
    try {
        const clientInfos = await ClientInfo.find(); // Fetch all client info from the database
        res.status(200).json(clientInfos);
    } catch (error) {
        console.error('Error fetching client info:', error);
        res.status(500).json({ message: 'Failed to fetch client information.' });
    }
});

// API endpoint to fetch all client info using MongoDB client
app.get('/api/mongodb/clientinfos', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('clientinfos');

        const clientInfos = await collection.find({}).toArray();
        res.json(clientInfos); // Send data as JSON
    } catch (error) {
        console.error('Error fetching client info:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});

// API endpoint to search for trains
app.post('/api/trains', async (req, res) => {
    const { gareDepart, gareArrivee, dateDep } = req.body;

    console.log('Search Request:', { gareDepart, gareArrivee, dateDep }); // Log the request data

    try {
        const totalTrains = await Train.countDocuments();
        console.log('Total Trains in Collection:', totalTrains); // Log total trains

        const query = {
            departure_station: { $regex: gareDepart, $options: 'i' },
            arrival_station: { $regex: gareArrivee, $options: 'i' },
            departure_date: dateDep // Match the exact date
        };
        console.log('MongoDB Query:', query); // Log the query

        const trains = await Train.find(query);
        console.log('Query Results:', trains); // Log the results

        if (trains.length === 0) {
            console.log('No trains found for the given criteria.');
            return res.status(404).json({ message: 'No trains found for the given criteria.' });
        }

        res.status(200).json(trains);
    } catch (error) {
        console.error('Error fetching trains:', error);
        res.status(500).json({ message: 'Failed to fetch trains.' });
    }
});

// NEW: API endpoint to get train price by trainId
app.get('/api/getTrainPrice/:trainId', async (req, res) => {
    const { trainId } = req.params;
    try {
        const train = await Train.findById(trainId);
        if (!train) {
            return res.status(404).json({ message: 'Train not found' });
        }
        res.status(200).json({ price: train.price });
    } catch (error) {
        console.error('Error fetching train price:', error);
        res.status(500).json({ message: 'Failed to fetch train price' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
