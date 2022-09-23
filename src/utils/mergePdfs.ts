import PDFMerger from 'pdf-merger-js';

type InputFile = string | Buffer | ArrayBuffer;

export default async function (
  inputPdfs: [InputFile, InputFile],
  outputPath: string,
) {
  const merger = new PDFMerger();

  for (const inputPdf of inputPdfs) {
    await merger.add(inputPdf);
  }

  await merger.save(outputPath);
}
