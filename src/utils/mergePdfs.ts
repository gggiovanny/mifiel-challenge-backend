import PDFMerger from 'pdf-merger-js';

export default async function (
  inputPdfs: [string, string],
  outputPath: string,
) {
  const merger = new PDFMerger();

  for (const inputPdf of inputPdfs) {
    await merger.add(inputPdf);
  }

  await merger.save(outputPath);
}
