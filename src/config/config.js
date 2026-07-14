import dotenv from "dotenv";
import program from "./commander.js";

// Se Carga el archivo .env correspondiente y exporta la configuación
const { mode } = program.opts();

dotenv.config({
  path: mode === "production" ? "./.env.production" : "./.env.development",
});

export default {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  mode,
};
