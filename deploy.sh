#!/bin/bash

echo "🚀 PWA Barcode Scanner - Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Make sure you're in the PWA directory."
    exit 1
fi

echo "✅ Files found. Starting local server..."

# Start local server
echo "🌐 Starting HTTP server on port 8080..."
echo "📱 Open http://localhost:8080 in your browser"
echo "📱 Or access from phone using your computer's IP address"
echo ""
echo "💡 To install as PWA:"
echo "   1. Open the URL on your phone"
echo "   2. Look for 'Add to Home Screen' or 'Install App' option"
echo "   3. Follow the prompts to install"
echo ""
echo "🔍 Test barcode: 5940031059798"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8080
