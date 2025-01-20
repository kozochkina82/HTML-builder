const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'styles');
const targetDir = path.join(__dirname, 'project-dist');
const bundleFile = path.join(targetDir, 'bundle.css');

// Создание целевой папки
fs.mkdir(targetDir, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating target directory:', err);
    return;
  }

  // Создаём файл bundle.css
  fs.writeFile(bundleFile, '', (err) => {
    if (err) {
      console.error('Error creating bundle file:', err);
      return;
    }

    // Чтение файлов из папки styles
    fs.readdir(sourceDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Error reading source directory:', err);
        return;
      }

      files.forEach((file) => {

        if (file.isFile() && path.extname(file.name) === '.css') {
          const filePath = path.join(sourceDir, file.name);

          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading CSS file:', err);
              return;
            }

            fs.appendFile(bundleFile, data + '\n', (err) => {
              if (err) {
                console.error('Error appending to bundle file:', err);
              }
            });
          });
        }
      });

      console.log('Styles binded in bundle.css');
    });
  });
});
