const multer = require('multer')
const storage = new multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const multerMiddleware = multer({ storage })
module.exports = multerMiddleware