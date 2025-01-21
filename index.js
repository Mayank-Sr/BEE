const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const inputFile = 'requests.log';
const maxInputSize = 5 * 1024 * 1024; //5MB

const rotateLogFile = () => {
    const timestamp = new Date().toISOString();
    const archiveName = `${timestamp}.log`;
    const archivePath = path.join(__dirname, archiveName);

    fs.rename(inputFile, archivePath, (err) => {
        if (err) {
            console.error('Error rotating log file:', err);
        } else {
            console.log(`Log file rotated: ${archiveName}`);
        }
    });
};

app.use((req, res, next) => {
    const requests = {
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        url: req.url,
        protocol: req.protocol,
        method: req.method,
        hostname: req.hostname,
        query: req.query,
        header: req.headers,
        userAgent: req.get('User-Agent'),
    };

    const logEntry = JSON.stringify(requests) + '\n';

    fs.stat(inputFile, (err, stats) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error checking log file size:', err);
        } else if (!err && stats.size >= maxInputSize) {
            rotateLogFile();
        }

        fs.appendFile(inputFile, logEntry, (err) => {
            if (err) {
                console.error('Failed to write log:', err);
            }
        });
    });

    next();
});

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Home Page....</h1>');
});

app.get('/contact', (req, res) => {
    res.send('<h1>This is the contacts Page</h1>');
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
