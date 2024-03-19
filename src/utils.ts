export default function dataURLtoFile(dataUrl: string, filename: string): File {
    if (!dataUrl){
        throw new Error(`DataURL is empty: ${dataUrl}`)
    }
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error("Data in file not found");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
}

export async function fileToDataURL(file: File): Promise<string | void> {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("Can't get DataURL from empty file"));
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                const result: string = reader.result as string;
                if (!result) {
                    throw new Error(`DataURL is not available for image ${file}`);
                }
                resolve(result);
            };
            reader.onerror = (event) => {
                reject(new Error(`Can't get DataURL from file: ${event}`));
            };
            reader.onabort = () => {
                reject(new Error("File read cancelled"));
            };
            reader.readAsDataURL(file);
        }
    });
}

export async function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to read data URL.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


export async function imageURLtoFile(url: string){
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'image.png', {type: blob.type});
}