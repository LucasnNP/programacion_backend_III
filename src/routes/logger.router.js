import { Router } from "express";

const router = Router();

router.get("/loggerTest", (req, res) => {
  req.logger.debug("Este es un mensaje de debug");
  req.logger.http("Este es un mensaje de http");
  req.logger.info("Este es un mensaje de info");
  req.logger.warning("Este es un mensaje de warning");
  req.logger.error("Este es un mensaje de error");
  req.logger.fatal("Este es un mensaje fatal");

  res.send({
    status: "success",
    message: "Prueba de logger ejecutada correctamente",
  });
});

export default router;
