const constant = require("../../../config/constant");
const { StaticPage } = require("../../../models/static_page.model");
const { Category } = require("../../../models/category.model");
const { Blog } = require("../../../models/blogs.model");
const { News } = require("../../../models/news.model");
const { Testimonials } = require("../../../models/testimonials.model");
const { ContactUs, contactUsValidate } = require("../../../models/contact_us.model");
const { Location } = require("../../../models/location.model");

module.exports = {
    homepage: async (req, res) => {
        let bannerData = await StaticPage.findOne({ name: "home-page-banner", isDeleted: 0, status: true });
        let servicesData = await StaticPage.findOne({ name: "our-service", isDeleted: 0, status: true });
        let projectsData = await StaticPage.findOne({ name: "our-projects", isDeleted: 0, status: true });
        let locationData = await Location.find({ isDeleted: 0, status: true }).sort({ orderBy: 1 }).limit(4);
        return res.status(200).json({
            status: "success",
            message: "successfully data fetch",
            data: {
                bannerData: bannerData?.content || '',
                servicesData: servicesData?.content || '',
                projectsData: projectsData?.content || '',
                locationData: locationData || [],
                SHOWLOCATIONPATH: constant.DATA.SHOWLOCATIONPATH || ""
            }
        })
    },

    projectList: async (req, res) => {
        let result = await Category.find({ isDeleted: 0, status: true });
        return res.status(200).json({
            status: "success",
            message: "successfully fetch data",
            data: result
        })
    },

    aboutUs: async (req, res) => {
        let result = await StaticPage.findOne({ name: "about-us", isDeleted: 0, status: true });
        return res.status(200).json({
            status: "success",
            message: "successfully fetch data",
            data: result?.content || ''
        })
    },

    termsAndConditions: async (req, res) => {
        let result = await StaticPage.findOne({ name: "terms-and-conditions", isDeleted: 0, status: true });
        return res.status(200).json({
            status: "success",
            message: "successfully fetch data",
            data: result?.content || ''
        })
    },

    privacyOfUsers: async (req, res) => {
        let result = await StaticPage.findOne({ name: "privacy-of-users", isDeleted: 0, status: true });
        return res.status(200).json({
            status: "success",
            message: "successfully fetch data",
            data: result?.content || ''
        })
    },

    blogsList: async (req, res) => {
        let { pageno, limit } = req.body;
        pageno = (+pageno > 0) ? +pageno : constant.DATA.PAGE;
        limit = (+limit > 0) ? +limit : constant.DATA.LIMIT;
        let skip = (pageno - 1) * limit;
        let sort = { createdAt: -1 };
        let totalRecords = await Blog.countDocuments({ isDeleted: 0, status: true });
        let result = await Blog.find({ isDeleted: 0, status: true }).sort(sort).skip(skip).limit(limit);
        return res.status(200).json({
            status: "success",
            message: "successfully fetch data",
            data: {
                blogsList: result || [],
                totalRecords: totalRecords || 0,
                BASEIMAGEPATH: constant.DATA.SHOWBLOGSPATH
            }
        })
    },

    newsList: async (req, res) => {
        let { pageno, limit } = req.body;
        pageno = (+pageno > 0) ? +pageno : constant.DATA.PAGE;
        limit = (+limit > 0) ? +limit : constant.DATA.LIMIT;
        let skip = (pageno - 1) * limit;
        let sort = { createdAt: -1 };
        let totalRecords = await News.countDocuments({ isDeleted: 0, status: true });
        let result = await News.find({ isDeleted: 0, status: true }).sort(sort).skip(skip).limit(limit);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch data.",
            data: {
                list: result || [],
                totalRecords: totalRecords || 0,
                BASEIMAGEPATH: constant.DATA.SHOWNEWSPATH
            }
        })
    },

    testimonialsList: async (req, res) => {
        let { pageno, limit } = req.body;
        pageno = (+pageno > 0) ? +pageno : constant.DATA.PAGE;
        limit = (+limit > 0) ? +limit : constant.DATA.LIMIT;
        let skip = (pageno - 1) * limit;
        let sort = { createdAt: -1 };
        let totalRecords = await Testimonials.countDocuments({ isDeleted: 0, status: true });
        let result = await Testimonials.find({ isDeleted: 0, status: true }).sort(sort).skip(skip).limit(limit);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch data.",
            data: {
                list: result || [],
                totalRecords: totalRecords || 0,
                BASEIMAGEPATH: constant.DATA.SHOWTESTIMONIALSPATH
            }
        })
    },

    saveContactUs: async (req, res) => {
        const { error } = contactUsValidate(req.body);
        if (error) return res.status(200).json({
            status: "error",
            message: error.details[0].message,
            data: {}
        });
        let { name, email, mobile, message } = req.body;
        await new ContactUs({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: +mobile,
            message: message.trim()
        }).save();
        return res.status(200).json({
            status: "success",
            message: "Successfully save record.",
            data: {}
        })
    },

    footer: async (req, res) => {
        let footerData = await StaticPage.findOne({ name: "footer", isDeleted: 0, status: true });
        return res.status(200).json({
            status: "success",
            message: "successfully data fetch",
            data: footerData?.content || ''
        })
    },
}