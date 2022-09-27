import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync } from 'fs';

const xmlOptions = {
  ignoreAttributes: false,
  preserveOrder: true,
  alwaysCreateTextNode: true,
};

type Params = {
  originalXmlPath: string;
  originalPdfBase64: string;
  outputXmlPath: string;
};

export default function ({
  originalXmlPath,
  originalPdfBase64,
  outputXmlPath,
}: Params) {
  const xmlTextContent = readFileSync(originalXmlPath);

  // parses xml as a javascript object and ads the pdf as a base64 string
  const parser = new XMLParser(xmlOptions);
  const jObj = parser.parse(xmlTextContent);
  jObj[1].electronicDocument[0].file[0]['#text'] = originalPdfBase64;

  // converts the file to xml again and stores it to a file
  const builder = new XMLBuilder(xmlOptions);
  const xmlStr = builder.build(jObj);

  writeFileSync(outputXmlPath, xmlStr);
}
