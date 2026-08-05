import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from "jsonwebtoken";
import UserDTO from "../dto/User.dto.js";
import userService from "../services/index.js";
import CustomError from "../utils/errors/CustomError.js";
import EErrors from "../utils/errors/EErrors.js";
import { generateUserErrorInfo } from "../utils/errors/Info.js";

const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      CustomError.createError({
        name: "User creation error",
        cause: generateUserErrorInfo(req.body),
        message: "Error al registrar el usuario",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }
    const exists = await usersService.getUserByEmail(email);
    if (exists) {
      req.logger.warning(
        `Intento de registro con un email existente: ${email}`,
      );
      return res
        .status(400)
        .send({ status: "error", error: "User already exists" });
    }
    const hashedPassword = await createHash(password);
    const user = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
    };
    const result = await usersService.create(user);
    req.logger.info(`Usuario registrado: ${result.email}`);
    res.status(201).send({ status: "success", payload: result._id });
  } catch (error) {
    req.logger.error(error.stack || error.message);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmail(email);
    if (!user) {
      req.logger.warning(
        `Intento de inicio de sesión con usuario inexistente: ${email}`,
      );
      return res
        .status(401)
        .send({ status: "error", error: "Invalid credentials" });
    }
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      req.logger.warning(`Contraseña incorrecta para el usuario: ${email}`);
      return res
        .status(401)
        .send({ status: "error", error: "Invalid credentials" });
    }
    // Actualizar última conexión antes de generar el token, si por algún motivo falla la creación JWT el usuario alcanzó a autenticarse correctamente igual
    await userService.update(user._id, { last_connection: new Date() });

    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, "tokenSecretJWT", { expiresIn: "1h" });
    req.logger.info(`Inicio de sesión: ${user.email}`);
    res
      .cookie("coderCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Logged in" });
  } catch (error) {
    req.logger.error(error.stack || error.message);
    next(error);
  }
};

const current = async (req, res, next) => {
  try {
    const cookie = req.cookies["coderCookie"];
    if (!cookie) {
      req.logger.warning(
        "Intento de acceso a /current sin token de autenticación",
      );
      return res.status(401).send({ status: "error", error: "Unauthorized" });
    }
    const user = jwt.verify(cookie, "tokenSecretJWT");
    if (user) return res.send({ status: "success", payload: user });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      req.logger.warning("Token inválido o expirado");
      return res.status(401).send({ status: "error", error: "Unauthorized" });
    }
    req.logger.error(error.stack || error.message);
    next(error);
  }
};

const unprotectedLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmail(email);
    if (!user) {
      req.logger.warning(
        `Intento de inicio de sesión inseguro con usuario inexistente: ${email}`,
      );
      return res
        .status(401)
        .send({ status: "error", error: "invalid credentials" });
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      req.logger.warning(`Contraseña incorrecta para el usuario: ${email}`);
      return res
        .status(401)
        .send({ status: "error", error: "Invalid credentials" });
    }
    // Actualizar última conexión antes de generar el token, si por algún motivo falla la creación JWT el usuario alcanzó a autenticarse correctamente igual
    await userService.update(user._id, { last_connection: new Date() });

    console.log(user);
    console.log(typeof user);
    console.log(user.constructor.name);
    const token = jwt.sign(user.toObject(), "tokenSecretJWT", {
      expiresIn: "1h",
    });
    req.logger.info(`Inicio de sesión sin protección: ${user.email}`);
    res
      .cookie("unprotectedCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Unprotected Logged in" });
  } catch (error) {
    req.logger.error(error.stack || error.message);
    next(error);
  }
};

const unprotectedCurrent = async (req, res, next) => {
  try {
    const cookie = req.cookies["unprotectedCookie"];
    if (!cookie) {
      req.logger.warning("Intento de acceso a /unprotectedCurrent sin token");
      return res.status(401).send({ status: "error", error: "Unauthorized" });
    }
    const user = jwt.verify(cookie, "tokenSecretJWT");
    if (user) return res.send({ status: "success", payload: user });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      req.logger.warning("Token JWT inválido o expirado");
      return res.status(401).send({ status: "error", error: "Unauthorized" });
    }
    req.logger.error(error.stack || error.message);
    next(error);
  }
};

export default {
  current,
  login,
  register,
  unprotectedLogin,
  unprotectedCurrent,
};
