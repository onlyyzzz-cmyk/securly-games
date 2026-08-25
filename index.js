const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9482;

app.use(express.static(__dirname));

app.get('/', (_request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.use((_request, response) => {
  response.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
});
