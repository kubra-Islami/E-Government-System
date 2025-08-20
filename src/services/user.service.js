import {hashPassword, comparePassword} from "../utils/hash.util.js";
import {generateToken} from "../utils/token.util.js";
import {createUser, findByEmail} from "../dao/user.dao.js";

export async function registerUser(payload) {

    const exists = await findByEmail(payload.email);
    if (exists) throw new Error("User already exists");

    const password = await hashPassword(payload.password);
    const role = payload.role || 'citizen';

    if (role === 'citizen' || role === 'admin') payload.department_id = null;

    const user = await createUser({...payload, password});
    const token = generateToken(payload);
    return {user: safeUser(user), token};

}

export const loginUser = async ({email, password}) => {
    const user = await findByEmail(email);
    if (!user) throw new Error("Invalid credentials.");

    const validPass = comparePassword(password, user.password);
    if (!validPass) throw new Error("Invalid credentials.");

    const token = generateToken({id: user.id, role: user.role});
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    return {user: safeUser, token};

}

function safeUser(user) {
    const {password, ...rest} = user;
    return rest;
}
