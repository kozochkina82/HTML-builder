const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');

fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('Folder reading mistake: ', err);
    return;
  }

  files.forEach((file) => {
    if (file.isFile()) {
      const filePath = path.join(folderPath, file.name);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('File information error: ', err);
          return;
        }

        const fileName = path.parse(file.name).name; // Имя файла без расширения
        const fileExt = path.parse(file.name).ext.slice(1); // Расширение файла без точки
        const fileSize = stats.size; // Размер файла в байтах

        console.log(`${fileName} - ${fileExt} - ${fileSize}b`);
      });
    }
  });
});
