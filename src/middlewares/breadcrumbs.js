export function buildBreadcrumbs(req, res, next) {
    const pathParts = req.path.split("/").filter(Boolean);
    let breadcrumbs = [];
    let url = "";

    pathParts.forEach((part, i) => {
        url += "/" + part;

        let label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");

        // Custom rules
        if (part === "dashboard") label = "Dashboard";
        if (part === "requests") label = "Requests";
        if (!isNaN(part)) label = `Request #${part}`;
        if (part === "profile") label = "Profile";

        breadcrumbs.push({ label, url });
    });

    res.locals.breadcrumbs = breadcrumbs;
    next();
}
