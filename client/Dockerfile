# Use an appropriate base image for your React client
FROM node:18

# Set the working directory
WORKDIR /

# Copy the client code into the container
COPY . .

# Install dependencies
RUN npm install

# Build the React app
RUN npm run build

# Specify the command to serve the built React app
CMD ["npm", "run", "start"]