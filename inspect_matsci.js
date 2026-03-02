const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scraper_db.course_offerings.json', 'utf8'));
const matsci = data.flatMap(d => d.table_data || []).filter(t => t.course_prefix === 'MAT SCI');
console.log(matsci.map(c => c.class_code));
