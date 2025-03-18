const ENV = process.env;
const path = require("path");
const ENV_SITE_URL = ENV.SITE_URL;
const BASE_PATH = path.resolve(__dirname, "../public/");
let SITE_URL = "";
if (ENV.NODE_ENV == "prod") {
    SITE_URL = ENV_SITE_URL;
} else {
    SITE_URL = ENV_SITE_URL + ":" + ENV.PORT;
}

module.exports = {
    SECRETCONFIG: {
        PORT: ENV.PORT || 1010,
        MONGO_URL: ENV.MONGO_URL || "mongodb://localhost:27017/",
        DB_NAME: ENV.DB_NAME || "test",
        SESSION_SECRET: ENV.SESSION_SECRET || "Test_dfnjdsJEBFHWVGWRT#R@Y23NDjsdnds",
        FRONT_SECRET_KEY: ENV.FRONT_SECRET_KEY || "Test_jdbajsdjsdhuBFHDEe23e7^%$5q2e12refdTFDFRW_front",
        AGENT_FORGOT_JWT_SECRET: ENV.AGENT_FORGOT_JWT_SECRET || "Test_jdjshddygd6dt6%$#^5723et23g7e265r64e_AGENT",
        SENDGRID_API_KEY: ENV.SENDGRID_API_KEY,
        SENDGRID_SEND_EMAIL: ENV.SENDGRID_SEND_EMAIL
    },
    DATA: {
        PAGE: 1,
        LIMIT: 20,
        SITE_URL: SITE_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
        WWWFRONTEND_URL: process.env.WWWFRONTEND_URL,
        DEFAULTDATEFORMAT: "DD-MM-YYYY hh:mm:ss A",
        SITENAME: ENV.SITENAME || "Test",
        LOGO: "/assets/dist/img/AdminLTELogo.png",
        FAVICON: "/assets/dist/img/AdminLTELogo.png",
        FOOTERDATA: "Copyright 2022-2024",
        NOPROFILE: "/assets/media/no_profile.jpg",
        NOIMAGE: "/assets/media/no_image.png",
        UPLOADADMINIMAGEPATH: BASE_PATH + "/uploads/admin/",
        SHOWADMINIMAGEPATH: "/uploads/admin/",
        UPLOADAGENTIMAGEPATH: BASE_PATH + "/uploads/agent/",
        SHOWAGENTIMAGEPATH: "/uploads/agent/",
        UPLOADTESTIMONIALSPATH: BASE_PATH + "/uploads/testimonials/",
        SHOWTESTIMONIALSPATH: "/uploads/testimonials/",
        UPLOADBLOGSPATH: BASE_PATH + "/uploads/blogs/",
        SHOWBLOGSPATH: "/uploads/blogs/",
        UPLOADNEWSPATH: BASE_PATH + "/uploads/news/",
        SHOWNEWSPATH: "/uploads/news/",
        UPLOADLOCATIONPATH: BASE_PATH + "/uploads/location/",
        SHOWLOCATIONPATH: "/uploads/location/",
        UPLOADPROPERTYPATH: BASE_PATH + "/uploads/property/",
        SHOWPROPERTYPATH: "/uploads/property/",
        UPLOADSTATICIMAGEPATH: BASE_PATH + "/uploads/static_images/",
        SHOWSTATICIMAGEPATH: "/uploads/static_images/"
    }
}