import { useEffect, useState } from "react";
import axios from "axios";

const CLIENT_ID = "494071376322-4i3esa8vvtcj69d13mt8avhrachds6o8.apps.googleusercontent.com";
const API_KEY = "AIzaSyAfGStb6GDF2640feHVrT6Mo7INm-3VS58";
const PROJECT_NUMBER = "494071376322";

function GoogleDrivePicker() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);

    useEffect(() => {
        const script1 = document.createElement("script");
        script1.src = "https://accounts.google.com/gsi/client";
        script1.async = true;
        document.body.appendChild(script1);

        const script2 = document.createElement("script");
        script2.src = "https://apis.google.com/js/api.js";
        script2.async = true;
        document.body.appendChild(script2);

        return () => {
            document.body.removeChild(script1);
            document.body.removeChild(script2);
        };
    }, []);

    const handleOpenPicker = () => {
        setUploadDone(false);
        setFiles([]);

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.file",
            callback: (tokenResponse) => {
                loadPicker(tokenResponse.access_token);
            },
        });
        tokenClient.requestAccessToken();
    };

    const loadPicker = (accessToken) => {
        window.gapi.load("picker", () => {
            const view = new window.google.picker.DocsView(
                window.google.picker.ViewId.DOCS
            ).setIncludeFolders(true);

            const picker = new window.google.picker.PickerBuilder()
                .setDeveloperKey(API_KEY)
                .setAppId(PROJECT_NUMBER)
                .setOAuthToken(accessToken)
                .addView(view)
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .setCallback(async (data) => {
                    if (data.action === window.google.picker.Action.PICKED) {
                        await handleFilesSelected(data.docs, accessToken);
                    }
                })
                .build();

            picker.setVisible(true);
        });
    };

    const handleFilesSelected = async (docs, accessToken) => {
        const tempFiles = [];

        for (const doc of docs) {
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/google-drive-proxy`,
                    { fileId: doc.id, accessToken },
                    { responseType: "blob" }
                );

                const fileName = decodeURIComponent(
                    res.headers["x-file-name"] || doc.name
                );

                const fileObj = new File([res.data], fileName, {
                    type: res.data.type,
                });

                tempFiles.push(fileObj);
            } catch (err) {
                console.error(`Failed to download ${doc.name}:`, err);
            }
        }

        setFiles(tempFiles);
    };

    const handleUploadAll = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setUploadDone(false);

        try {
            const uploadData = [];

            for (const file of files) {
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onloadend = () => resolve(reader.result.split(",")[1]);
                });

                uploadData.push({ name: file.name, data: base64 });
            }

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/google-drive-upload`,
                { files: uploadData }
            );

            setUploadDone(true);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const totalSizeMB = (
        files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024
    ).toFixed(2);

    return (
        <div className="google-drive-picker">
            <button
                className="btn-select-drive"
                onClick={handleOpenPicker}
                disabled={uploading}
            >
                Select from Google Drive
            </button>

            {files.length > 0 && (
                <div className="drive-file-list">
                    <h3>
                        {files.length} file{files.length > 1 ? "s" : ""} selected &nbsp;|&nbsp;
                        Total: {totalSizeMB} MB
                    </h3>

                    <ul>
                        {files.map((file, i) => (
                            <li key={i}>
                                <span className="file-name">{file.name}</span>
                                <span className="file-meta">
                                    {(file.size / 1024).toFixed(2)} KB &nbsp;|&nbsp; {file.type}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <button
                        className="btn-upload-all"
                        onClick={handleUploadAll}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload All"}
                    </button>

                    {uploadDone && (
                        <p className="upload-success">✅ All files uploaded successfully!</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default GoogleDrivePicker;