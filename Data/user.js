import bcrypt from "bcryptjs";

const users = [
  {
    name: "user",
    email: "user@email.com",
    password: bcrypt.hashSync("12345", 10),
    profilePicture: "/images/user-img.JPG",
    coverPicture: "/images/cover.jpg",
  },
  {
    name: "admin",
    email: "admin@email.com",
    password: bcrypt.hashSync("12345", 10),
    isAdmin: true,
  },
  {
    name: "Jesse",
    email: "jesse@email.com",
    password: bcrypt.hashSync("12345", 10),
  },
];
export default users;
