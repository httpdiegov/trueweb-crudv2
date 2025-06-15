const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
console.log('Leyendo variables de entorno...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME ? '*** Configurado ***' : 'No configurado');
console.log('DB_PORT:', process.env.DB_PORT || '3306 (por defecto)');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*** Configurado ***' : 'No configurado');

async function updateImageUrls() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    // 1. Mostrar tablas disponibles
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tablas disponibles:', tables.map(t => Object.values(t)[0]));

    // 2. Función para actualizar URLs
    const updateTableUrls = async (tableName, urlColumn = 'url') => {
      try {
        // Primero mostramos qué se va a actualizar
        const [preview] = await connection.execute(`
          SELECT ${urlColumn} 
          FROM ${tableName} 
          WHERE ${urlColumn} LIKE '%truevintage.pe%'
          LIMIT 3
        `);
        
        if (preview.length > 0) {
          console.log(`\n🔍 Previsualización de cambios en ${tableName}.${urlColumn}:`);
          preview.forEach(row => {
            const newUrl = row[urlColumn].replace('truevintage.pe', 'truevintageperu.com');
            console.log(`   ${row[urlColumn]} → ${newUrl}`);
          });
        }

        // Preguntar si continuar
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const proceed = await new Promise(resolve => {
          readline.question(`\n¿Deseas actualizar las URLs en ${tableName}.${urlColumn}? (s/n) `, answer => {
            readline.close();
            resolve(answer.toLowerCase() === 's');
          });
        });

        if (!proceed) {
          console.log(`   Saltando ${tableName}.${urlColumn}...`);
          return 0;
        }

        // Ejecutar la actualización
        const [results] = await connection.execute(`
          UPDATE ${tableName} 
          SET ${urlColumn} = REPLACE(
            ${urlColumn}, 
            'truevintage.pe', 
            'truevintageperu.com'
          )
          WHERE ${urlColumn} LIKE '%truevintage.pe%'
        `);
        
        console.log(`✅ ${tableName}.${urlColumn}: ${results.affectedRows} filas actualizadas`);
        return results.affectedRows;
      } catch (error) {
        console.log(`ℹ️ No se pudo actualizar ${tableName}.${urlColumn}:`, error.message);
        return 0;
      }
    };

    // 3. Tablas a actualizar
    const tablesToUpdate = [
      { name: 'imagenes', column: 'url' },
      { name: 'imagenes_bw', column: 'url' },
      { name: 'prenda', column: 'imagen_principal' },
      // Agrega más tablas según sea necesario
    ];

    let totalUpdated = 0;
    for (const { name, column } of tablesToUpdate) {
      totalUpdated += await updateTableUrls(name, column);
    }

    console.log(`\n✅ Total de URLs actualizadas: ${totalUpdated}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await connection.end();
    process.exit();
  }
}

updateImageUrls();