import { faker } from "@faker-js/faker";
import { createHash } from "../utils/index.js";

export const generateMockUser = async () => {
  const password = await createHash("coder123");

  return {
    _id: faker.database.mongodbObjectId(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password,
    role: faker.helpers.arrayElement(["user", "admin"]),
    pets: [],
  };
};
