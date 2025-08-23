import db from "../config/db.js";

export const getDashboardStats = async () => {
    try {
        // Total requests
        const totalRequestsResult = await db.query(
            "SELECT COUNT(*) AS total_requests FROM requests"
        );


        const approvedResult = await db.query(
            "SELECT COUNT(*) AS approved FROM requests WHERE status = 'approved'"
        );


        const rejectedResult = await db.query(
            "SELECT COUNT(*) AS rejected FROM requests WHERE status = 'rejected'"
        );

        return {
            total_requests: totalRequestsResult.rows[0].total_requests,
            approved: approvedResult.rows[0].approved,
            rejected: rejectedResult.rows[0].rejected
        };
    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        throw err;
    }
};
