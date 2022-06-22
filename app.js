const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const User = require ('./models/user');
const Sauce = require ('./models/sauce');

const auth = require ('./middleware/auth');
const multer = require('./middleware/multer-config');

const app = express();

app.use(express.json());
app.use(cors());

// Connection to MongoDB Atlas
mongoose.connect('mongodb+srv://Sym3ioZ:Moikoisen72!@cluster0.5acqt.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Declaring static path to images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Route signup
app.post('/api/auth/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
      .then(hash => {
          const user = new User({
              email: req.body.email,
              password: hash
          });
          user.save()
            .then(() => res.status(201).json({ message: "Utilisateur créé !"}))
            .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
});

// Route login
app.post('/api/auth/login', (req,res, next) => {
  User.findOne({ email: req.body.email })
    .then (user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then (valid => {
          console.log(valid);
          if (!valid) {
            console.log(!valid);
            return res.status(401).json({ error: 'Mot de passe invalide' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id},
              'RANDOM_SECRET_TOKEN',
              { expiresIn: '24h'}
            )
          });
        })
        .catch (error => res.status(500).json({ error }));
    })
    .catch (error => res.status(500).json({ error }));
});

// Route sauces
app.post('/api/sauces', auth, multer, (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce ({
    userId: sauceObject.userId,
    name: sauceObject.name,
    manufacturer: sauceObject.manufacturer,
    description: sauceObject.description,
    mainPepper: sauceObject.mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    heat: sauceObject.heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  })
  sauce.save()
    .then (() => res.status(201).json({ message: 'Sauce enregistrée avec succès !'}))
    .catch (error => res.status(400).json({ error }));
})

app.get('/api/sauces', auth, (req, res, next) => {
  Sauce.find()
    .then (sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
});

module.exports = app;