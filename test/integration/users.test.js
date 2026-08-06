import supertest from "supertest";
import { expect } from "chai";

const requester = supertest("http://localhost:8080");

describe("Testing Users Router", function () {
  const registerUser = {
    first_name: "Lucas",
    last_name: "Prueba",
    email: `user${Date.now()}@mail.com`,
    password: "coder123",
  };

  const createUser = async () => {
    const userData = { ...registerUser, email: `user${Date.now()}@mail.com` };

    const response = await requester
      .post("/api/sessions/register")
      .send(userData);

    expect(response.statusCode).to.equal(201);

    return response.body.payload;
  };

  describe("GET /users", function () {
    it("Debe obtener todos los usuarios", async function () {
      const result = await requester.get("/api/users");

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.payload).to.be.an("array");
    });
  });

  describe("GET /users/:uid", function () {
    it("Debe obtener un usuario por su id", async function () {
      const userId = await createUser();

      const result = await requester.get(`/api/users/${userId}`);

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.payload).to.have.property("_id");
      expect(result.body.payload._id).to.equal(userId);
    });

    it("Debe devolver 404 si el usuario no existe", async function () {
      const fakeUserId = "507f191e810c19729de860ea";

      const result = await requester.get(`/api/users/${fakeUserId}`);

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("User not found");
    });
  });

  describe("PUT /users/:uid", function () {
    it("Debe actualizar un usuario correctamente", async function () {
      const userId = await createUser();

      const updateData = { first_name: "Lucas", last_name: "Actualizado" };

      const result = await requester
        .put(`/api/users/${userId}`)
        .send(updateData);

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.message).to.equal("User updated");

      const updatedUser = await requester.get(`/api/users/${userId}`);

      expect(updatedUser.statusCode).to.equal(200);
      expect(updatedUser.body.payload.first_name).to.equal("Lucas");
      expect(updatedUser.body.payload.last_name).to.equal("Actualizado");
    });

    it("Debe devolver 404 si el usuario no existe", async function () {
      const fakeId = "507f191e810c19729de860ea";

      const result = await requester
        .put(`/api/users/${fakeId}`)
        .send({ first_name: "Juan" });

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("User not found");
    });
  });

  describe("DELETE /users/:uid", function () {
    it("Debe eliminar un usuario correctamente", async function () {
      const userId = await createUser();

      const result = await requester.delete(`/api/users/${userId}`);

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.message).to.equal("User deleted");

      // Verificamos que ya no exista
      const deletedUser = await requester.get(`/api/users/${userId}`);

      expect(deletedUser.statusCode).to.equal(404);
      expect(deletedUser.body.status).to.equal("error");
      expect(deletedUser.body.error).to.equal("User not found");
    });

    it("Debe devolver 404 si el usuario no existe", async function () {
      const fakeId = "507f191e810c19729de860ea";

      const result = await requester.delete(`/api/users/${fakeId}`);

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("User not found");
    });
  });

  describe("POST /users/:uid/documents", function () {
    it("Debe subir un documento y asociarlo al usuario", async function () {
      // Registrar usuario
      const userId = await createUser();

      const result = await requester
        .post(`/api/users/${userId}/documents`)
        .attach("documents", "./test/assets/test-document.pdf");

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.message).to.equal("Documents uploaded successfully");

      // Verificar que el documento se haya asociado al usuario
      const userResponse = await requester.get(`/api/users/${userId}`);

      expect(userResponse.body.payload.documents).to.have.lengthOf(1);
      expect(userResponse.body.payload.documents[0]).to.have.property("name");
      expect(userResponse.body.payload.documents[0]).to.have.property(
        "reference",
      );
    });

    it("Debe devolver 404 si el usuario no existe", async function () {
      const fakeUserId = "507f191e810c19729de860ea";

      const result = await requester
        .post(`/api/users/${fakeUserId}/documents`)
        .attach("documents", "./test/assets/test-document.pdf");

      expect(result.statusCode).to.equal(404);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("User not found");
    });

    it("Debe devolver 400 si no se proporcionan documentos", async function () {
      const userId = await createUser();

      const result = await requester.post(`/api/users/${userId}/documents`);

      expect(result.statusCode).to.equal(400);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("No documents uploaded");
    });
  });
});
