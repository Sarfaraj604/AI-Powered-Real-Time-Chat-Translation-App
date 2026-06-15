import jwt from "jsonwebtoken";

const frontendOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const hasDeployedFrontend = frontendOrigins.some(
    (origin) =>
        !origin.includes("localhost") &&
        !origin.includes("127.0.0.1") &&
        !origin.includes("[::1]")
);

const useSecureCookies =
    process.env.NODE_ENV === "production" || hasDeployedFrontend;

export const authCookieOptions = {
    httpOnly: true,
    sameSite: useSecureCookies ? "None" : "Lax",
    secure: useSecureCookies,
};


export const generateTokenForUser = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{ 
        expiresIn: "7d",
    });

    res.cookie("Token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        ...authCookieOptions,
    });
    return token;
}

