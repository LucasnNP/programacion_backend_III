import supertest from "supertest";
import { expect } from "chai";
import path from "path";

const imagePath = path.resolve("./test/assets/test-image.jpg");

const requester = supertest("http://localhost:8080");

describe("Testing Pets Router", function () {
  let petId;

  const petData = {
    name: "Firulais",
    specie: "Perro",
    birthDate: "2023-01-15",
  };

  describe("GET /pets", function () {
    it("Debe obtener todas las mascotas", async function () {
      const result = await requester.get("/api/pets");

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.payload).to.be.an("array");
    });
  });

  describe("POST /pets", function () {
    it("Debe crear una mascota correctamente", async function () {
      const result = await requester.post("/api/pets").send(petData);

      expect(result.statusCode).to.equal(201);
      expect(result.body.status).to.equal("success");
      expect(result.body.payload).to.have.property("_id");

      const { _id, __v, ...strictPayload } = result.body.payload;
      expect(strictPayload).to.deep.equal({
        name: petData.name,
        specie: petData.specie,
        birthDate: "2023-01-15T00:00:00.000Z",
        adopted: false,
        image: "",
      });

      expect(result.body.payload).to.not.have.property("owner");

      petId = result.body.payload._id;
    });

    it("Debe devolver 400 si faltan datos obligatorios", async function () {
      const result = await requester
        .post("/api/pets")
        .send({ name: "Firulais" });

      expect(result.statusCode).to.equal(400);
      expect(result.body.status).to.equal("error");
    });
  });

  describe("PUT /pets/:pid", function () {
    it("Debe actualizar una mascota correctamente", async function () {
      const updateData = { name: "Firulais Actualizado" };

      const result = await requester.put(`/api/pets/${petId}`).send(updateData);

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.message).to.equal("pet updated");

      //verificamos que el cambio realmente quedó registrado
      const pet = await requester.get("/api/pets");
      const updatedPet = pet.body.payload.find((p) => p._id === petId);
      expect(updatedPet.name).to.equal("Firulais Actualizado");
      //verificamos que los demás campos no cambiaron
      expect(updatedPet.specie).to.equal(petData.specie);
      expect(updatedPet.adopted).to.equal(false);
    });

    it("Debe devolver 404 si la mascota no existe", async function () {
      const fakeId = "507f191e810c19729de860ea";

      const result = await requester
        .put(`/api/pets/${fakeId}`)
        .send({ name: "Nuevo" });

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Pet not found");
    });
  });

  describe("DELETE /pets/:pid", function () {
    it("Debe eliminar una mascota correctamente", async function () {
      const result = await requester.delete(`/api/pets/${petId}`);

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.message).to.equal("pet deleted");

      const pets = await requester.get("/api/pets");

      const deletedPet = pets.body.payload.find((p) => p._id === petId);

      expect(deletedPet).to.equal(undefined);
    });

    it("Debe devolver 404 si la mascota no existe", async function () {
      const fakeId = "507f191e810c19729de860ea";

      const result = await requester.delete(`/api/pets/${fakeId}`);

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Pet not found");
    });
  });

  describe("POST /pets/withimage", function () {
    it("Debe crear una mascota con imagen correctamente", async function () {
      const result = await requester
        .post("/api/pets/withimage")
        .field("name", "Firulais con imagen")
        .field("specie", "Perro")
        .field("birthDate", "2023-01-15")
        .attach("image", imagePath);

      expect(result.statusCode).to.equal(201);
      expect(result.body.status).to.equal("success");
      expect(result.body.payload).to.have.property("_id");

      const { _id, __v, image, ...strictPayload } = result.body.payload;
      expect(strictPayload).to.deep.equal({
        name: "Firulais con imagen",
        specie: "Perro",
        birthDate: "2023-01-15T00:00:00.000Z",
        adopted: false,
      });

      expect(image).to.be.a("string");
      expect(image).to.include("public/img");
    });

    it("Debe devolver 400 si no se envía una imagen", async function () {
      const result = await requester
        .post("/api/pets/withimage")
        .field("name", petData.name)
        .field("specie", petData.specie)
        .field("birthDate", petData.birthDate);

      expect(result.statusCode).to.equal(400);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Image is required");
    });

    it("Debe devolver 400 si faltan datos obligatorios", async function () {
      const result = await requester
        .post("/api/pets/withimage")
        .attach("image", imagePath);

      expect(result.statusCode).to.equal(400);
      expect(result.body.status).to.equal("error");
    });
  });
});
