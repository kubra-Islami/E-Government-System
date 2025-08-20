import {verifyToken} from "../utils/token.util.js";

export const authMiddleware = (req, res, next) => {
    // const authHeader = req.headers["authorization"];
    //
    // if (!authHeader) {
    //     return res.status(401).json({ error: "No token provided" });
    // }
    // const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;


    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token" });

    try {
        const payload = verifyToken(token);

        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized: " + err.message });
    }
};

export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ message: "Forbidden" });
    next();
};
