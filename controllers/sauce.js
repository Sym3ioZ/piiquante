const Sauce = require ('../models/sauce');
const fs = require('fs');

exports.addSauce = (req, res, next) =>{
    const sauceObject = JSON.parse(req.body.sauce);

    Sauce.findOne({ name: sauceObject.name })
        .then ( returnedSauce => {
            if (returnedSauce && (returnedSauce.name == sauceObject.name) ) {
                return res.status(401).json({ message: "Erreur: sauce déjà enregistrée à ce nom !"})
            }
            else {
                const sauce = new Sauce ({   // Then creates a new sauce object
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
                sauce.save()  // Saves the sauce object in the DB
                    .then (() => res.status(201).json({ message: "Sauce enregistrée avec succès !"}))
                    .catch (error => res.status(400).json({ error }));                    
            };
        })
        .catch ( error => {
            return res.status(500).json({ error });
        }); 
}

exports.getSauces = (req, res, next) => {
    Sauce.find()    // Retrieves every sauce from the DB
        .then (sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

exports.getSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })   // Retrieves the sauce with the passed Id from the DB
        .then (sauce => res.status(200).json(sauce))
        .catch (error => res.status(404).json({ error }));
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })   // Retrieves the sauce with the passed Id from the DB
        .then (sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];  // Gets the image filename
            fs.unlink (`images/${filename}`, () => {  // The uses unlink to delete the image file
                Sauce.deleteOne ({ _id: req.params.id })   // And deletes the sauce from the DB
                    .then (() => res.status(200).json({ message: "Sauce supprimée !" }))
                    .catch (error => res.status(400).json({ error }));
            });
        })
        .catch (error => res.status(500).json({ error }));
}

exports.modifySauce = (req, res, next) => {
    if (req.body.sauce) {   // If there is a sauce string in the body object, means that there is also a image file
        Sauce.findOne({ _id: req.params.id })
            .then (sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                const sauceObject = JSON.parse(req.body.sauce);  // Parses the sauce string to object
                Sauce.find() 
                    .then ( sauces => {
                        let i = 0;
                        let sauceCheck = true;
                        while (i < sauces.length) {
                            if (sauceObject.name == sauces[i].name) {
                                sauceCheck = false;
                            }
                            i++;
                        }
                        if (sauceObject.name == sauce.name || sauceCheck == true) {
                            if (req.file.filename != filename) {
                                fs.unlink (`images/${filename}`, () => {   // Deletes previous image file, to be replaced by the new one
                                    sauceObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
                                    console.log(sauceObject.imageUrl);
                                    Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})  // Updates the sauce in the DB with the values in the sauce object
                                    .then (() => res.status(200).json({ message: "Sauce modifiée avec succès !"} ))
                                    .catch (error => res.status(400).json({ error }));
                                });
                            }
                            else {
                                sauceObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
                                    console.log(sauceObject.imageUrl);
                                    Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})  // Updates the sauce in the DB with the values in the sauce object
                                    .then (() => res.status(200).json({ message: "Sauce modifiée avec succès !"} ))
                                    .catch (error => res.status(400).json({ error }));
                            }
                            
                        }
                        else {
                            return res.status(401).json({ message: "Erreur: sauce déjà enregistrée à ce nom !"});
                        }
                        
                    })
                    .catch ( error => {
                        return res.status(500).json({ error });
                    });                
            })
            .catch (error => res.status(404).json({ error }));    
    }
    else {   // Means there is no attached image to update, body is already the sauce object to update the one in the DB
        Sauce.findOne({ _id: req.params.id })
            .then ( sauce => {
                let j = 0;
                let sauceCheck2 = true;
                Sauce.find() 
                    .then (sauces => {
                        while (j < sauces.length) {
                            if (req.body.name == sauces[j].name) {
                                sauceCheck2 = false;
                            }
                            j++;
                        }
                        if (sauce.name == req.body.name || sauceCheck2 == true) {
                            Sauce.updateOne({ _id: req.params.id}, { ...req.body, _id: req.params.id})
                                .then (() => res.status(200).json({ message: "Sauce modifiée avec succès !"} ))
                                .catch (error => res.status(400).json({ error }));
                        }
                        else {
                            return res.status(401).json({ message: "Erreur: sauce déjà enregistrée à ce nom !"});
                        }
                    })
                    .catch ( error => {
                        return res.status(404).json({ error });
                    });  
            })
            .catch ( error => {
                return res.status(500).json({ error });
            }); 
        
    }
}

exports.rateSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then (sauce => {  
            if (req.body.like == 1) {   // Means Like
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
            if (req.body.like == -1) {  // Means dislike
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
            if (req.body.like == 0) {  // Means the user drops his like/dislike
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
}