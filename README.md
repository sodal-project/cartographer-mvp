# Cartographer

The Cartographer project has a Node/Express server that serves data via an API to a React client. The server stores data in a Neo4j graph database.

### Setup

1. Install [Docker](https://docker.com) for your platform.
2. Copy the .env.example file to .env, if running through a tunnel add a TUNNEL_TOKEN value

TODO: Explain how the tunnel works and how to get the token

### Start

This terminal command will start the app, database and tunnel. The first time it runs it will need to download files which may take several minutes.

``` bash
cd [your-path]/cartographer
docker-compose up
```

The processes will run in a single terminal window (they are color coded). You can view the front end by visiting <http://localhost:3001> in your browser window.

This startup process will only work if you have a TUNNEL_TOKEN in your .env file.

### LOCAL DEVELOPMENT

If you are developing locally you must also manually start the client.

1. Move into the client directory ```cd client```
2. Install dependencies ```npm install```
3. Start the client ```npm start```

This will launch a client at <http://localhost:3000> that will use React Hot Module Replacement to show code updates as you work.
