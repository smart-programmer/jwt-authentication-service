



function getTokenFromBearerRequestHeader(authorizationHeader) {
    let token = authorizationHeader.split(' ') // "bearer token" no spaces after token
    if (token.length !== 2){
        return null
    }
    return token[1]
}

module.exports = {
    getTokenFromBearerRequestHeader : getTokenFromBearerRequestHeader
}