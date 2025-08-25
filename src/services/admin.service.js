import db from "../config/db.js";
import {
    deleteUser,
    getReports,
    getDashboardStatsDao,
    getUserList,
    searchUsers,
    searchServices, searchRequests, updateUserDao, getUserByIdDao
} from "../dao/admin.dao.js";

// export const getDashboardStats = async () => {
//     try {
//         // Total requests
//         const totalRequestsResult = await db.query(
//             "SELECT COUNT(*) AS total_requests FROM requests"
//         );
//
//
//         const approvedResult = await db.query(
//             "SELECT COUNT(*) AS approved FROM requests WHERE status = 'approved'"
//         );
//
//
//         const rejectedResult = await db.query(
//             "SELECT COUNT(*) AS rejected FROM requests WHERE status = 'rejected'"
//         );
//
//         return {
//             total_requests: totalRequestsResult.rows[0].total_requests,
//             approved: approvedResult.rows[0].approved,
//             rejected: rejectedResult.rows[0].rejected
//         };
//
//     } catch (err) {
//         console.error("Error fetching dashboard stats:", err);
//         throw err;
//     }
// };

export async function getDashboardStats() {
    return await getDashboardStatsDao();
}

// Users
export async function listUsers() {
    return await getUserList();
}

export async function removeUser(id) {
    return await deleteUser(id);
}

export async function getUserById(id) {
    return await getUserByIdDao(id);
}

// Update user
export async function updateUser(id, data) {
    return await updateUserDao(id, data);
}

// Reports
export async function fetchReports() {
    return await getReports();
}

export async function globalSearchUsers(query) {
    return await searchUsers(query);
}

export async function globalSearchServices(query) {
    return await searchServices(query);
}

export async function globalSearchRequests(query) {
    return await searchRequests(query);
}
