const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scraper_db.course_offerings.json', 'utf8'));
const depts = new Set();
data.forEach(d => {
    if (d.table_data) {
        d.table_data.forEach(t => depts.add(t.department + ' : ' + t.course_prefix));
    }
});
console.log(Array.from(depts).join('\n'));
