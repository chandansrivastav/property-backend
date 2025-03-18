const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/news.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_news", adminAuth, adminController.index);
router.post("/manage_news/list", adminAuth, adminController.list);
router.all("/manage_news/add", adminAuth, adminController.add);
router.all("/manage_news/edit/:id", adminAuth, adminController.edit);
router.get("/manage_news/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_news/delete/:id", adminAuth, adminController.delete);

module.exports = router