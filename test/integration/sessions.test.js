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

    it("Debe actualizar last_connection al iniciar sesión", async function () {
      // Registrar usuario
      const testUser = {
        ...registerUser,
        email: `lastconnection${Date.now()}@mail.com`,
      };
      const registerResponse = await requester
        .post("/api/sessions/register")
        .send(testUser);
      expect(registerResponse.statusCode).to.equal(201);
      const userId = registerResponse.body.payload;

      // Verificar estado inicial mediante Users
      const beforeLogin = await requester.get(`/api/users/${userId}`);
      expect(beforeLogin.statusCode).to.equal(200);
      expect(beforeLogin.body.status).to.equal("success");
      expect(beforeLogin.body.payload.last_connection).to.equal(null);

      // Inicio de sesión
      const loginResponse = await requester
        .post("/api/sessions/login")
        .send({ email: testUser.email, password: testUser.password });
      expect(loginResponse.statusCode).to.equal(200);
      expect(loginResponse.body.status).to.equal("success");

      //verificar que last_connection fue actualizado
      const afterLogin = await requester.get(`/api/users/${userId}`);
      expect(afterLogin.statusCode).to.equal(200);
      expect(afterLogin.body.status).to.equal("success");
      expect(afterLogin.body.payload.last_connection).to.not.equal(null);
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
      //jwt me devuelve el objeto {_id, name, role, email, iat, exp} y no solamente el DTO, separo iat y exp del resto del objeto
      const { iat, exp, ...strictPayload } = result.body.payload;
      // Ahora hago un deep.equal estricto del resto del payload, Si alguien en el futuro agrega un campo no deseado (ej. password), esto FALLARÁ ya que vendrá incluido dentro del strictPayload.
      expect(strictPayload).to.deep.equal({
        _id: result.body.payload._id,
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

  describe("POST /logout", function () {
    it("Debe cerrar sesión correctamente y actualizar last_connection", async function () {
      // Crear usuario exculsivo para este test
      const testUser = {
        ...registerUser,
        email: `logout${Date.now()}@mail.com`,
      };

      //Registrar usuario
      const registerResponse = await requester
        .post("/api/sessions/register")
        .send(testUser);
      expect(registerResponse.statusCode).to.equal(201);
      const userId = registerResponse.body.payload;

      // Iniciar sesión
      const loginResponse = await requester
        .post("/api/sessions/login")
        .send({ email: testUser.email, password: testUser.password });
      expect(loginResponse.statusCode).to.equal(200);
      expect(loginResponse.headers).to.have.property("set-cookie");
      const cookie = loginResponse.headers["set-cookie"][0];

      // Obtener last-connection despues del login
      const beforeLogout = await requester.get(`/api/users/${userId}`);
      expect(beforeLogout.statusCode).to.equal(200);
      expect(beforeLogout.body.payload.last_connection).to.not.equal(null);
      const loginConnection = beforeLogout.body.payload.last_connection;

      // Realizar logout
      const logoutResponse = await requester
        .post("/api/sessions/logout")
        .set("Cookie", cookie);
      expect(logoutResponse.statusCode).to.equal(200);
      expect(logoutResponse.body.status).to.equal("success");
      expect(logoutResponse.body.message).to.equal("Logged out");

      // Verificar que la cookie haya sido eliminada
      expect(logoutResponse.headers).to.have.property("set-cookie");

      // Verificar que last_connection haya sido actualizado tras el logout
      const afterLogout = await requester.get(`/api/users/${userId}`);
      expect(afterLogout.statusCode).to.equal(200);
      expect(afterLogout.body.payload.last_connection).to.not.equal(null);

      const logoutConnection = afterLogout.body.payload.last_connection;

      expect(logoutConnection).to.not.equal(loginConnection);
    });

    it("Debe devolver 401 si se intenta cerrar sesión sin estar autenticado", async function () {
      const result = await requester.post("/api/sessions/logout");

      expect(result.statusCode).to.equal(401);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Unauthorized");
    });

    it("Debe devolver 401 si se intenta cerrar sesión con y el JWT es inválido", async function () {
      const result = await requester
        .post("/api/sessions/logout")
        .set("Cookie", "coderCookie=token_invalido");

      expect(result.statusCode).to.equal(401);
      expect(result.body.status).to.equal("error");
      expect(result.body.error).to.equal("Unauthorized");
    });
  });
});
