let {
    errorHandler,
    invalidRoutes,
    adminInvalidRoutes,
    agentInvalidRoutes,
    frontInvalidRoutes
} = require("../middlewares/errorHandler")
module.exports = (app) => {
    //Check api's
    app.use("/v1", require("../routes/v1/default.routes"))

    //Admin routes
    app.use("/v1/admin", require("../routes/v1/admin/auth.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/dashboard.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/static_page.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/testimonials.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/blogs.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/news.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/location.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/category.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/property.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/property_request.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/agent.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/contact_us.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/static_images.routes"));
    app.use("/v1/admin", require("../routes/v1/admin/error.routes"));
    app.use("/v1/admin/*", adminInvalidRoutes);

    //Agent routes
    app.use("/v1/agent", require("../routes/v1/agent/auth.routes"));
    app.use("/v1/agent", require("../routes/v1/agent/dashboard.routes"));
    app.use("/v1/agent", require("../routes/v1/agent/property.routes"));
    app.use("/v1/agent", require("../routes/v1/agent/error.routes"));
    app.use("/v1/agent/*", agentInvalidRoutes);

    //Front routes
    app.use("/v1/api/", require("../routes/v1/front/home.routes"));
    app.use("/v1/api/", require("../routes/v1/front/property.routes"));
    app.use("/v1/api/*", frontInvalidRoutes);

    //Exception handler routes
    app.use("*", invalidRoutes);
    app.use(errorHandler)
}