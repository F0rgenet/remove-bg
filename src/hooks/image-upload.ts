import React, { useCallback, useState } from 'react';

export const useImageUpload = (onFileSelect: (file: File) => void) => {
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = useCallback((file: File) => {
        onFileSelect(file);
    }, [onFileSelect]);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        setDragOver(false);
        if (event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    return {
        handleDragOver,
        handleDragLeave,
        handleDrop,
        dragOver,
    };
};