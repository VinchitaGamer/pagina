const http = require('http');
const fs = require('fs');
const path = require('path');

// Crear un servidor HTTP simple
const server = http.createServer((req, res) => {
    // Habilitar CORS para todas las solicitudes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Servir archivos estáticos
    let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
    
    // Log para depuración
    console.log('Solicitando archivo:', filePath);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Verificar si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Archivo no encontrado: ${filePath}`);
            console.error(`Error: ${err.code}`);
            
            // Si es la página principal y no se encuentra, intentar buscar en otra ubicación
            if (req.url === '/' || req.url === '/index.html') {
                const alternativePath = './index.html';
                console.log('Intentando ruta alternativa:', alternativePath);
                
                fs.readFile(alternativePath, (altError, altContent) => {
                    if (altError) {
                        console.error('Tampoco se encontró la ruta alternativa:', altError.code);
                        res.writeHead(404);
                        res.end('Archivo no encontrado. Intenta acceder directamente a /pages/assistant/AYUDANTE_VIRTUAL.html');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(altContent, 'utf-8');
                    }
                });
                return;
            }
            
            res.writeHead(404);
            res.end(`Archivo no encontrado: ${req.url}`);
            return;
        }
        
        // El archivo existe, lo leemos
        fs.readFile(filePath, (error, content) => {
            if (error) {
                console.error(`Error al leer el archivo: ${filePath}`);
                console.error(`Error: ${error.code}`);
                res.writeHead(500);
                res.end(`Error del servidor: ${error.code}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
