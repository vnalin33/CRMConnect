require('dotenv').config();
const db = require('./src/config/db');

(async () => {
    try {
        console.log('Checking for duplicates...');
        const { rows } = await db.query('SELECT id, name, emailid, mobilenumber FROM connector ORDER BY id ASC');
        
        console.table(rows);

        // Find duplicates
        const seenMobiles = new Set();
        const seenEmails = new Set();
        const idsToDelete = [];

        for (const user of rows) {
            let isDuplicate = false;
            if (user.mobilenumber && seenMobiles.has(user.mobilenumber)) isDuplicate = true;
            if (user.emailid && seenEmails.has(user.emailid)) isDuplicate = true;

            if (isDuplicate) {
                idsToDelete.push(user.id);
            } else {
                if (user.mobilenumber) seenMobiles.add(user.mobilenumber);
                if (user.emailid) seenEmails.add(user.emailid);
            }
        }

        if (idsToDelete.length > 0) {
            console.log('Found duplicate IDs to delete:', idsToDelete);
            const placeholders = idsToDelete.map((_, i) => `$${i + 1}`).join(',');
            await db.query(`DELETE FROM connector WHERE id IN (${placeholders})`, idsToDelete);
            console.log('Deleted duplicates successfully.');
        } else {
            console.log('No duplicates found in the connector table.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
})();
