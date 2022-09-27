declare module 'pdf-page-counter' {
  type AnalizePdfReturnedData = {
    numpages: number;
    numrender: number;
    info: string;
    metadata: string;
    version: string;
    text: string;
  };

  function AnalizePdf(dataBuffer: Buffer): Promise<AnalizePdfReturnedData>;

  export default AnalizePdf;
}
