exports.fileSizeValidate = function (req, res, next) {
    if (req.files) {
        for (let fileKay in req.files) {
            let files = Array.isArray(req.files[fileKay]) ? req.files[fileKay] : [req.files[fileKay]];
            for (let file of files) {
                if (file?.size && file?.size / 1000000 > 2) {
                    req.flash("message", { message: file.name + " size is more than 2 mb.", status: false });
                    return res.redirect(req.url);
                }
            }
        }
    }
    next();
}