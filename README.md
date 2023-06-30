# Cartographer

The Cartographer project has a Node/Express server that serves data via an API to a React client. The server stores data in a Neo4j graph database.

## Running the project

This project is configured to run locally on your computer using [Docker](https://docker.com). It will run three separate processes.

1. A React Frontend Client
2. A Node JS Backend API Server
3. A Neo4j Database

To run the project first install [Docker](https://docker.com) for your platform.

### Start

This terminal command will start the frontend client, backend server and the database. The first time it runs it will need to download files which may take several minutes.

``` bash
cd [your-path]/cartographer
docker-compose up
```

The processes will run in a single terminal window (they are color coded). You can view the front end by visiting `http://localhost:3000` in your browser window.

### Stop

Open a new teminal window and run the following command to gracefully stop the three services.

``` bash
cd [your-path]/cartographer
docker-compose down
```
