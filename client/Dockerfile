FROM node:18

# Set the working directory
WORKDIR /client

# Copy code into the container
COPY ./package*.json ./

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies
RUN npm install

# Define the startup command for the server
CMD npm install && npm start --host 0.0.0.0 --port 3000 --disableHostCheck true