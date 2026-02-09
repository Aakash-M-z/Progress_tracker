import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3001;

// Force restart
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});