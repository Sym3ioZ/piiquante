const User = require('../models/user');
const bcrypt = require('bcrypt');


// async(req,res) => {
//     console.log('inside POST');
//     const user = new User({
//       email: req.body.email,
//       password: req.body.password
//     })
  
//     const val = await user.save();
//     res.json(val)
//   ;}
exports.signup = async(req, res,) => {
    console.log("inside POST");
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
        const val = user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur crée !'}))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
        res.json(val);
};

exports.login = (req, res, next) => {

};