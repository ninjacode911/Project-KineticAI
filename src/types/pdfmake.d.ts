declare module 'pdfmake/build/pdfmake' {
  interface TCreatedPdf {
    download: (filename?: string) => void;
    open: () => void;
    getBlob: (cb: (blob: Blob) => void) => void;
  }

  interface ContentText {
    text: string | (string | { text: string; bold?: boolean; color?: string; fontSize?: number })[];
    style?: string;
    fontSize?: number;
    bold?: boolean;
    color?: string;
    margin?: number[];
    alignment?: 'left' | 'center' | 'right';
  }

  interface ContentTable {
    table: {
      headerRows?: number;
      widths?: (string | number)[];
      body: (string | ContentText)[][];
    };
    layout?: string;
    margin?: number[];
  }

  interface ContentColumns {
    columns: (ContentText | { width: string | number; text: string })[];
    margin?: number[];
  }

  type Content = ContentText | ContentTable | ContentColumns | { text: string; [key: string]: unknown };

  interface TDocumentDefinitions {
    content: Content[];
    styles?: Record<string, unknown>;
    defaultStyle?: Record<string, unknown>;
    pageSize?: string;
    pageMargins?: number[];
  }

  function createPdf(docDefinition: TDocumentDefinitions): TCreatedPdf;

  export default { createPdf };
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>;
  export { vfs };
}
