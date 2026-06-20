const rooms = new Map();

function joinRoom(room, ws) {

    if (!rooms.has(room)) {
        rooms.set(room, new Set());
    }

    rooms.get(room).add(ws);
}

function leaveRoom(room, ws) {

    if (!rooms.has(room)) return;

    rooms.get(room).delete(ws);

    if (rooms.get(room).size === 0) {
        rooms.delete(room);
    }
}

function getClients(room) {
    return rooms.get(room);
}

module.exports = {
    joinRoom,
    leaveRoom,
    getClients
};