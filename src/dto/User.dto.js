export default class UserDTO {
  static getUserTokenFrom = (user) => {
    return {
      _id: user._id,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      email: user.email,
    };
  };
}
