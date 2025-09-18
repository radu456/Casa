// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Local database with test product
const productDatabase = {
    '5940031059798': {
        title: 'Produs Test - Ciocolată Milka',
        image: 'https://via.placeholder.com/150x150/8B4513/FFFFFF?text=Milka',
        price: '12.50 RON',
        barcode: '5940031059798'
    }
};

class BarcodeScanner {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.scanButton = document.getElementById('scanButton');
        this.cameraContainer = document.getElementById('cameraContainer');
        this.video = document.getElementById('video');
        this.closeCamera = document.getElementById('closeCamera');
        this.status = document.getElementById('status');
        this.productInfo = document.getElementById('productInfo');
        this.productImage = document.getElementById('productImage');
        this.productTitle = document.getElementById('productTitle');
        this.productBarcode = document.getElementById('productBarcode');
        this.productPrice = document.getElementById('productPrice');
    }

    bindEvents() {
        this.scanButton.addEventListener('click', () => this.startScanning());
        this.closeCamera.addEventListener('click', () => this.stopScanning());
    }

    showStatus(message, type = 'success') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        this.status.style.display = 'block';
        
        setTimeout(() => {
            this.status.style.display = 'none';
        }, 3000);
    }

    async startScanning() {
        try {
            this.scanButton.disabled = true;
            this.scanButton.textContent = '📷 Se inițializează camera...';
            this.productInfo.classList.remove('show');

            // Show camera container
            this.cameraContainer.style.display = 'block';

            // Initialize Html5QrCode
            this.html5QrCode = new Html5Qrcode("video");

            // Get camera devices
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                const cameraId = devices[0].id;
                
                // Start scanning
                await this.html5QrCode.start(
                    cameraId,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 150 },
                        aspectRatio: 1.777778
                    },
                    (decodedText, decodedResult) => {
                        this.onScanSuccess(decodedText, decodedResult);
                    },
                    (errorMessage) => {
                        // Handle scan errors silently
                        console.log('Scan error:', errorMessage);
                    }
                );

                this.isScanning = true;
                this.scanButton.textContent = '📷 Scanare în curs...';
                this.showStatus('Camera activată. Îndreaptă telefonul spre codul de bare.', 'success');
            } else {
                throw new Error('Nu s-au găsit camere disponibile');
            }
        } catch (err) {
            console.error('Error starting scanner:', err);
            this.showStatus('Eroare la pornirea camerei: ' + err.message, 'error');
            this.resetScanButton();
            this.cameraContainer.style.display = 'none';
        }
    }

    async onScanSuccess(decodedText, decodedResult) {
        console.log('Barcode detected:', decodedText);
        
        // Stop scanning immediately
        await this.stopScanning();
        
        // Look up product in database
        const product = productDatabase[decodedText];
        
        if (product) {
            this.displayProduct(product);
            this.showStatus('✅ Produs găsit!', 'success');
        } else {
            this.showStatus('❌ Produsul cu codul ' + decodedText + ' nu a fost găsit în baza de date.', 'error');
        }
    }

    async stopScanning() {
        try {
            if (this.html5QrCode && this.isScanning) {
                await this.html5QrCode.stop();
                this.html5QrCode.clear();
                this.html5QrCode = null;
                this.isScanning = false;
            }
            
            this.cameraContainer.style.display = 'none';
            this.resetScanButton();
        } catch (err) {
            console.error('Error stopping scanner:', err);
            this.resetScanButton();
        }
    }

    resetScanButton() {
        this.scanButton.disabled = false;
        this.scanButton.textContent = '📷 Scanează Cod de Bare';
    }

    displayProduct(product) {
        this.productImage.src = product.image;
        this.productImage.alt = product.title;
        this.productTitle.textContent = product.title;
        this.productBarcode.textContent = 'Cod: ' + product.barcode;
        this.productPrice.textContent = product.price;
        
        this.productInfo.classList.add('show');
    }

    // Add product to database (for future use)
    addProduct(barcode, productData) {
        productDatabase[barcode] = productData;
        console.log('Product added to database:', barcode, productData);
    }
}

// Initialize the scanner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const scanner = new BarcodeScanner();
    
    // Make scanner globally available for debugging
    window.barcodeScanner = scanner;
    
    console.log('Barcode Scanner PWA initialized');
    console.log('Test barcode in database: 5940031059798');
});

// Handle PWA installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('App is online');
});

window.addEventListener('offline', () => {
    console.log('App is offline');
});
