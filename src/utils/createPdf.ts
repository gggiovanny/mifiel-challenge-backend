import { createWriteStream, readFile } from 'fs';
import * as PDFDocument from 'pdfkit';

export default (
  title: string,
  content: string,
  pdfPath: string,
): Promise<Buffer> =>
  new Promise(resolve => {
    const doc = new PDFDocument();
    const stream = doc.pipe(createWriteStream(pdfPath));

    doc
      .fontSize(25)
      .text(title, 100, 80)
      .font('Times-Roman', 13)
      .moveDown()
      .text(content, {
        width: 412,
        align: 'justify',
        indent: 30,
        ellipsis: true,
      });

    doc.end();

    stream.on('finish', () => {
      readFile(pdfPath, (err, fileBuffer) => {
        resolve(fileBuffer);
      });
    });
  });
