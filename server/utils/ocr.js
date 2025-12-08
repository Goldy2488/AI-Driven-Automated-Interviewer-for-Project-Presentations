import { createWorker } from "tesseract.js";

export async function ocrFromBase64(base64Data) {
  console.log("OCR: Starting...");
  
  let dataUrl = base64Data;
  if (!base64Data.startsWith("data:")) {
    dataUrl = `data:image/png;base64,${base64Data}`;
  }

  const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) {
    console.log("OCR: Invalid data URL format");
    throw new Error("Invalid data URL for image");
  }

  const b64 = matches[2];
  const buffer = Buffer.from(b64, "base64");
  console.log(`OCR: Image buffer created, size: ${buffer.length} bytes`);

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR: ${m.status} ${Math.round(m.progress * 100)}%`);
      }
    }
  });

  try {
    console.log("OCR: Worker created, starting recognition...");
    const { data: { text } } = await worker.recognize(buffer);
    console.log(`OCR: Recognition complete, text length: ${text.length}`);
    await worker.terminate();
    return text;
  } catch (err) {
    console.error("OCR: Error during recognition:", err);
    try { await worker.terminate(); } catch(e){ console.error("OCR: Error terminating worker:", e); }
    throw err;
  }
}
