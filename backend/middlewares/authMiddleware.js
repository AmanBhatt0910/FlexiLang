import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Not authorized, no token"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return res.status(401).json({
                message: "Not authorized, token failed"
            });
        }
        return res.status(500).json({
            message: "Server error"
        });
    }
};