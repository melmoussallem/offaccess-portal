#!/bin/bash

# Railway Backend Deployment Script
echo "🚂 Starting Railway Backend Deployment..."

# Install only production dependencies
echo "📦 Installing production dependencies..."
npm install --only=production

# Copy server files to root for Railway
echo "📁 Setting up server files..."
cp -r server/* ./

# Start the server
echo "🚀 Starting server..."
node index.js 