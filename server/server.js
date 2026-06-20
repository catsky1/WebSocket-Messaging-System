const pool = require("./db");
const WebSocket = require("ws");

const {
    publisher,
    subscriber,
    connectRedis
} = require("./redisClient");

const {
    addUser,
    removeUser,
    getUser
} = require("./userManager");

const {
    joinRoom,
    leaveRoom,
    getClients
} = require("./roomManager");

const PORT = process.argv[2] || 8080;

const wss = new WebSocket.Server({
    port: PORT
});

async function start() {

    await connectRedis();

    // ROOM PUBSUB
    await subscriber.pSubscribe("room:*", (message, channel) => {

        const room = channel.split(":")[1];

        const clients = getClients(room);

        if (!clients) return;

        clients.forEach(client => {

            if (client.readyState === WebSocket.OPEN) {

                client.send(message);

            }

        });

    });

    // DIRECT MESSAGE PUBSUB
    await subscriber.subscribe("dm", async (message) => {

        const data = JSON.parse(message);

        const target = getUser(data.to);

        if (
            target &&
            target.readyState === WebSocket.OPEN
        ) {

            target.send(
                JSON.stringify({
                    type: "dm",
                    id: data.id,
                    from: data.from,
                    text: data.text
                })
            );

            await pool.query(
                `
                UPDATE messages
                SET status='DELIVERED',
                    delivered_at=NOW()
                WHERE id=$1
                `,
                [data.id]
            );

        }

    });

}

start();

wss.on("connection", (ws) => {

    ws.userId = null;
    ws.room = null;

    console.log("Client connected");

    ws.on("message", async (msg) => {

        const data = JSON.parse(msg.toString());

        // REGISTER
        if (data.type === "register") {

            ws.userId = data.userId;

            addUser(
                data.userId,
                ws
            );

            console.log(`${data.userId} online`);

            // SEND PENDING MESSAGES
            const pending = await pool.query(
                `
                SELECT *
                FROM messages
                WHERE receiver=$1
                AND status='SENT'
                ORDER BY created_at
                `,
                [data.userId]
            );

            for (const message of pending.rows) {

                ws.send(
                    JSON.stringify({
                        type: "dm",
                        id: message.id,
                        from: message.sender,
                        text: message.content
                    })
                );

                await pool.query(
                    `
                    UPDATE messages
                    SET status='DELIVERED',
                        delivered_at=NOW()
                    WHERE id=$1
                    `,
                    [message.id]
                );

            }

        }

        // JOIN ROOM
        else if (data.type === "join") {

            ws.room = data.room;

            joinRoom(
                data.room,
                ws
            );

            console.log(
                `${ws.userId} joined ${data.room}`
            );

        }

        // ROOM MESSAGE
        else if (data.type === "message") {

            await publisher.publish(
                `room:${data.room}`,
                `[${ws.userId}] ${data.text}`
            );

        }

        // DIRECT MESSAGE
        else if (data.type === "dm") {

            const result = await pool.query(
                `
                INSERT INTO messages(
                    sender,
                    receiver,
                    content,
                    status
                )
                VALUES($1,$2,$3,'SENT')
                RETURNING *
                `,
                [
                    ws.userId,
                    data.to,
                    data.text
                ]
            );

            const message = result.rows[0];

            await publisher.publish(
                "dm",
                JSON.stringify({
                    id: message.id,
                    from: message.sender,
                    to: message.receiver,
                    text: message.content
                })
            );

        }

        // READ RECEIPT
        else if (data.type === "read") {

            await pool.query(
                `
                UPDATE messages
                SET status='READ',
                    read_at=NOW()
                WHERE id=$1
                `,
                [data.id]
            );

        }

    });

    ws.on("close", () => {

        if (ws.userId) {

            removeUser(
                ws.userId
            );

            console.log(
                `${ws.userId} offline`
            );

        }

        if (ws.room) {

            leaveRoom(
                ws.room,
                ws
            );

        }

    });

});

console.log(`Server running on ${PORT}`);