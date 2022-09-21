-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "contentB64" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Signer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hasSigned" BOOLEAN NOT NULL DEFAULT false,
    "documentId" INTEGER,
    CONSTRAINT "Signer_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
