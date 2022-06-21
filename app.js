const express = require('express');
const mongoose = require('mongoose');
const User = require ('./models/user');
const Sauce = require ('./models/sauce');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(cors());

// Connection to MongoDB Atlas
mongoose.connect('mongodb+srv://Sym3ioZ:Moikoisen72!@cluster0.5acqt.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

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
        return res.status(401).json({ error });
      }
      bcrypt.compare(req.body.password, user.password)
        .then (valid => {
          if (!valid) {
            return res.status(401).json({ error });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id},
              'RANDOM-SECRET-TOKEN',
              { expiresIn: '24h'}
            )
          });
        })
        .catch (error => res.status(500).json({ error }));
    })
    .catch (error => res.status(500).json({ error }));
});

// Route sauces
app.post('/api/sauces', (req, res, next) => {
  const json = req.body.sauce;
  console.log(json);
  const sauceString = JSON.parse(json);
  console.log(sauceString);
  Sauce.findOne({ name: sauceString.name })
    .then (sauceName => {
      if (sauceName) {
        return res.status(403).json({ message: "Erreur: sauce déjà enregistrée"});
      }
      
      // const sauce = new Sauce({
      //   userId: "123",
      //   name: { type: String, required: true},
      //   manufacturer: {type: String},
      //   description: {type: String},
      //   mainPepper: { type: String},
      //   imageUrl: { type: String},
      //   heat: { type: Number, required: true},
      //   likes: { type: Number},
      //   dislikes: { type: Number},
      //   usersLiked: {type: ["String <userId>"]},
      //   usersDisliked: {type: ["String <userId>"]},
      // })
      res.status(200).json({
        
      })
    })
})
app.get('/api/sauces', (req, res, next) => {
  console.log('get réussi !');

})

module.exports = app;