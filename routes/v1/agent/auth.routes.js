const router = require("express").Router();
const auth = require("../../../controllers/v1/agent/auth.controller");
const { agentLoginAuth, agentAuth } = require("../../../middlewares/auth.middleware");

router.all("/", agentLoginAuth, auth.login);
router.all("/register", agentLoginAuth, auth.register);
router.all("/forgot-password", agentLoginAuth, auth.forgotPassword);
router.all("/reset-password/:token", agentLoginAuth, auth.resetPassword);
router.all("/logout", auth.logout);
router.all("/manage_profile", agentAuth, auth.profileUpdate);
router.all("/manage_change_password", agentAuth, auth.changePassword);

module.exports = router;