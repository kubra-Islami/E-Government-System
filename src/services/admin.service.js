import {
    deleteUser,
    getReports,
    getDashboardStatsDao,
    getUserList,
    searchUsers,
    searchServices, searchRequests, updateUserDao, getUserByIdDao
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
