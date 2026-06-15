import Token from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.Token;
        if(!token) return res.status(401).json({message: "Unautharized user- No token is provided"});

        const decoded = Token.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({message: "Invalid token"});

        const user = await User.findById(decoded.userId).select("-password");
        if(!user) return res.status(401).json({message: "user not found!"});
         console.log("decoded information", decoded);
        req.user = user;
        next();

    } catch (error) {
        console.log("Error in protectedRoute ", error.message);
        res.status(501).json({message: "Internal server error"});
    }
}