const nodeScheduler = require("node-schedule");
const { FrontToken } = require("../models/front_token.model");

module.exports = {
    removeExpireFrontendToken: async () => {
        nodeScheduler.scheduleJob("0 */6 * * *", async function () {
            let date = new Date();
            date.setHours(date.getHours() - 6);
            await FrontToken.deleteMany({
                createdAt: { $lte: date }
            });
            return true;
        });
    }
}