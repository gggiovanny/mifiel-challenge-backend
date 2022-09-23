import { createWriteStream } from 'fs';
import PDFDocument from 'pdfkit';

export default (
  title: string,
  content: string,
  outputFilePath: string,
): Promise<undefined> =>
  new Promise(resolve => {
    const doc = new PDFDocument();
    const stream = doc.pipe(createWriteStream(outputFilePath));

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
      stream.end();
      resolve(undefined);
    });
  });
