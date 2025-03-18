const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/contact_us.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_contact_us", adminAuth, adminController.index);
router.post("/manage_contact_us/list", adminAuth, adminController.list);
router.get("/manage_contact_us/view_details/:id", adminAuth, adminController.viewDetails);
router.post("/manage_contact_us/change_status/:id", adminAuth, adminController.changeStatus);

module.exports = router