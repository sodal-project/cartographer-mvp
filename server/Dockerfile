# Use an appropriate base image for your Node.js server
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the server code into the container
COPY . .

# Install dependencies
RUN npm install
RUN npm install -g nodemon

# Define the startup command for the server
CMD ["npm", "start"]