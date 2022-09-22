import { readFileSync } from 'fs';

export default (filePath: string) => readFileSync(filePath, 'base64');
