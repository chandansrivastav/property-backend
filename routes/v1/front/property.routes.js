const router = require("express").Router();
const { apiAuth } = require("../../../middlewares/auth.middleware");
const frontController = require("../../../controllers/v1/front/property.controller");

router.post("/property_list", apiAuth, frontController.propertyList);
router.get("/property_details/:id", apiAuth, frontController.propertyDetails);
router.post("/property_req_add", apiAuth, frontController.propertyReqAdd);

module.exports = router;