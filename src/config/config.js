import dotenv from "dotenv";
import program from "./commander.js";

// Se Carga el archivo .env correspondiente y exporta la configuación
const { mode } = program.opts();

const envFile =
  mode === "production"
    ? "./.env.production"
    : mode === "test"
      ? "./.env.test"
      : "./.env.development";

dotenv.config({
  path: envFile,
});

export default {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  mode,
};
