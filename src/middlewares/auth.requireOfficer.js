export const ensureOfficer = (req, res, next) => {
    if (req.user && (req.user.role === 'officer' || req.user.role === 'dept_head' || req.user.role === 'admin')) return next();
    return res.status(403).send('Forbidden');
};

export function ensureAuthenticated(req, res, next) {
    if (req.user) return next();
    return res.redirect('/login');
}