import { extractPdfText } from '@/lib/ai/pdf-text';
import { readFamilyArtifact } from '@/lib/family/storage';

async function toBuffer(body: Buffer | ReadableStream) {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  const reader = body.getReader();
  const chunks: Buffer[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks);
}

export async function extractPageContentSnippet(storagePath: string) {
  const artifact = await readFamilyArtifact(storagePath);
  const buffer = await toBuffer(artifact.body);
  const contentType = artifact.contentType.toLowerCase();

  if (!contentType.includes('pdf')) {
    return null;
  }

  const extracted = extractPdfText(buffer);
  if (!extracted) {
    return null;
  }

  return extracted.slice(0, 4000);
}
