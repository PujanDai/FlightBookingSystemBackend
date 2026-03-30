import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, "XYZABC123", {
    expiresIn: "2d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: "development",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
