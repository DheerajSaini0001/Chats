// Utility function to upload files to Cloudinary
export const uploadFileToCloudinary = async (file, onProgress) => {
    const cloudName = "db5jdjjon";
    const uploadPreset = "chat-files"; // Create this preset in Cloudinary

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "auto"); // Handles all file types

    try {
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentComplete);
                }
            });

            xhr.addEventListener("load", () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);

                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        resolve({
                            url: response.secure_url,
                            fileType: getFileType(response.resource_type, response.format),
                            fileName: file.name,
                            fileSize: file.size,
                        });
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener("error", () => {
                reject(new Error("Upload failed"));
            });

            xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
            xhr.send(formData);
        });
    } catch (error) {
        throw new Error(`Upload error: ${error.message}`);
    }
};

// Determine file type from Cloudinary response
const getFileType = (resourceType, format) => {
    if (resourceType === "image") return "image";
    if (resourceType === "video") return "video";
    if (resourceType === "audio") return "audio";

    // Check by format for documents
    const documentFormats = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"];
    if (documentFormats.includes(format.toLowerCase())) return "document";

    return "other";
};

// Format file size for display
export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

// Get file icon based on file type
export const getFileIcon = (fileType, fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    if (fileType === "image") return "fa-image";
    if (fileType === "video") return "fa-video";
    if (fileType === "audio") return "fa-music";

    if (["pdf"].includes(extension)) return "fa-file-pdf";
    if (["doc", "docx"].includes(extension)) return "fa-file-word";
    if (["xls", "xlsx"].includes(extension)) return "fa-file-excel";
    if (["ppt", "pptx"].includes(extension)) return "fa-file-powerpoint";
    if (["zip", "rar", "7z"].includes(extension)) return "fa-file-archive";
    if (["txt"].includes(extension)) return "fa-file-alt";

    return "fa-file";
};
