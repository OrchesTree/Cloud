# Use the Node.js LTS image as the base
FROM node:18

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json and pnpm-lock.yaml for efficient caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy all source code into the container
COPY . .

# Build the Next.js app
RUN pnpm run build

# Expose the port that Next.js will run on
EXPOSE 3000


CMD [ "npm", "start" ]