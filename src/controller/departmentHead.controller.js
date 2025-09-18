import * as DepartmentHeadService from "../services/departmentHead.service.js";

export async function getDashboard(req, res) {
    try {
        const departmentId = req.user.department_id;

        // Fetch stats
        const stats = await DepartmentHeadService.getDepartmentStats(departmentId);

        // Fetch recent requests
        const recentRequests = await DepartmentHeadService.getRequests(departmentId);

        res.render("department_head/dashboard", {
            layout: "layouts/department_head",
            title: "Dashboard",
            user: req.user,
            stats,
            recentRequests
        });
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        res.status(500).send("Internal Server Error");
    }
}


export async function listOfficers(req, res) {
    const officers = await DepartmentHeadService.getOfficers(req.user.department_id);

    res.render("department_head/officers", {
        layout: "layouts/department_head",
        users: req.user,
        title: "Manage Officers",
        officers,
        departments: await DepartmentHeadService.getDepartments()
    });
}


export async function addOfficer(req, res)
{
    await DepartmentHeadService.addOfficer(req.user.department_id, req.body);
    res.redirect("/department_head/officers");
}


export async function deleteOfficer(req, res)
{
    await DepartmentHeadService.removeOfficer(req.params.id, req.user.department_id);
    res.redirect("/department_head/officers");
}


export async function listRequests(req, res) {
    const requests = await DepartmentHeadService.getRequests(req.user.department_id);
    res.render("department_head/requests", {layout: "layouts/department_head" ,title: "Department Requests", requests});
}


export async function requestDetails(req, res)
{
    const request = await DepartmentHeadService.getRequestById(req.params.id, req.user.department_id);
    res.render("department_head/request_detail", {layout: "layouts/department_head" ,title: "Request Detail", request});
}


export async function getReports(req, res) {
    try {
        const departmentId = req.user.department_id;

        // Extract query parameters for filtering (optional)
        const { officerId, status, startDate, endDate } = req.query;

        // Build a filter object
        const filter = { departmentId };

        if (officerId) filter.officerId = officerId;
        if (status) filter.status = status;
        if (startDate) filter.startDate = startDate;
        if (endDate) filter.endDate = endDate;

        // Fetch reports from service
        const reports = await DepartmentHeadService.getDepartmentReports(filter);

        // Optionally, fetch department officers for filtering dropdown
        const officers = await DepartmentHeadService.getOfficers(departmentId);

        res.render("department_head/reports", {
            layout: "layouts/department_head",
            title: "Department Reports",
            reports,
            officers,
            filters: { officerId, status, startDate, endDate }
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).render("department_head/reports", {
            layout: "layouts/department_head",
            title: "Department Reports",
            reports: [],
            officers: [],
            filters: {},
            error: "Failed to load reports. Please try again later."
        });
    }
}


