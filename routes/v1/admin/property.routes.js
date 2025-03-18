const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/property.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_property", adminAuth, adminController.index);
router.post("/manage_property/list", adminAuth, adminController.list);
router.all("/manage_property/add", adminAuth, adminController.add);
router.all("/manage_property/edit/:id", adminAuth, adminController.edit);
router.all("/manage_property/view_details/:id", adminAuth, adminController.viewDetails);
router.get("/manage_property/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_property/delete/:id", adminAuth, adminController.delete);
router.post("/manage_property/change_property_status", adminAuth, adminController.changePropertyStatus);

module.exports = router