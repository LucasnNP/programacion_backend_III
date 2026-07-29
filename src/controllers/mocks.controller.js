import { usersService, petsService } from "../services/index.js";
import { generateMockPet } from "../mocks/pets.mock.js";
import { generateMockUser } from "../mocks/users.mock.js";

export const getMockingPets = (req, res, next) => {
  try {
    const pets = [];

    for (let i = 0; i < 100; i++) {
      pets.push(generateMockPet());
    }
    req.logger.info(`${pets.length} mascotas de prueba generadas`);
    res.status(200).json({
      status: "success",
      payload: pets,
    });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

export const getMockingUsers = async (req, res, next) => {
  try {
    const users = [];

    for (let i = 0; i < 50; i++) {
      users.push(await generateMockUser());
    }
    req.logger.info(`${users.length} usuarios de prueba generados`);
    res.send({ status: "success", payload: users });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

export const generateData = async (req, res, next) => {
  try {
    const usersCount = Number(req.body.users);
    const petsCount = Number(req.body.pets);

    if (
      isNaN(usersCount) ||
      isNaN(petsCount) ||
      !Number.isInteger(usersCount) ||
      !Number.isInteger(petsCount) ||
      usersCount < 0 ||
      petsCount < 0
    ) {
      return res.status(400).send({
        status: "error",
        error:
          "Los parámetros users y pets deben ser números mayores o iguales a 0.",
      });
    }

    for (let i = 0; i < usersCount; i++) {
      const user = await generateMockUser();
      await usersService.create(user);
    }

    for (let i = 0; i < petsCount; i++) {
      const pet = generateMockPet();
      await petsService.create(pet);
    }

    req.logger.info(
      `Se generaron ${usersCount} usuarios y ${petsCount} mascotas`,
    );

    res.send({
      status: "success",
      message: `${usersCount} usuarios y ${petsCount} mascotas creados correctamente`,
    });
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};
