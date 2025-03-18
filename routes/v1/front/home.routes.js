const router = require("express").Router();
const { apiAuth } = require("../../../middlewares/auth.middleware");
const frontController = require("../../../controllers/v1/front/home.controller");

router.get("/home_page", apiAuth, frontController.homepage);
router.get("/project_list", apiAuth, frontController.projectList);
router.get("/about_us", apiAuth, frontController.aboutUs);
router.get("/terms_and_conditions", apiAuth, frontController.termsAndConditions);
router.get("/privacy_of_users", apiAuth, frontController.privacyOfUsers);
router.post("/blogs_list", apiAuth, frontController.blogsList);
router.post("/news_list", apiAuth, frontController.newsList);
router.post("/testimonials_list", apiAuth, frontController.testimonialsList);
router.post("/contact_us", apiAuth, frontController.saveContactUs);
router.get("/footer", apiAuth, frontController.footer);

module.exports = router;