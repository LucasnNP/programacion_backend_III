export const generateUserErrorInfo = (user) => {
  return `Una o más propiedades estaban incompletas o no son válidas.
    Lista de propiedades requeridas:
    *Last_name : Debe ser un String. se recibió ${user.first_name}
    *last_name : Debe ser un String. Se recibió ${user.last_name}
    *email     : Debe ser un String. Se recibió ${user.email}
    *password  : Debe ser un String. Se recibió ${user.password}
    `;
};
