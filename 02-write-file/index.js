const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit } = process;
const filePath = path.join(__dirname, '02-write-file', 'text.txt'); //путь к файлу

if(!fs.existsSync(path.join(__dirname, '02-write-file'))){
    fs.mkdirSync(path.join(__dirname, '02-write-file'));
}

const writeStream = fs.createWriteStream(filePath, { flags: 'a' }); // Флаг 'a' для добавления в конец файла

stdout.write(
  'Hello! Please, write something. Press "Exit" or "Ctrl + C" for exit.\n',
);
stdin.on('data', (data) => {
  const input = data.toString().trim();

  if (input.charCodeAt(0) === 27) {
    stdout.write('Goodbye!\n');
    process.exit();
  } 
  writeStream.write(`${input}\n`);
  stdout.write('Write something else:\n');
});
process.on('SIGINT', () => {
  stdout.write('\nGoodbye!\n');
  exit();
});
