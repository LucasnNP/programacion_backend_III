import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from "jsonwebtoken";
import UserDTO from "../dto/User.dto.js";
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
    res.send({ status: "success", payload: result._id });
  } catch (error) {
    req.logger.error(error);
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
    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, "tokenSecretJWT", { expiresIn: "1h" });
    req.logger.info(`Inicio de sesión: ${user.email}`);
    res
      .cookie("coderCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Logged in" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const current = async (req, res, next) => {
  try {
    const cookie = req.cookies["coderCookie"];
    const user = jwt.verify(cookie, "tokenSecretJWT");
    if (user) return res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error(error);
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

    const token = jwt.sign(user, "tokenSecretJWT", { expiresIn: "1h" });
    req.logger.info(`Inicio de sesión sin protección: ${user.email}`);
    res
      .cookie("unprotectedCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Unprotected Logged in" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const unprotectedCurrent = async (req, res, next) => {
  try {
    const cookie = req.cookies["unprotectedCookie"];
    const user = jwt.verify(cookie, "tokenSecretJWT");
    if (user) return res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error(error);
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
