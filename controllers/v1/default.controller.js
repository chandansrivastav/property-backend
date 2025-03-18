module.exports = {
    checkV1ApiStatus: async (req, res) => {
        return res.status(200).json({
            status: "success",
            message: "v1 api server is up and running.... ⚡️⚡️⚡️⚡️⚡️⚡️⚡️",
            data: {}
        })
    }
}