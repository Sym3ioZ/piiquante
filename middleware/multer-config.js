const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

let d = new Date();
let today = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = (file.originalname.split(' ').join('_')).split('.')[0];
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + '(' + today + ')' + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');