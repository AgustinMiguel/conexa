# Use a specific version of Node.js
FROM node:18.16.0-alpine3.17

# Add the wait script
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

# Set the working directory
WORKDIR /app

# Copy the application code
COPY . .

# Install dependencies and build the application
RUN npm install 
RUN npm run build

# Expose the application's port
EXPOSE 3000

# Set the command to run the application, using the wait script to wait for the database
CMD /wait && npm run generate && npm run migrate:deploy && npm run start:prod
