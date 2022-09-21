import { readFileSync, unlinkSync } from 'fs';

export default function (filePath: string, deleteFile = true) {
  const fileB64 = readFileSync(filePath, 'base64');

  if (deleteFile) unlinkSync(filePath);

  return fileB64;
}
