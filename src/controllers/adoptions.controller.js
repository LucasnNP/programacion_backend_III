import {
  adoptionsService,
  petsService,
  usersService,
} from "../services/index.js";

const getAllAdoptions = async (req, res, next) => {
  try {
    const result = await adoptionsService.getAll();
    res.send({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const getAdoption = async (req, res, next) => {
  try {
    const adoptionId = req.params.aid;
    const adoption = await adoptionsService.getAdoptionById(adoptionId);
    if (!adoption) {
      return res
        .status(404)
        .send({ status: "error", error: "Adoption not found" });
    }
    res.send({ status: "success", payload: adoption });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const createAdoption = async (req, res, next) => {
  try {
    const { uid, pid } = req.params;
    const user = await usersService.getUserById(uid);
    if (!user) {
      req.logger.warning(`Intento de adopción con usuario inexistente: ${uid}`);
      return res.status(404).send({ status: "error", error: "User not found" });
    }
    const pet = await petsService.getPetById(pid);
    if (!pet) {
      req.logger.warning(`Intento de adopción de mascota inexistente: ${pid}`);
      return res.status(404).send({ status: "error", error: "Pet not found" });
    }
    if (pet.adopted) {
      req.logger.warning(
        `Intento de adopción de una mascota ya adoptada: ${pet.name} (${pid})`,
      );
      return res
        .status(400)
        .send({ status: "error", error: "Pet is already adopted" });
    }
    user.pets.push(pet._id);
    await usersService.update(user._id, { pets: user.pets });
    await petsService.update(pet._id, { adopted: true, owner: user._id });
    await adoptionsService.create({ owner: user._id, pet: pet._id });
    req.logger.info(`Mascota ${pet.name} adoptada por ${user.email}`);
    res.send({ status: "success", message: "Pet adopted" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

export default {
  createAdoption,
  getAllAdoptions,
  getAdoption,
};
