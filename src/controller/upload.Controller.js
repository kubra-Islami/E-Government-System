import {createRequest, saveDocument} from "../services/requests.service.js";
import * as profileService from "../services/profile.service.js";


export const handleUpload = async (req, res, next) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const formData = req.body;
        const files = req.files || [];

        // Save request
        const request = await createRequest({
            citizen_id: userId,
            service_id: serviceId,
            status: "submitted",
            form_data: JSON.stringify(formData),
        });

        // Save uploaded files
        for (const file of files) {
            await saveDocument({
                request_id: request.id,
                file_path: `/uploads/${file.filename}`,
                original_name: file.originalname,
            });
        }

        // Redirect based on role
        let redirectPath = "/";
        switch (userRole) {
            case "citizen":
                redirectPath = "/citizen/requests";
                break;
            case "officer":
                redirectPath = "/officer/requests";
                break;
            case "department_head":
                redirectPath = "/department_head/requests";
                break;
            case "admin":
                redirectPath = "/admin/requests";
                break;
            default:
                redirectPath = "/";
        }

        res.redirect(redirectPath);
    } catch (err) {
        console.error("Error uploading documents:", err);
        next(err);
    }
};


// POST upload avatar
export const uploadAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;
        const userRole = req.user.role;

        if (avatarPath) {
            await profileService.updateProfile(userId, { avatar: avatarPath });
        }

        let redirectPath = "/";
        switch (userRole) {
            case "citizen":
                redirectPath = "/citizen/profile";
                break;
            case "officer":
                redirectPath = "/officer/profile";
                break;
            case "department_head":
                redirectPath = "/department_head/profile";
                break;
            case "admin":
                redirectPath = "/admin/profile";
                break;
            default:
                redirectPath = "/";
        }
        res.redirect(redirectPath);

    } catch (err) {
        next(err);
    }
};