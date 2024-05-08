# Cartographer

The Cartographer project has a Node/Express server that serves data via an API to a React client. The server stores data in a Neo4j graph database.

### Setup

1. Install [Docker](https://docker.com) for your platform.
2. Copy the .env.example file to .env

### Start

This terminal command will start the app and database. The first time it runs it will need to download files which may take several minutes.

``` bash
docker-compose up
```

The processes will run in a single terminal window (they are color coded). You can view the front end by visiting <http://localhost:3001> in your browser window.

### Development

To run a development instance of the client, open a new terminal window and run:

``` bash
npm run devclient
```

This will launch a client at <http://localhost:3000> that will use React Hot Module Replacement to show code updates as you work.
