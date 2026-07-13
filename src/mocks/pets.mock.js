import { faker } from "@faker-js/faker";

export const generateMockPet = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    name: faker.person.firstName(),
    specie: faker.helpers.arrayElement(["Cat", "Dog", "Bird", "Rabbit"]),
    birthDate: faker.date.past(),
    adopted: false,
    owner: null,
    image: faker.image.url(),
  };
};
