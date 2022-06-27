const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

let d = new Date();     
let today = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();  // Configuring date string to inject in image filename
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = (file.originalname.split(' ').join('_')).split('.')[0];  // Splits spaces in filenames and replace them with '_', then keeps only the name before the '.' followed by extension
    const extension = MIME_TYPES[file.mimetype];  // Adjusts extension with mimetype declared above
    callback(null, name + '(' + today + ')' + '.' + extension);  // Sets the filename as 'filename(YYYY-MM-DD).ext'
  }
});

module.exports = multer({storage: storage}).single('image');