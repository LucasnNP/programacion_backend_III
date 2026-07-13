import { generateMockPet } from "../mocks/pets.mock.js";

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
