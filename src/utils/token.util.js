import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
    // return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    return jwt.sign(
        { id: payload.id, name: payload.name, role: payload.role },
        process.env.JWT_SECRET,
        { expiresIn: "23h" }
    );
};
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
