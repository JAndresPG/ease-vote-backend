const path = require('path')
const multer = require('multer')

const candidatos = require('../../controladores/candidatos/candidatos')
const { verifyToken } = require('../../extra/jwt')

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    req.body = { llave: file.fieldname + '-' + uniqueSuffix + ext}
  }
});

const upload = multer({ storage });

module.exports = (app) => {
    app.get("/api/personas", verifyToken, candidatos.getPersons)
    app.post("/api/uploadPhoto", verifyToken, upload.single('file'), candidatos.uploadPhoto)
    app.post("/api/removePhoto", verifyToken, candidatos.removePhoto)
    app.post("/api/candidatos", verifyToken, candidatos.setCandidatos)
    app.get("/api/candidatos/:evento", verifyToken, candidatos.getCandidates)
    app.get("/api/get-photo/:llave", candidatos.getPhoto)
}