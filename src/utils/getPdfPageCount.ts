import { readFileSync } from 'fs';
import analizePdf from 'pdf-page-counter';

export default (pdfPath: string): Promise<number> =>
  new Promise(resolve => {
    const dataBuffer = readFileSync(pdfPath);
    analizePdf(dataBuffer).then(({ numpages }) => {
      resolve(numpages);
    });
  });
