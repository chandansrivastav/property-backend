const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/category.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_category", adminAuth, adminController.index);
router.post("/manage_category/list", adminAuth, adminController.list);
router.all("/manage_category/add", adminAuth, adminController.add);
router.all("/manage_category/edit/:id", adminAuth, adminController.edit);
router.get("/manage_category/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_category/delete/:id", adminAuth, adminController.delete);

module.exports = router