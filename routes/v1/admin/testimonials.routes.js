const router = require("express").Router();
const adminController = require("../../../controllers/v1/admin/testimonials.controller");
const { adminAuth } = require("../../../middlewares/auth.middleware");

router.all("/manage_testimonial", adminAuth, adminController.index);
router.post("/manage_testimonial/list", adminAuth, adminController.list);
router.all("/manage_testimonial/add", adminAuth, adminController.add);
router.all("/manage_testimonial/edit/:id", adminAuth, adminController.edit);
router.get("/manage_testimonial/change_status/:id", adminAuth, adminController.changeStatus);
router.get("/manage_testimonial/delete/:id", adminAuth, adminController.delete);

module.exports = router