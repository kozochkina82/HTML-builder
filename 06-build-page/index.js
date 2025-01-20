const fs = require('fs');
const path = require('path');

const projectDistPath = path.join(__dirname, 'project-dist');
const stylesDirPath = path.join(__dirname, 'styles');
const assetsDirPath = path.join(__dirname, 'assets');
const targetAssetsPath = path.join(projectDistPath, 'assets');
const templatePath = path.join(__dirname, 'template.html');
const componentsDirPath = path.join(__dirname, 'components');
const indexHtmlPath = path.join(projectDistPath, 'index.html');
const styleCssPath = path.join(projectDistPath, 'style.css');

// Созданем папку project-dist
fs.mkdir(projectDistPath, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating project-dist directory:', err.message);
    return;
  }

  // Запускаем все функции
  replaceTemplate(() => {
    mergeStyles(() => {
      copyAssets(assetsDirPath, targetAssetsPath, () => {
        console.log('Project build completed!');
      });
    });
  });
});

// Замена шаблонов в template.html
function replaceTemplate(callback) {
  fs.readFile(templatePath, 'utf8', (err, templateData) => {
    if (err) {
      console.error('Error reading template.html:', err.message);
      return;
    }

    const tags = templateData.match(/{{\s*[\w-]+\s*}}/g) || [];
    let processedTemplate = templateData;
    let pending = tags.length;

    if (!pending) {
      writeIndexHtml(processedTemplate, callback);
      return;
    }

    tags.forEach((tag) => {
      const componentName = tag.replace(/{{\s*|\s*}}/g, '');
      const componentPath = path.join(
        componentsDirPath,
        `${componentName}.html`,
      );

      fs.readFile(componentPath, 'utf8', (err, componentData) => {
        if (err) {
          console.warn(`Component not found: ${componentName}`);
          processedTemplate = processedTemplate.replace(tag, '');
        } else {
          processedTemplate = processedTemplate.replace(tag, componentData);
        }

        pending -= 1;
        if (pending === 0) {
          writeIndexHtml(processedTemplate, callback);
        }
      });
    });
  });
}

function writeIndexHtml(data, callback) {
  fs.writeFile(indexHtmlPath, data, (err) => {
    if (err) {
      console.error('Error writing index.html:', err.message);
      return;
    }
    console.log('index.html created successfully!');
    callback();
  });
}

// Компиляция стилей в style.css
function mergeStyles(callback) {
  fs.writeFile(styleCssPath, '', (err) => {
    if (err) {
      console.error('Error creating style.css:', err.message);
      return;
    }

    fs.readdir(stylesDirPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Error reading styles directory:', err.message);
        return;
      }

      let pending = files.filter(
        (file) => file.isFile() && path.extname(file.name) === '.css',
      ).length;

      if (!pending) {
        console.log('No CSS files to merge.');
        callback();
        return;
      }

      files.forEach((file) => {
        if (file.isFile() && path.extname(file.name) === '.css') {
          const filePath = path.join(stylesDirPath, file.name);

          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading CSS file:', err.message);
              return;
            }

            fs.appendFile(styleCssPath, data + '\n', (err) => {
              if (err) {
                console.error('Error appending to style.css:', err.message);
              }

              pending -= 1;
              if (pending === 0) {
                console.log('style.css created successfully!');
                callback();
              }
            });
          });
        }
      });
    });
  });
}

// Копирование папки assets
function copyAssets(source, destination, callback) {
  fs.mkdir(destination, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating assets directory:', err.message);
      return callback();
    }

    fs.readdir(source, { withFileTypes: true }, (err, items) => {
      if (err) {
        console.error('Error reading assets directory:', err.message);
        return callback();
      }

      let pending = items.length;

      if (!pending) {
        callback();
        return;
      }

      items.forEach((item) => {
        const sourcePath = path.join(source, item.name);
        const destinationPath = path.join(destination, item.name);

        if (item.isFile()) {
          fs.copyFile(sourcePath, destinationPath, (err) => {
            if (err) {
              console.error(`Error copying file: ${item.name}`, err.message);
            }
            pending -= 1;
            if (pending === 0) {
              console.log('Assets copied successfully!');
              callback();
            }
          });
        } else if (item.isDirectory()) {
          copyAssets(sourcePath, destinationPath, () => {
            pending -= 1;
            if (pending === 0) {
              console.log('Assets copied successfully!');
              callback();
            }
          });
        }
      });
    });
  });
}
