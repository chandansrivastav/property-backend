const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/property_request.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_property_request", adminAuth, adminController.index);
router.post("/manage_property_request/list", adminAuth, adminController.list);
router.get("/manage_property_request/view_details/:id", adminAuth, adminController.viewDetails);
router.post("/manage_property_request/change_status/:id", adminAuth, adminController.changeStatus);

module.exports = router