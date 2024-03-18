export function connectImageUpload(onFileSelect: (file: File) => void): void {
    const uploadButton = document.getElementById('upload-button');
    if (!uploadButton) { throw new Error("Element upload-button not found"); }
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) { throw new Error("Element upload-area not found"); }

    uploadButton.addEventListener('click', function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', function () {
            if (!fileInput.files){
                return;
            }
            const file = fileInput.files[0];
            if (file) {
                onFileSelect(file);
            }
        });

        fileInput.click();
    });

    uploadArea.addEventListener('dragover', function (event) {
        event.preventDefault();
        uploadArea.classList.add('upload-drag-over');
    });

    uploadArea.addEventListener('dragleave', function () {
        uploadArea.classList.remove('upload-drag-over');
    });

    uploadArea.addEventListener('drop', function (event) {
        event.preventDefault();
        uploadArea.classList.remove('upload-drag-over');
        if (!event.dataTransfer){
            console.error(`Data transfer is not present in event: ${event}`);
            return;
        }
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            onFileSelect(file);
        }
    });
}