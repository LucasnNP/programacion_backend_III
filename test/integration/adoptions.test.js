import chai from "chai";
import supertest from "supertest";

import userModel from "../../src/dao/models/User.js";
import petModel from "../../src/dao/models/Pet.js";
import adoptionModel from "../../src/dao/models/Adoption.js";

import mongoose from "mongoose";

console.log("mongoose.connection.readyState =", mongoose.connection.readyState);
console.log(adoptionModel.db === mongoose.connection);

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
      const userData = {
        ...adoptionUser,
        email: `adoption${Date.now()}@mail.com`,
      };
      console.log("1 - Registrando usuario");
      // Registrar usuario
      const registerResponse = await requester
        .post("/api/sessions/register")
        .send(userData);
      expect(registerResponse.statusCode).to.equal(201);

      // Obtener usuario desde MongoDB
      console.log("2 - Buscando usuario");
      console.log("2.1 - Antes del findOne");
      userId = registerResponse.body.payload;
      console.log("2.2 - Después del findOne");

      // Crear mascota
      console.log("3 - Creando mascota");
      const petResponse = await requester.post("/api/pets").send(adoptionPet);
      petId = petResponse.body.payload._id;

      //crear adopción
      console.log("4 - Creando adopción");
      const adoptionResponse = await requester.post(
        `/api/adoptions/${userId}/${petId}`,
      );
      console.log(adoptionResponse.statusCode);
      console.log(adoptionResponse.body);
      expect(adoptionResponse.statusCode).to.equal(201);

      //Obtener el id de la adopción creada
      console.log("5 - Buscando adopción");
      console.log("5.1 - Antes del findOne adoption");
      console.log("Estado conexión:", adoptionModel.db.readyState);
      console.log(adoptionModel.collection.name);
      console.log(adoptionModel.db.name);
      const adoption = await adoptionModel.find();
      console.log("5.2 - Después del findOne adoption");
      console.log(adoption);
      adoptionId = adoption._id.toString();
      console.log("6 - Before finalizado");
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

  //describe("POST /adoptions/:uid/:pid", function () {});
});
