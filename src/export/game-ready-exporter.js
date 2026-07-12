import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

export function downloadJson(value, filename) {
  downloadBlob(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    filename
  );
}

export function downloadCanvasPng(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas PNG export failed."));
        return;
      }
      downloadBlob(blob, filename);
      resolve(blob);
    }, "image/png");
  });
}

export function exportObjectAsGlb(object, filename) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      object,
      (result) => {
        const data = result instanceof ArrayBuffer
          ? result
          : new TextEncoder().encode(JSON.stringify(result, null, 2));
        const type = result instanceof ArrayBuffer
          ? "model/gltf-binary"
          : "model/gltf+json";
        downloadBlob(new Blob([data], { type }), filename);
        resolve(result);
      },
      reject,
      {
        binary: true,
        onlyVisible: false,
        truncateDrawRange: true
      }
    );
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
