// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const os = require('os');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const apiDir = path.join(os.homedir(), '.api');
const templatesDir = path.join(apiDir, 'templates');
const srcTemplatesDir = path.join(__dirname, 'templates');
const configFilePath = path.join(apiDir, 'config.json');
const projectsFilePath = path.join(apiDir, 'projects.json');

const configData = {
  select: true,
  display: false,
  call: false,
  indent: 2,
  numberOfItems: 5,
  responseMessage: {
    default: 'Response',
    exceeded: 'Response(first {{ numberOfItems }} items)',
  },
};

// Make sure the .api directory exists
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir);
}

// Make sure the .api/templates directory exists
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir);
}

// Copy files from src/templates to .api/templates
fs.readdirSync(srcTemplatesDir).forEach(file => {
  const srcFile = path.join(srcTemplatesDir, file);
  const destFile = path.join(templatesDir, file);

  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file} to ${templatesDir}.`);
});

// Create .api/config.json
fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));
console.log(`Created ${configFilePath}`);

// Create .api/projects.json with an empty object
fs.writeFileSync(projectsFilePath, JSON.stringify({}, null, 2));
console.log(`Created ${projectsFilePath}`);
