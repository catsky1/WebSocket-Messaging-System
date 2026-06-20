const { createClient } = require("redis");

const publisher = createClient();
const subscriber = createClient();

async function connectRedis() {

    await publisher.connect();
    await subscriber.connect();

    console.log("Redis connected");
}

module.exports = {
    publisher,
    subscriber,
    connectRedis
};