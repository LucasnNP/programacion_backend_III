import { usersService, petsService } from "../services/index.js";
import { generateMockPet } from "../mocks/pets.mock.js";
import { generateMockUser } from "../mocks/users.mock.js";
import CustomError from "../utils/errors/CustomError.js";
import EErrors from "../utils/errors/EErrors.js";

export const getMokingPets = (req, res) => {
  const pets = [];

  for (let i = 0; i < 100; i++) {
    pets.push(generateMockPet());
  }

  res.status(200).json({
    status: "success",
    payload: pets,
  });
};

export const getMockingUsers = async (req, res) => {
  const users = [];

  for (let i = 0; i < 50; i++) {
    users.push(await generateMockUser());
  }

  res.send({ status: "success", payload: users });
};

export const generateData = async (req, res) => {
  const usersCount = Number(req.body.users);
  const petsCount = Number(req.body.pets);

  if (
    isNaN(usersCount) ||
    isNaN(petsCount) ||
    usersCount < 0 ||
    petsCount < 0
  ) {
    return res
      .status(400)
      .send({
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

  res.send({
    status: "success",
    message: `${usersCount} usuarios y ${petsCount} mascotas creados correctamente`,
  });
};
