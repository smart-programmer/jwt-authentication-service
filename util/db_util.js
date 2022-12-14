


function findUser(usersArray, username, password) {
    return usersArray.users.findIndex(user => {
        return (user.username === username && user.password === password)
    })
}

function findUserWithId(usersArray, id) {
    return usersArray.users.findIndex(user => {
        return user.id === id
    })
}

function replaceUser(usersArray, userIndex, newUser) {
    usersArray.splice(userIndex, 1) // remove the old user
    usersArray.push(newUser) // add the new user
}


module.exports = {
    findUser : findUser,
    replaceUser : replaceUser,
    findUserWithId : findUserWithId
}