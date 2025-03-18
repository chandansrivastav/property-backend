const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/blogs.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_blogs", adminAuth, adminController.index);
router.post("/manage_blogs/list", adminAuth, adminController.list);
router.all("/manage_blogs/add", adminAuth, adminController.add);
router.all("/manage_blogs/edit/:id", adminAuth, adminController.edit);
router.get("/manage_blogs/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_blogs/delete/:id", adminAuth, adminController.delete);

module.exports = router