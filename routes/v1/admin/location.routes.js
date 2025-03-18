const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/location.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_location", adminAuth, adminController.index);
router.post("/manage_location/list", adminAuth, adminController.list);
router.all("/manage_location/add", adminAuth, adminController.add);
router.all("/manage_location/edit/:id", adminAuth, adminController.edit);
router.get("/manage_location/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_location/delete/:id", adminAuth, adminController.delete);

module.exports = router