const { createClient } = require('redis')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const redisPassword = process.env.REDIS_PASS

async function redisConnect(password) {
    let client = null
    if (password){
        client = createClient({password: password});
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
