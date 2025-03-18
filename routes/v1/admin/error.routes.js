const router = require("express").Router();
const errorController = require("../../../controllers/v1/admin/error.controller");

router.all("/404", errorController.error404);
router.all("/500", errorController.error500);

module.exports = router;