const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Node.js server works!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
