import { usersService } from "../services/index.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAll();
    req.logger.info(`Consulta de usuarios: ${users.length} registrados`);
    res.send({ status: "success", payload: users });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(404).send({ status: "error", error: "User not found" });
    }
    res.send({ status: "success", payload: user });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updateBody = req.body;
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(404).send({ status: "error", error: "User not found" });
    }
    await usersService.update(userId, updateBody);
    req.logger.info(`Usuario actualizado: ${userId}`);
    res.send({ status: "success", message: "User updated" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(404).send({ status: "error", error: "User not found" });
    }
    await usersService.delete(userId);
    req.logger.warning(`Usuario eliminado: ${userId}`);
    res.send({ status: "success", message: "User deleted" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const uploadDocuments = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await usersService.getUserById(uid);
    if (!user) {
      req.logger.error(
        `Intento de subir documentos para usuario inexistente: ${uid}`,
      );
      return (
        res,
        status(404).send({ status: "error", error: "User not found" })
      );
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .send({ status: "error", error: "No documents uploaded" });
    }

    const documents = req.files.map((file) => ({
      name: file.originalname,
      reference: file.path,
    }));

    await usersService.update(user._id, {
      documents: [...user.documents, ...documents],
    });

    req.logger.info(
      `Documentos subidos para usuario ${user.email}: ${documents.length} archivos`,
    );

    return res.send({
      status: "success",
      message: "Documents uploaded successfully",
    });
  } catch (error) {
    req.logger.error(error.stack || error.message);
    next(error);
  }
};

export default {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  uploadDocuments,
};
