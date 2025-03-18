const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/static_page.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_static_page", adminAuth, adminController.index);
router.post("/manage_static_page/list", adminAuth, adminController.list);
router.all("/manage_static_page/add", adminAuth, adminController.add);
router.all("/manage_static_page/edit/:id", adminAuth, adminController.edit);
router.get("/manage_static_page/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_static_page/delete/:id", adminAuth, adminController.delete);

module.exports = router