import mongoose from "mongoose";
import config from "../../src/config/config.js";

let connection;

export const connectTestDatabse = async () => {
  connection = await mongoose.connect(config.mongoUrl).asPromise();
};

export const cleanTestDatabase = async () => {
  await connection.collection("users").deleteMany({});
  await connection.collection("pets").deleteMany({});
  await connection.collection("adoptions").deleteMany({});
};

export const closeTestDatabase = async () => {
  await connection.close();
};
