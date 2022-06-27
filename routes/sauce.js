const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

const sauceCtrl = require('../controllers/sauce');

router.post('/', auth, multer, sauceCtrl.addSauce);
router.get('/', auth, sauceCtrl.getSauces);
router.get('/:id', auth, sauceCtrl.getSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.post('/:id/like', auth, sauceCtrl.rateSauce);

module.exports = router;