# WebSocket Messaging System

A simple chat application built with Node.js, WebSockets, and PostgreSQL. The system supports real-time communication, stores messages in a database, and ensures that users receive messages even if they were offline when the message was sent.

## Features

* Real-time messaging using WebSockets
* Persistent message storage with PostgreSQL
* Offline message delivery after reconnection
* Message delivery and read acknowledgements
* Chat history stored in the database
* Support for multiple users connected at the same time

## Tech Stack

* Node.js
* WebSocket (ws)
* PostgreSQL
* HTML, CSS, JavaScript

## How It Works

1. Users connect to the WebSocket server.
2. Messages are exchanged instantly when both users are online.
3. Every message is stored in PostgreSQL.
4. If the receiver is offline, the message remains in the database.
5. Once the receiver reconnects, all pending messages are delivered automatically.
6. Delivery and read status are updated as messages are received and opened.

## Project Structure

```
.
├── server/server.js
├── db.js
├── client/client1.html client2.html
├── package.json
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

```sql
CREATE DATABASE chatdb;
```

Create the messages table:

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(50),
    receiver VARCHAR(50),
    content TEXT,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Configure the database connection

Update the PostgreSQL credentials in `db.js`.

```javascript
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "chatdb",
    password: "your_password",
    port: 5432
});
```

### 5. Start the server

```bash
node server.js
```

### 6. Open the clients

Open `client1.html` and `client2.html` in your browser and start chatting.

## Example

* Alice sends a message to Bob.
* If Bob is online, he receives it immediately.
* If Bob is offline, the message is stored in PostgreSQL.
* When Bob reconnects, all undelivered messages are automatically sent to him.
* Messages are marked as delivered and later as read.

## Future Improvements

* Group chats
* Typing indicators
* File sharing
* Message reactions
* Authentication and user accounts
* Redis Pub/Sub for scaling across multiple servers
* Load balancing and horizontal scaling
* Media and attachment support
* End-to-end encryption
