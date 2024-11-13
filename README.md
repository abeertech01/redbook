# Redbook

**Redbook** is a social media app built with the PERN stack (PostgreSQL, Express, React, and Node.js). This README will guide you through the setup process to run the project using Docker, including necessary environment variables and migration steps.

## Prerequisites

- Ensure you have Docker and Docker Compose installed on your machine.
- Clone the repository to your local machine.

## Project Structure

```bash
pern-stack/
 client/          # Contains the frontend (React)
 server/          # Contains the backend (Express, Node.js)
 docker-compose.yaml
 ...
```

## Setting Up Environment Variables

Before running the project, you need to set up environment variables for both the **client** and **server**:

1. Copy the `example.env` file located in each folder (`client` and `server`) and rename it to `.env`:

   ```bash
   cp client/example.env client/.env
   cp server/example.env server/.env
   ```

2. Fill in the required values in each .env file as specified in the example.env file.

## Running the Project

Once the environment variables are set up, you can start the project using Docker Compose.

Start the Docker Containers: <br>
Run the following command to build and start all services in detached mode:

```bash
docker compose up -d
```

This command will set up the following services:

- PostgreSQL: The database service with persistent volume storage.
- Migration: Prisma migration service. This will migrate the prisma schema to get the database ready.
- Server: The Node.js backend running on http://localhost:3030.
- Client: The React frontend running on http://localhost:5173.

## Accessing the Application

- Frontend: http://localhost:5173 - The main entry point for the Redbook application.
- Backend: http://localhost:3030 - The API server where backend services are exposed.

## Stopping the Services

To stop the running containers, use:

```bash
docker compose down
```

This command will stop all services and remove the associated containers.

## Troubleshooting

- Environment Variables Not Loading: Ensure that the .env files are properly configured and located in the correct folders (client/.env and server/.env).
- Ports Already in Use: If you encounter port conflicts, make sure that the ports 5173 (client) and 3030 (server) are available on your machine.

## Contributing

If you'd like to contribute to Redbook, feel free to fork the repository and submit a pull request. I welcome contributions that demonstrates weak points of the project.
