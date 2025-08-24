# Use the official Node.js image from the Docker Hub

FROM node:20-alpine

# Create and change to the app directory

WORKDIR /ShopCart

# Copy package.json and package-lock.json

COPY package*.json /ShopCart

# Install dependencies

RUN npm install && npm install -g javascript-obfuscator

# Copy the rest of the application code

COPY . .

# Obfuscate application code

RUN javascript-obfuscator . --output dist --compact true --control-flow-flattening true --self-defending true --exclude node_modules

# Move static content inside dist

RUN cp -r views dist/views && cp -r public/assets dist/public/assets && cp -r public/css dist/public/css

# Remove unnecessary folders and files

RUN rm -rf controllers models views middlewares routes helpers public index.js router.js package*.json

# Expose the port the app runs on

EXPOSE 2000

# Command to run the application

CMD ["node", "dist/index.js"]
# CMD ["node", "index.js"]