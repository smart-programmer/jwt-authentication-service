const { createClient } = require('redis')
const path = require('path')

async function redisConnect(url) {
    let client = null
    if (password){
        client = createClient({url: process.env.REDIS_URI});
    } else {
        client = createClient();
    }
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    return client
}

async function checkBlacklistedToken(token) {
    const client = await redisConnect(redisPassword)
    const value = await client.get(token);
    client.disconnect()
    return value
}

async function blackListToken(token, reason, expirationTime) {
    const client = await redisConnect(redisPassword)
    await client.set(token, reason, {EX: expirationTime});
}

checkBlacklistedToken("test").then((value) => {
    console.log(value)
})

module.exports = {
    checkBlacklistedToken : checkBlacklistedToken,
    blackListToken : blackListToken
}
