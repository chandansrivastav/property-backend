const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/agent.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_agent", adminAuth, adminController.index);
router.post("/manage_agent/list", adminAuth, adminController.list);
router.all("/manage_agent/add", adminAuth, adminController.add);
router.all("/manage_agent/edit/:id", adminAuth, adminController.edit);
router.all("/manage_agent/view_details/:id", adminAuth, adminController.viewDetails);
router.get("/manage_agent/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_agent/delete/:id", adminAuth, adminController.delete);
router.post("/manage_agent/verify_agent", adminAuth, adminController.verifyAgent);

module.exports = router