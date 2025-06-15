const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { query } = require('../src/lib/db');

async function updateImageUrls() {
  try {
    console.log('Starting to update image URLs...');
    
    // Get all images from the imagenes table
    const images = await query('SELECT id, url FROM imagenes WHERE url LIKE ?', ['%www.truevintageperu.com%']) as any[];
    
    console.log(`Found ${images.length} images to update`);
    
    // Update each image URL to remove www
    for (const image of images) {
      const newUrl = image.url.replace('www.truevintageperu.com', 'truevintageperu.com');
      await query('UPDATE imagenes SET url = ? WHERE id = ?', [newUrl, image.id]);
      console.log(`Updated image ${image.id}: ${image.url} -> ${newUrl}`);
    }
    
    // Get all images from the imagenesBW table
    const bwImages = await query('SELECT id, url FROM imagenesBW WHERE url LIKE ?', ['%www.truevintageperu.com%']) as any[];
    
    console.log(`Found ${bwImages.length} BW images to update`);
    
    // Update each BW image URL to remove www
    for (const image of bwImages) {
      const newUrl = image.url.replace('www.truevintageperu.com', 'truevintageperu.com');
      await query('UPDATE imagenesBW SET url = ? WHERE id = ?', [newUrl, image.id]);
      console.log(`Updated BW image ${image.id}: ${image.url} -> ${newUrl}`);
    }
    
    console.log('Finished updating all image URLs');
    process.exit(0);
  } catch (error) {
    console.error('Error updating image URLs:', error);
    process.exit(1);
  }
}

updateImageUrls();
