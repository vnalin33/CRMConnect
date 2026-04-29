const app = require('./src/app');
const http = require('http');

const server = http.createServer(app);
server.listen(5006, async () => {
    try {
        const res = await fetch('http://localhost:5006/api/test');
        console.log('GET /api/test:', res.status);

        const res2 = await fetch('http://localhost:5006/api/drafts');
        console.log('GET /api/drafts:', res2.status);
    } catch(e) {
        console.error(e);
    }
    server.close();
});
