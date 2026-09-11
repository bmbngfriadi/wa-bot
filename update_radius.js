const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace inline border radius with smaller values
      content = content.replace(/borderRadius:\s*'1[0-9]px'/g, "borderRadius: '4px'");
      content = content.replace(/borderRadius:\s*'24px'/g, "borderRadius: '6px'");
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('client/src');
console.log('Border radius updated in JSX files.');
