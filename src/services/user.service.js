import {hashPassword, comparePassword} from "../utils/hash.util.js";
import {createUser, findByEmail} from "../dao/user.dao.js";
import {generateToken} from "../utils/token.util.js";

export async function registerUser(payload) {

    const exists = await findByEmail(payload.email);
    if (exists) throw new Error("User already exists");

    const password = await hashPassword(payload.password);
    const role = payload.role || 'citizen';

    if (role === 'citizen' || role === 'admin') payload.department_id = null;

    const user = await createUser({
        name: payload.name,
        email: payload.email,
        password,
        national_id: payload.national_id,
        date_of_birth: payload.date_of_birth,
        contact_info: payload.contact_info,
        role,
        department_id: payload.department_id
    });

    console.log('user in service');
    console.log(user);
    // return buildAuthResponse(user);
    const token = generateToken({ id: user.id, role: user.role });

    return { user, token };
}

export const loginUser = async ({email, password}) => {
    const user = await findByEmail(email);
    if (!user) throw new Error("Invalid credentials.");

    const validPass = await comparePassword(password, user.password);
    if (!validPass) throw new Error("Invalid credentials.");

    // return buildAuthResponse(user);
    const token = generateToken({ id: user.id, role: user.role });

    return { user, token };
}

// function buildAuthResponse(user) {
//     const token = generateToken({ id: user.id, role: user.role });
//     const safeUser = {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//     };
//     return { user: safeUser, token };
// }
