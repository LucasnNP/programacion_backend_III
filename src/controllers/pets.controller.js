import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js";
import __dirname from "../utils/index.js";
import CustomError from "../utils/errors/CustomError.js";
import EErrors from "../utils/errors/EErrors.js";
import { generatePetErrorInfo } from "../utils/errors/Info.js";

const getAllPets = async (req, res, next) => {
  try {
    const pets = await petsService.getAll();
    res.send({ status: "success", payload: pets });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const createPet = async (req, res, next) => {
  try {
    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) {
      CustomError.createError({
        name: "Pet creation Error",
        cause: generatePetErrorInfo(req.body),
        message: "Error al crear la mascota",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }
    const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
    const result = await petsService.create(pet);
    req.logger.info(`Mascota creada: ${result.name}`);
    res.send({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const updatePet = async (req, res, next) => {
  try {
    const petUpdateBody = req.body;
    const petId = req.params.pid;
    const pet = await petsService.getPetById(petId);
    if (!pet) {
      return res.status(404).send({ status: "error", error: "Pet not found" });
    }
    await petsService.update(petId, petUpdateBody);
    req.logger.info(`Mascota actualizada: ${pet.name} (${petId})`);
    res.send({ status: "success", message: "pet updated" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const deletePet = async (req, res, next) => {
  try {
    const petId = req.params.pid;
    const pet = await petsService.getPetById(petId);
    if (!pet) {
      return res.status(404).send({ status: "error", error: "Pet not found" });
    }
    await petsService.delete(petId);
    req.logger.warning(`Mascota eliminada: ${pet.name} (${petId})`);
    res.send({ status: "success", message: "pet deleted" });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

const createPetWithImage = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .send({ status: "error", error: "Image is required" });
    }
    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) {
      CustomError.createError({
        name: "Pet creation Error",
        cause: generatePetErrorInfo(req.body),
        message: "Error al crear la mascota",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }
    req.logger.debug(file);
    const pet = PetDTO.getPetInputFrom({
      name,
      specie,
      birthDate,
      image: `${__dirname}/../public/img/${file.filename}`,
    });
    req.logger.debug(pet);
    const result = await petsService.create(pet);
    req.logger.info(`Mascota creada con imagen: ${result.name}`);
    res.send({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

export default {
  getAllPets,
  createPet,
  updatePet,
  deletePet,
  createPetWithImage,
};
