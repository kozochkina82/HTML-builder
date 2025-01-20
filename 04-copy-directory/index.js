const fs = require('fs');
const path = require('path');

// Пути к папкам
const sourceDir = path.join(__dirname, 'files');
const targetDir = path.join(__dirname, 'files-copy');

// Функция для создания папки
function createDir(dirPath, callback) {
  fs.mkdir(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory:', err.message);
      return callback(err);
    }
    callback(null);
  });
}

// Функция для копирования файлов
function copyFiles(source, target, callback) {
  fs.readdir(source, { withFileTypes: true }, (err, items) => {
    if (err) {
      console.error('Error reading directory:', err.message);
      return callback(err);
    }

    let pending = items.length;

    if (!pending) return callback(null); // Если папка пустая, завершить

    items.forEach((item) => {
      const sourcePath = path.join(source, item.name);
      const targetPath = path.join(target, item.name);

      if (item.isFile()) {
        fs.copyFile(sourcePath, targetPath, (err) => {
          if (err) {
            console.error('Error copying file:', err.message);
            return callback(err);
          }
          pending -= 1;
          if (!pending) callback(null); // Завершение после обработки всех файлов
        });
      } else if (item.isDirectory()) {
        createDir(targetPath, (err) => {
          if (err) return callback(err);

          copyFiles(sourcePath, targetPath, (err) => {
            if (err) return callback(err);
            pending -= 1;
            if (!pending) callback(null); // Завершение после обработки всех файлов
          });
        });
      }
    });
  });
}

// Функция для очистки папки
function clearDir(dirPath, callback) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
    if (err) {
      if (err.code === 'ENOENT') return callback(null); // Папка не существует
      return callback(err);
    }

    let pending = items.length;

    if (!pending) return callback(null); // Папка уже пуста

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item.name);

      if (item.isFile()) {
        fs.unlink(itemPath, (err) => {
          if (err) {
            console.error('Error deleting file:', err.message);
            return callback(err);
          }
          pending -= 1;
          if (!pending) callback(null); // Завершение после обработки всех элементов
        });
      } else if (item.isDirectory()) {
        clearDir(itemPath, (err) => {
          if (err) return callback(err);
          fs.rmdir(itemPath, (err) => {
            if (err) {
              console.error('Error deleting directory:', err.message);
              return callback(err);
            }
            pending -= 1;
            if (!pending) callback(null);
          });
        });
      }
    });
  });
}

// Основная функция
function filesCopy() {
  clearDir(targetDir, (err) => {
    if (err) {
      console.error('Error clearing directory:', err.message);
      return;
    }

    createDir(targetDir, (err) => {
      if (err) {
        console.error('Error creating directory:', err.message);
        return;
      }

      copyFiles(sourceDir, targetDir, (err) => {
        if (err) {
          console.error('Error copying files:', err.message);
          return;
        }
        console.log('Копирование завершено.');
      });
    });
  });
}

// Запуск
filesCopy();
