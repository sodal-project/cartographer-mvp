# Cartographer

***NOTICE: This is an MVP stage project and should only be operated in secure, trusted environments***

Cartographer is the open-source reference implementation of Sodal's Persona Graph model for agency management. Cartographer demonstrates how persona graphs enable discovery and management of identities and resources (and associated collaboration opportunities and risks) *without* the need for comprehensive controls or top-down policy enforcement.

Cartographer is a self-contained application that can run locally or on docker-compatible cloud infrastructure. Cartographer uses a Node/Express server that serves data via an API to a React client. The server stores data in a Neo4j graph database.

### Setup

1. Install [Docker](https://docker.com) for your platform.
2. Copy the .env.example file to .env

The default configuration uses ports **3000**, **7474**, **7687**, as well as port **3001** if running the client separately

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
