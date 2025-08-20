
import {registerUser,loginUser} from "../services/user.service.js";


export const register = async (req, res) => {
    try {
        const {user, token} = await registerUser(req.body);

        res.status(201).json({
            status: "success",
            user,
            token
        });

    } catch (err) {
        res.status(500).json({
            status: "failed to register",
            error: {
                message: err.message
            }
        })
    }
}



export async function login(req, res, next) {
    console.log(req.body);
    try {
        const { user, token } = await loginUser({
            email: req.body.email,
            password: req.body.password,
        });
        res.json({ user, token });
    } catch (e) {
        next(e);
    }
}
