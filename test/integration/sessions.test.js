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

  describe("POST /register", function () {
    it("Debe registrar un usuario correctamente", async function () {
      const result = await requester
        .post("/api/sessions/register")
        .send(registerUser);

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

  describe("POST /login", function () {
    it("Debe iniciar sesión correctamente y devolver una cookie de autenticación", async function () {
      const result = await requester.post("/api/sessions/login").send({
        email: registerUser.email,
        password: registerUser.password,
      });

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      expect(result.body.message).to.equal("Logged in");
      expect(result.headers).to.have.property("set-cookie");
      cookie = result.headers["set-cookie"][0];
      expect(cookie).to.include("coderCookie");
    });

    it("Debe devolver 401 si el usuario no existe", async function () {
      const result = await requester
        .post("/api/sessions/login")
        .send({ email: "usuario.inexistente@test.com", password: "coder123" });

      expect(result.statusCode).to.equal(401);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Invalid credentials");
    });

    it("Debe devolver 401 si la contraseña es incorrecta", async function () {
      const result = await requester
        .post("/api/sessions/login")
        .send({ email: registerUser.email, password: "passwordIncorrecta" });

      expect(result.statusCode).to.equal(401);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Invalid credentials");
    });

    it("Debe devolver 400 si faltan credenciales", async function () {
      const result = await requester
        .post("/api/sessions/login")
        .send({ email: registerUser.email });

      expect(result.statusCode).to.equal(400);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Incomplete values");
    });
  });

  describe("GET /current", function () {
    it("Debe devolver el usuario autenticado a partir del JWT", async function () {
      const result = await requester
        .get("/api/sessions/current")
        .set("Cookie", cookie);

      expect(result.statusCode).to.equal(200);
      expect(result.body.status).to.equal("success");
      //jwt me devuelve el objeto {name, role, email, iat, exp} y no solamente el DTO, separo iat y exp del resto del objeto
      const { iat, exp, ...strictPayload } = result.body.payload;
      // Ahora hago un deep.equal estricto del resto del payload, Si alguien en el futuro agrega un campo no deseado (ej. password), esto FALLARÁ ya que vendrá incluido dentro del strictPayload.
      expect(strictPayload).to.deep.equal({
        name: `${registerUser.first_name} ${registerUser.last_name}`,
        email: registerUser.email,
        role: "user",
      });
    });

    it("Debe devolver 401 si no se envía la cookie", async function () {
      const result = await requester.get("/api/sessions/current");

      expect(result.statusCode).to.equal(401);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Unauthorized");
    });

    it("debe devolver 401 si el JWT es inválido", async function () {
      const result = await requester
        .get("/api/sessions/current")
        .set("Cookie", "coderCookie=token_invalido");

      expect(result.statusCode).to.equal(401);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Unauthorized");
    });
  });
});
