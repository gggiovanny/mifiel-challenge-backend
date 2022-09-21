import * as PDFDocument from 'pdfkit';

export default (
  title: string,
  content: string,
  destination: NodeJS.WritableStream,
) =>
  new Promise(resolve => {
    const doc = new PDFDocument();
    const stream = doc.pipe(destination);

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
      resolve(true);
    });
  });
