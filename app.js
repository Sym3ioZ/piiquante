const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require ('fs');

const User = require ('./models/user');
const Sauce = require ('./models/sauce');

const userRoutes = require('./routes/user');

const auth = require ('./middleware/auth');
const multer = require('./middleware/multer-config');

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

// Route signup
app.post('/api/auth', userRoutes);
// Route login
app.use('/api/auth', userRoutes);

// Routes sauces

// Route add sauce
app.post('/api/sauces', auth, multer, (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  Sauce.findOne({ name: sauceObject.name })
    .then (sauceName => {
      if (!sauceName) {
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
          .then (() => res.status(201).json({ message: "Sauce enregistrée avec succès !"}))
          .catch (error => res.status(400).json({ error }));
      } else {
        return res.status(403).json({ message: "Erreur: sauce déjà enregistrée !"});
      }
    })
    .catch (error => res.status(500).json({ error }));
})

// Route display all sauces
app.get('/api/sauces', auth, (req, res, next) => {
  Sauce.find()
    .then (sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
});

// Route display ONE sauce
app.get('/api/sauces/:id', auth, (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
   .then (sauce => res.status(200).json(sauce))
   .catch (error => res.status(404).json({ error }));
});

// Route delete one sauce
app.delete('/api/sauces/:id', auth, (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then (sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink (`images/${filename}`, () => {
        Sauce.deleteOne ({ _id: req.params.id })
          .then (() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch (error => res.status(400).json({ error }));
      });
    })
    .catch (error => res.status(500).json({ error }));
});

// Route modify sauce
app.put('/api/sauces/:id', auth, multer, (req, res, next) => {
  if (req.body.sauce) {
    Sauce.findOne({ _id: req.params.id })
      .then (sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink (`images/${filename}`, () => {
          const sauceObject = JSON.parse(req.body.sauce);
          sauceObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
          Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
            .then (() => res.status(200).json({ message: "Sauce modifiée avec succès !"} ))
            .catch (error => res.status(400).json({ error }));
        });
      })
      .catch (error => res.status(404).json({ error }));    
  }
  else {
    Sauce.updateOne({ _id: req.params.id}, { ...req.body, _id: req.params.id})
    .then (() => res.status(200).json({ message: "Sauce modifiée avec succès !"} ))
    .catch (error => res.status(400).json({ error }));
  }
});

// Route like/dislike
app.post('/api/sauces/:id/like', auth, (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then (sauce => {  
      if (req.body.like == 1) {
        let i = 0;
        while ((i < sauce.usersLiked.length) && (sauce.usersLiked.length > 0)) {
          if (req.body.userId == sauce.usersLiked[i]) {
            return res.status(403).json({ message: "Unauthorized" });
          }
          i++;
        }
        sauce.usersLiked.push(req.body.userId);
        Sauce.updateOne({ _id: req.params.id}, { likes: (sauce.likes + 1), usersLiked: sauce.usersLiked, _id: req.params.id})
          .then (() => res.status(200).json({ message: "Sauce likée !"} ))
          .catch (error => res.status(400).json({ error }));
      }
      if (req.body.like == -1) {
        let j = 0;
        while ((j < sauce.usersDisliked.length) && (sauce.usersDisliked.length > 0)) {
          if (req.body.userId == sauce.usersDisliked[j]) {
            return res.status(403).json({ message: "Unauthorized" });
          }
          j++;
        }
        sauce.usersDisliked.push(req.body.userId);
        Sauce.updateOne({ _id: req.params.id}, { dislikes: (sauce.dislikes +1), usersDisliked: sauce.usersDisliked, _id: req.params.id})
          .then (() => res.status(200).json({ message: "Sauce dislikée !"} ))
          .catch (error => res.status(400).json({ error }));
      }
      if (req.body.like == 0) {
        let k = 0
        while ((k < sauce.usersLiked.length) && (sauce.usersLiked.length > 0)) {
          if (req.body.userId == sauce.usersLiked[k]) {
            sauce.usersLiked.splice(k, 1);
            Sauce.updateOne({ _id: req.params.id}, { likes: (sauce.likes - 1), usersLiked: sauce.usersLiked, _id: req.params.id})
              .then (() => res.status(200).json({ message: "OK"} ))
              .catch (error => res.status(400).json({ error }));
          }
          k++;
        }
        let l = 0
        while ((l < sauce.usersDisliked.length) && (sauce.usersDisliked.length > 0)) {
          if (req.body.userId == sauce.usersDisliked[l]) {
            sauce.usersDisliked.splice(l, 1);
            Sauce.updateOne({ _id: req.params.id}, { dislikes: (sauce.dislikes - 1), usersDisliked: sauce.usersDisliked, _id: req.params.id})
              .then (() => res.status(200).json({ message: "OK"} ))
              .catch (error => res.status(400).json({ error }));
          }
          l++;
        }
      }
    })
    .catch(error => res.status(500).json({ error }));
});

module.exports = app;