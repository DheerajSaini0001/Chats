import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize, getFileIcon } from '../utils/fileUpload';

const FileMessage = ({ attachment, isSender }) => {
    const [showPreview, setShowPreview] = useState(false);
    const { url, fileType, fileName, fileSize } = attachment;

    const handleDownload = () => {
        window.open(url, '_blank');
    };

    // Render image file
    if (fileType === 'image') {
        return (
            <>
                <div className="max-w-xs cursor-pointer" onClick={() => setShowPreview(true)}>
                    <img
                        src={url}
                        alt={fileName}
                        className="rounded-lg max-h-64 w-full object-cover hover:opacity-90 transition-opacity"
                        loading="lazy"
                    />
                    <div className="mt-1 text-xs opacity-70">
                        {fileName} • {formatFileSize(fileSize)}
                    </div>
                </div>

                {/* Image Preview Modal */}
                <AnimatePresence>
                    {showPreview && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4"
                                onClick={() => setShowPreview(false)}
                            >
                                <motion.img
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.8 }}
                                    src={url}
                                    alt={fileName}
                                    className="max-w-full max-h-full rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
                                >
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </>
        );
    }

    // Render video file
    if (fileType === 'video') {
        return (
            <div className="max-w-md">
                <video
                    src={url}
                    controls
                    className="rounded-lg w-full max-h-64"
                >
                    Your browser does not support the video tag.
                </video>
                <div className="mt-1 text-xs opacity-70">
                    {fileName} • {formatFileSize(fileSize)}
                </div>
            </div>
        );
    }

    // Render audio file
    if (fileType === 'audio') {
        return (
            <div className="max-w-md">
                <audio src={url} controls className="w-full">
                    Your browser does not support the audio tag.
                </audio>
                <div className="mt-1 text-xs opacity-70">
                    {fileName} • {formatFileSize(fileSize)}
                </div>
            </div>
        );
    }

    // Render document/other files
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${isSender
                    ? 'bg-cyan-600/20 border-cyan-500/30'
                    : 'bg-white/5 border-white/10'
                } max-w-xs hover:bg-opacity-80 transition-all cursor-pointer`}
            onClick={handleDownload}
        >
            <div className="flex-shrink-0">
                <i className={`fas ${getFileIcon(fileType, fileName)} text-3xl text-cyan-400`}></i>
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{fileName}</div>
                <div className="text-xs opacity-70">{formatFileSize(fileSize)}</div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                }}
                className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <i className="fas fa-download text-sm"></i>
            </button>
        </div>
    );
};

export default FileMessage;
