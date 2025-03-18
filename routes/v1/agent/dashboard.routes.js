const router = require("express").Router();
const agentController = require("../../../controllers/v1/agent/dashboard.controler");
const { agentAuth } = require("../../../middlewares/auth.middleware");

router.all("/dashboard", agentAuth, agentController.dashboard);

module.exports = router