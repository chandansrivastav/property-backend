const router = require("express").Router();
const auth = require("../../../controllers/v1/admin/auth.controller");
const { adminLoginAuth, adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/", adminLoginAuth, auth.login);
router.all("/logout", auth.logout);
router.all("/manage_profile", adminAuth, auth.profileUpdate);
router.all("/manage_change_password", adminAuth, auth.changePassword);

module.exports = router;