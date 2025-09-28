import {
    deleteUser,
    getReports,
    getDashboardStatsDao,
    getUserList,
    searchUsers,
    searchServices, searchRequests, updateUserDao, getUserByIdDao, getAdminReports
} from "../dao/admin.dao.js";

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

export async function globalSearchUsers(query) {
    return await searchUsers(query);
}

export async function globalSearchServices(query) {
    return await searchServices(query);
}

export async function globalSearchRequests(query) {
    return await searchRequests(query);
}
// Reports
export async function getReportsAdmin() {
    return await getAdminReports();
}