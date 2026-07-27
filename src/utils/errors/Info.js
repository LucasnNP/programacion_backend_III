/**
 * Genera un mensaje descriptivo para los errores
 * ocurridos durante la creación de un usuario.
 */
export const generateUserErrorInfo = (user) => {
  return `Una o más propiedades estaban incompletas o no son válidas.
    Lista de propiedades requeridas:
    *Last_name : Debe ser un String. se recibió ${user.first_name}
    *last_name : Debe ser un String. Se recibió ${user.last_name}
    *email     : Debe ser un String. Se recibió ${user.email}
    *password  : Debe ser un String. Se recibió ${user.password}
    `;
};

/**
 * Genera un mensaje descriptivo para los errores
 * ocurridos durante la creación de una mascota.
 */
export const generatePetErrorInfo = (pet) => {
  return `Una o más propiedades estaban incompletas o no son válidas.
    Lista de propiedades requeridas:
    *name      : Debe ser un String. Se recibió ${pet.name}
    *specie    : Debe ser un String. Se recibió ${pet.specie}
    *birthDate : Debe ser una Date válida. Se recibió ${pet.birthDate}
    `;
};
