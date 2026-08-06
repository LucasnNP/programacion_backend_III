import __dirname from "./index.js";
import multer from "multer";

const folders = {
  image: "img/pets",
  documents: "documents",
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = folders[file.fieldname];

    if (!folder) {
      return cb(new Error("Tipo de archivo no permitido"));
    }

    cb(null, `${__dirname}/../public/${folder}`);
  },

  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploader = multer({ storage });

export default uploader;
