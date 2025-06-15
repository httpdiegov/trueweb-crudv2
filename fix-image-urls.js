const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env.local' });

async function fixImageUrls() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL_CA ? { ca: process.env.MYSQL_SSL_CA } : undefined,
  });

  try {
    console.log('Connected to database. Updating image URLs...');
    
    // Update URLs in imagenes table
    const [colorResults] = await connection.execute(
      `UPDATE imagenes 
       SET url = REPLACE(url, 'https://www.truevintageperu.com', 'https://truevintageperu.com') 
       WHERE url LIKE '%www.truevintageperu.com%'`
    );
    
    console.log(`Updated ${colorResults.affectedRows} color image URLs`);
    
    // Update URLs in imagenesBW table
    const [bwResults] = await connection.execute(
      `UPDATE imagenesBW 
       SET url = REPLACE(url, 'https://www.truevintageperu.com', 'https://truevintageperu.com') 
       WHERE url LIKE '%www.truevintageperu.com%'`
    );
    
    console.log(`Updated ${bwResults.affectedRows} BW image URLs`);
    
    console.log('All image URLs have been updated successfully!');
  } catch (error) {
    console.error('Error updating image URLs:', error);
  } finally {
    await connection.end();
  }
}

fixImageUrls();
