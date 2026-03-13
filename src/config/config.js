// const Config = {
//   ENVIROMENT: "dev",
//   SMTP: {
//     HOST: "sandbox.smtp.mailtrap.io",
//     PORT: 465,
//     USER: "5aa15f3dcfcb44",
//     PASS: "4ce386b62f5da7",
//     FROM: "noreply@test.com",
//     TLS: false,
//   },
//   DB: {
//     PROTOCOL: "mongodb",
//     HOST: "127.0.0.1",
//     NAME: "universal",
//     USER: "",
//     PWD: "",
//     PORT: 27017,
//   },
//   JWT_SECRET: process.env.JWT_SECRET,
// };

// export default Config;

export const DB = {
  PROTOCOL: "mongodb",
  HOST: "127.0.0.1",
  NAME: "flightBooking",
  USER: "",
  PWD: "",
  PORT: 27017,
};
// export const DB = {
//   URL: "mongodb+srv://poudyalpujan7_db_user:Pujan%409818114838@airticket.ajg9lhf.mongodb.net/flightBooking?retryWrites=true&w=majority"
// };

export const ENVIROMENT = "dev";
