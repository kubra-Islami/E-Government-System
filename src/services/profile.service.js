import * as profileDAO from "../dao/profile.dao.js";

export const getProfileById = async (userId) => {
    return await profileDAO.fetchProfile(userId);
};

export const getRecentActivities = async (userId) => {
    return await profileDAO.fetchRecentActivities(userId);
};

export const updateProfile = async (userId, updates) => {
    return await profileDAO.updateProfile(userId, updates);
};
