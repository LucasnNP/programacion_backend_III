import supertest from "supertest";
import { expect } from "chai";

const requester = supertest("http://localhost:8080");

describe("Testing Sessions Router", function () {
  const registerUser = {
    first_name: "Lucas",
    last_name: "Prueba",
    email: `test${Date.now()}@mail.com`,
    password: "coder123",
  };

  let cookie;

  it("Debe registrar un usuario correctamente", async function () {
    const result = (await requester.post("/api/sessions/register")).setEncoding(
      registerUser,
    );

    expect(result.statusCode).to.equal(201);
    expect(result.body.status).to.equal("success");
    expect(result.body.payload).to.be.a("string");
  });

  it("Debe devolver 400 si el usuario ya existe", async function () {
    const result = await requester
      .post("/api/sessions/register")
      .send(registerUser);

    expect(result.statusCode).to.equal(400);
    expect(result.body.status).to.equal("error");
    expect(result.body.error).to.equal("User already exists");
  });

  it("Debe devolver 400 si faltan datos obligatorios", async function () {
    const result = await requester
      .post("/api/sessions/register")
      .send({ first_name: "Lucas" });

    expect(result.statusCode).to.equal(400);
    expect(result.body.status).to.equal("error");
    expect(result.body.error).to.equal("Error al registrar el usuario");
  });
});
