const router = require("express").Router();
const defaultController = require("../../controllers/v1/default.controller");

router.get("/", defaultController.checkV1ApiStatus);

module.exports = router;