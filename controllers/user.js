const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
          const user = new User({   // Creates the new user with the hashed password
              email: req.body.email,
              password: hash
          });
          user.save()   // Saves the object User into the DB
            .then(() => res.status(201).json({ message: "Utilisateur créé !"}))
            .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then (user => {
            if (!user) {  // Checks if the user already exists in the DB
                return res.status(401).json({ error: 'Utilisateur non trouvé' });
            }
            bcrypt.compare(req.body.password, user.password)    // Compares the password hash
                .then (valid => {
                    if (!valid) {
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
};