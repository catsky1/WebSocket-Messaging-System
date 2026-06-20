const users = new Map();

function addUser(userId, ws) {
    users.set(userId, ws);
}

function removeUser(userId) {
    users.delete(userId);
}

function getUser(userId) {
    return users.get(userId);
}

module.exports = {
    addUser,
    removeUser,
    getUser
};