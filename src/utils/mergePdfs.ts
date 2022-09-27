import PDFMerger from 'pdf-merger-js';

import getPdfPageCount from './getPdfPageCount';

type MergePdfParams = {
  originalPdfPath: string;
  signedPagePath: string;
  outputPath: string;
};

export default async function ({
  originalPdfPath,
  signedPagePath,
  outputPath,
}: MergePdfParams) {
  const merger = new PDFMerger();
  await merger.add(originalPdfPath);
  const signedPagePagesCount = await getPdfPageCount(signedPagePath);
  // the page containing the signs are the last one, so we are only merging that one
  await merger.add(signedPagePath, signedPagePagesCount.toString());
  await merger.save(outputPath);
}
