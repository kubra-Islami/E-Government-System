import {getDashboardStats} from "../services/admin.service.js";

export const getAdminDashboard = async (req, res, next) => {
    try {
        const stats = await getDashboardStats();
        res.render("admin/dashboard", {
            title: "Admin Dashboard",
            user: req.user,
            stats
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};
