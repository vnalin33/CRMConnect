const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('ok'));
app.listen(5006, '0.0.0.0', () => console.log('Listening on 5006'));
