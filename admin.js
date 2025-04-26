const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3001;
const uri = 'mongodb://localhost:27017'; // MongoDB connection string
const dbName = 'train_database'; // Database name
const collectionName = 'clientinfos'; // Collection name

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

// Serve train_admin.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'train_admin.html'));
});

// Endpoint to fetch client data
app.get('/api/clientinfos', async (req, res) => {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const clientInfos = await collection.find({}).toArray();
        res.json(clientInfos);
    } catch (error) {
        console.error('Error fetching client infos:', error);
        res.status(500).json({ message: 'Failed to fetch client information.' });
    } finally {
        await client.close();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
});
