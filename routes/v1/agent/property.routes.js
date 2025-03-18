const router = require("express").Router();
const agentController = require("../../../controllers/v1/agent/property.controller");
const { agentAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_property", agentAuth, agentController.index);
router.post("/manage_property/list", agentAuth, agentController.list);
router.all("/manage_property/add", agentAuth, agentController.add);
router.all("/manage_property/edit/:id", agentAuth, agentController.edit);
router.all("/manage_property/view_details/:id", agentAuth, agentController.viewDetails);
router.get("/manage_property/change_status/:id", agentAuth, agentController.changeStatus);
router.get("/manage_property/delete/:id", agentAuth, agentController.delete);

module.exports = router