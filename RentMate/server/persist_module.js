const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

async function load(filename) {
    try {
        const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.warn(`Warning: failed to load ${filename}:`, err.message);
        return null;
    }
}

async function save(filename, data) {
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

module.exports = {
    load,
    save,
};
