



function getTokenFromBearerRequestHeader(authorizationHeader) {
    let token = authorizationHeader.split(' ') // "bearer token" no spaces after token
    if (token.length !== 2){
        return null
    }
    return token[1]
}

function secondsSinceEpoch() {
    return Math.floor(new Date().getTime() / 1000)
}

function extractRefreshToken(req){
    // get refresh token if it's a cookie else null
    let refreshToken = req.cookies.refresh_token || null
    let source = refreshToken? "cookie" : null
    // if not in cookie check if it's in body form field and get else null
    refreshToken = refreshToken? refreshToken : (req.body.refresh_token || null)
    source = source? "cookie" : "body"
    return {refreshToken: refreshToken, source: source}
}
      

module.exports = {
    getTokenFromBearerRequestHeader : getTokenFromBearerRequestHeader,
    secondsSinceEpoch : secondsSinceEpoch,
    extractRefreshToken : extractRefreshToken
}