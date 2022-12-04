



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
      

module.exports = {
    getTokenFromBearerRequestHeader : getTokenFromBearerRequestHeader,
    secondsSinceEpoch : secondsSinceEpoch
}