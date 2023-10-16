FROM node:18

# Set the working directory
WORKDIR /client

# Copy code into the container
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Define the startup command for the server
CMD ["npm", "start"]
