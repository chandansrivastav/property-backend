module.exports = {
    error404: async (req, res) => {
        let title = "404";
        return res.render("v1/admin/404", { layout: "v1/admin/error_page_layout", title })
    },
    error500: async (req, res) => {
        let title = "500";
        return res.render("v1/admin/500", { layout: "v1/admin/error_page_layout", title })
    }
}