const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/static_images.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_static_image", adminAuth, adminController.index);
router.post("/manage_static_image/list", adminAuth, adminController.list);
router.all("/manage_static_image/add", adminAuth, adminController.add);
router.get("/manage_static_image/delete/:id", adminAuth, adminController.delete);

module.exports = router