const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/dashboard.controler");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/dashboard", adminAuth, adminController.dashboard);

module.exports = router