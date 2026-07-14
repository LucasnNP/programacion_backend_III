import EErrors from "../utils/errors/EErrors.js";

const errorHandler = (error, req, res, next) => {
  console.error(error);

  switch (error.code) {
    case EErrors.INVALID_TYPES_ERROR:
      return res.status(400).json({ status: "error", error: error.message });

    case EErrors.ROUTING_ERROR:
      return res.status(404).json({ status: "error", error: error.message });

    case EErrors.DATABASE_ERROR:
      return res.status(500).json({ status: "error", error: error.message });

    default:
      return res
        .status(500)
        .json({ status: "error", error: "Error interno del servidor" });
  }
};

export default errorHandler;
