import chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Testing Adoptions Router", function () {
  const adoptionUser = {
    first_name: "Lucas",
    last_name: "Prueba",
    email: `adoption${Date.now()}@mail.com`,
    password: "coder123",
  };

  const adoptionPet = {
    name: "Firulais",
    specie: "Perro",
    birthDate: "2023-01-15",
  };

  // función auxiliar de creación de usuario
  const createUser = async () => {
    const userData = {
      ...adoptionUser,
      email: `adoption${Date.now()}@mail.com`,
    };

    const response = await requester
      .post("/api/sessions/register")
      .send(userData);

    expect(response.statusCode).to.equal(201);

    return response.body.payload;
  };

  // Función auxiliar de creación de mascota
  const createPet = async () => {
    const response = await requester.post("/api/pets").send(adoptionPet);

    expect(response.statusCode).to.equal(201);

    return response.body.payload._id;
  };

  let userId;
  let petId;
  let adoptionId;

  describe("GET /adoptions", function () {
    it("Debe obtener todas las adopciones", async function () {
      const result = await requester.get("/api/adoptions");

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.payload).to.be.an("array");
    });
  });

  describe("GET /adoptions/:aid", function () {
    before(async function () {
      // Registrar y obtener usuario
      userId = await createUser();

      // Crear mascota
      petId = await createPet();

      //crear adopción
      const adoptionResponse = await requester.post(
        `/api/adoptions/${userId}/${petId}`,
      );
      expect(adoptionResponse.statusCode).to.equal(201);

      //Obtener el id de la adopción creada
      const allAdoptions = await requester.get("/api/adoptions");
      expect(allAdoptions.statusCode).to.equal(200);
      const adoption = allAdoptions.body.payload.find(
        (a) => a.owner === userId && a.pet === petId,
      );
      expect(adoption).to.exist;
      adoptionId = adoption._id;
    });

    it("Debe obtener una adopción por su id", async function () {
      const result = await requester.get(`/api/adoptions/${adoptionId}`);

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.payload).to.have.property("_id");

      expect(result.body.payload.owner.toString()).to.equal(userId);
      expect(result.body.payload.pet.toString()).to.equal(petId);
    });

    it("Debe devolver 404 si la adopción no existe", async function () {
      const result = await requester.get(
        "/api/adoptions/507f191e810c19729de860ea",
      );

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Adoption not found");
    });
  });

  describe("POST /adoptions/:uid/:pid", function () {
    it("Debe crear una adopción correctamente", async function () {
      // Registrar usuario
      const userId = await createUser();

      // Crear una mascota
      const petId = await createPet();

      // Crear adopción
      const result = await requester.post(`/api/adoptions/${userId}/${petId}`);

      expect(result.statusCode).to.equal(201);
      expect(result.body.status).to.equal("success");
      expect(result.body.message).to.equal("Pet adopted");
    });

    it("Debe devolver 404 si el usuario no existe", async function () {
      // Crear mascota
      const petId = await createPet();

      // Usuario inexistente
      const fakeUserId = "507f191e810c19729de860ea";

      const result = await requester.post(
        `/api/adoptions/${fakeUserId}/${petId}`,
      );

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("User not found");
    });

    it("Debe devolver 404 si la mascota no existe", async function () {
      const userId = await createUser();

      const fakePetId = "507f191e810c19729de860ea";

      const result = await requester.post(
        `/api/adoptions/${userId}/${fakePetId}`,
      );

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Pet not found");
    });

    it("Debe devolver 400 si la mascota ya fue adoptada", async function () {
      // Registrar usuario
      const userId = await createUser();

      // Crear una mascota
      const petId = await createPet();

      // Primera adopción de mascota creada
      const firstAdoption = await requester.post(
        `/api/adoptions/${userId}/${petId}`,
      );
      expect(firstAdoption.statusCode).to.equal(201);

      // Se reutiliza el mismo usuario porque el controller sólo valida que la mascota ya esté adoptada.
      const result = await requester.post(`/api/adoptions/${userId}/${petId}`);

      expect(result.statusCode).to.equal(400);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Pet is already adopted");
    });
  });
});
