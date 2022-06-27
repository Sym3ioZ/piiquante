const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');
const sauceRoutes = require ('./routes/sauce');

const app = express();

app.use(express.json());
app.use(cors());

// Declaring static path to images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Connection to MongoDB Atlas
mongoose.connect('mongodb+srv://Sym3ioZ:Moikoisen72!@cluster0.5acqt.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Routes login and signup
app.use('/api/auth', userRoutes);

// Routes sauces
app.use('/api/sauces', sauceRoutes);

module.exports = app;