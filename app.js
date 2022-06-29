const express = require('express');
const mongoose = require('mongoose');
const sanitize = require ('express-mongo-sanitize');  // To prevent injection attacks
require('dotenv').config();  // To use environment vars (secures sensible data such as the DB connection string)

const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');
const sauceRoutes = require ('./routes/sauce');

const app = express();

app.use(sanitize());
app.use(express.json());
app.use(cors());

// Declaring static path to images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Connection to MongoDB Atlas
mongoose.connect(process.env.DB_CONNECTIONSTRING,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Routes login and signup
app.use('/api/auth', userRoutes);

// Routes sauces
app.use('/api/sauces', sauceRoutes);

module.exports = app;