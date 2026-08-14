import { useState, useEffect, useRef } from "react";
import ClientLayout from "../Layout/ClientLayout";
import "./ClientFilesUpload.scss";
import axios from "axios";
import { FaGoogleDrive } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Icons
import {
    FiFile,
    FiFileText,
    FiFolder,
    FiUpload,
    FiLock,
    FiUnlock,
    FiCalendar,
    FiUser,
    FiCheckCircle,
    FiAlertCircle,
    FiEye,
    FiX,
    FiChevronDown,
    FiChevronUp,
    FiInfo,
    FiClock,
    FiTrendingUp,
    FiPackage,
    FiCreditCard,
    FiTrash2,
    FiPlus,
    FiSave,
    FiMessageSquare,
    FiBell,
    FiList,
    FiPhone,
    FiGrid,
    FiImage,
    FiEyeOff,
    FiZoomIn,
    FiZoomOut,
    FiMaximize
} from "react-icons/fi";

const ClientFilesUpload = () => {
    // Default to current month/year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // State for month/year selection
    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState(currentMonth.toString());

    // State to track if month is active for this client
    const [isMonthActive, setIsMonthActive] = useState(true);

    // State for existing month data
    const [monthData, setMonthData] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for new files to upload
    const [newFiles, setNewFiles] = useState({
        sales: [],
        purchase: [],
        bank: []
    });

    // State for other categories
    const [otherCategories, setOtherCategories] = useState([]);

    // State for update notes
    const [categoryNotes, setCategoryNotes] = useState({
        sales: "",
        purchase: "",
        bank: ""
    });

    // State for month note
    const [monthNote, setMonthNote] = useState("");

    // State for new other categories input
    const [newOtherCategory, setNewOtherCategory] = useState("");

    // State for document preview
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Zoom and Pan States
    const [zoomLevel, setZoomLevel] = useState(1);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // CSV STATES
    const [csvData, setCsvData] = useState(null);
    const [csvLoading, setCsvLoading] = useState(false);
    const [csvZoomLevel, setCsvZoomLevel] = useState(1);

    // State for deleted files audit trail
    const [deletedFiles, setDeletedFiles] = useState([]);

    // State for showing employee notes
    const [showEmployeeNotes, setShowEmployeeNotes] = useState({});

    // State for showing category notes
    const [showCategoryNotes, setShowCategoryNotes] = useState({});

    // State for showing deleted files section
    const [showDeletedFiles, setShowDeletedFiles] = useState(false);

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        fileName: "",
        fileType: "",
        categoryName: null,
        deleteNote: ""
    });

    // Bulk delete states
    const [bulkDeleteModal, setBulkDeleteModal] = useState({
        isOpen: false,
        selectedFiles: [],      // Store file names for display
        selectedFileUrls: [],   // Store file URLs for unique identification
        deleteNote: ""
    });
    const [selectedFilesForDelete, setSelectedFilesForDelete] = useState([]);
    const [selectedFileUrlsForDelete, setSelectedFileUrlsForDelete] = useState([]);

    const [selectAll, setSelectAll] = useState(false);

    // State for employee assignment
    const [employeeAssignments, setEmployeeAssignments] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // State for View All Files Modal
    const [viewAllModal, setViewAllModal] = useState({
        isOpen: false,
        categoryType: null,
        categoryName: null,
        categoryLabel: "",
        files: []
    });

    // Google Drive State
    const [clientData, setClientData] = useState(null);
    const [driveLoading, setDriveLoading] = useState(false);

    // Ref for protection
    const previewRef = useRef(null);
    const imageScrollRef = useRef(null);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // ========== NEW: 401 Unauthorized Handler ==========
    const handleUnauthorized = (error) => {
        if (error.response?.status === 401) {
            // Clear any stored session data
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');

            // Show toast message
            toast.error('Unauthorized', {
                position: "top-center",
                autoClose: 3000,
            });

            // Redirect to login page after a small delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);

            return true;
        }
        return false;
    };
    // ========== END OF 401 HANDLER ==========

    // Toast Configuration
    const showSuccess = (message) => {
        toast.success(message, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
        });
    };

    const showError = (message) => {
        toast.error(message, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
        });
    };

    const showInfo = (message) => {
        toast.info(message, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
        });
    };

    const showWarning = (message) => {
        toast.warning(message, {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
        });
    };

    // Mouse wheel zoom for images
    useEffect(() => {
        const el = imageScrollRef.current;
        if (!el || !isPreviewOpen) return;

        const handleWheel = (e) => {
            const previewDocFileType = previewDoc?.fileType || getFileType(previewDoc?.fileName);
            if (previewDocFileType !== 'image') return;

            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 3));
        };

        const blockPinch = (e) => {
            if (e.ctrlKey || e.touches?.length > 1) {
                e.preventDefault();
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        el.addEventListener('touchmove', blockPinch, { passive: false });

        return () => {
            el.removeEventListener('wheel', handleWheel);
            el.removeEventListener('touchmove', blockPinch);
        };
    }, [isPreviewOpen, previewDoc]);

    // Zoom functions
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleZoomReset = () => {
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    // Pan functions for images
    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - imagePosition.x,
                y: e.clientY - imagePosition.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setImagePosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // CSV HELPER FUNCTIONS
    const escapeHtmlForCSV = (str) => {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    const parseCSVAndDisplay = async (csvUrl) => {
        try {
            setCsvLoading(true);
            const response = await fetch(csvUrl);
            const csvText = await response.text();

            const rows = [];
            const lines = csvText.split(/\r?\n/);

            for (const line of lines) {
                if (!line.trim()) continue;

                const row = [];
                let inQuote = false;
                let currentCell = '';

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];

                    if (char === '"') {
                        inQuote = !inQuote;
                    } else if (char === ',' && !inQuote) {
                        row.push(currentCell);
                        currentCell = '';
                    } else {
                        currentCell += char;
                    }
                }
                row.push(currentCell);
                rows.push(row);
            }

            if (rows.length === 0) {
                setCsvData('<div class="csv-error">No data found in CSV file</div>');
                return;
            }

            let html = '<div class="csv-table-wrapper"><table class="csv-preview-table">';

            if (rows[0]) {
                html += '<thead><tr>';
                rows[0].forEach(cell => {
                    html += `<th>${escapeHtmlForCSV(cell)}</th>`;
                });
                html += '</tr></thead>';
            }

            html += '<tbody>';
            for (let i = 1; i < rows.length; i++) {
                html += '<tr>';
                rows[i].forEach(cell => {
                    html += `<td>${escapeHtmlForCSV(cell)}</td>`;
                });
                html += '</tr>';
            }
            html += '</tbody></table></div>';

            setCsvData(html);
        } catch (error) {
            console.error("Error parsing CSV:", error);
            setCsvData('<div class="csv-error">Error loading CSV file</div>');
        } finally {
            setCsvLoading(false);
        }
    };

    // Load Google Identity Services + Google Picker Script
    useEffect(() => {
        const gisScript = document.createElement("script");
        gisScript.src = "https://accounts.google.com/gsi/client";
        gisScript.async = true;
        gisScript.onload = () => console.log("Google Identity Services loaded");
        document.body.appendChild(gisScript);

        const gapiScript = document.createElement("script");
        gapiScript.src = "https://apis.google.com/js/api.js";
        gapiScript.onload = () => {
            window.gapi.load("picker", () => {
                console.log("Google Picker API loaded");
            });
        };
        document.body.appendChild(gapiScript);
    }, []);

    const getFileType = (file) => {
        if (file.fileType) {
            const fileTypeLower = file.fileType.toLowerCase();

            if (fileTypeLower.includes('pdf')) {
                return 'pdf';
            }

            if (fileTypeLower.includes('jpeg') ||
                fileTypeLower.includes('jpg') ||
                fileTypeLower.includes('png') ||
                fileTypeLower.includes('gif') ||
                fileTypeLower.includes('webp') ||
                fileTypeLower.includes('heic') ||
                fileTypeLower.includes('heif') ||
                fileTypeLower.includes('image')) {
                return 'image';
            }

            if (fileTypeLower.includes('csv')) {
                return 'csv';
            }

            if (fileTypeLower.includes('sheet') ||
                fileTypeLower.includes('excel') ||
                fileTypeLower.includes('spreadsheetml')) {
                return 'excel';
            }
        }

        if (file.url) {
            const urlLower = file.url.toLowerCase();
            if (urlLower.includes('.pdf')) return 'pdf';
            if (urlLower.includes('.csv')) return 'csv';
            if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') ||
                urlLower.includes('.png') || urlLower.includes('.gif') ||
                urlLower.includes('.webp')) return 'image';
            if (urlLower.includes('.xls') || urlLower.includes('.xlsx')) return 'excel';
        }

        if (file.fileName) {
            const ext = file.fileName.split('.').pop().toLowerCase();
            if (ext === 'pdf') return 'pdf';
            if (ext === 'csv') return 'csv';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
            if (['xls', 'xlsx', 'xlsm'].includes(ext)) return 'excel';
        }

        return 'other';
    };

    const lockCategoryOnly = async (type, categoryName = null) => {
        if (!isMonthActive) {
            showError("Cannot lock category - Client was inactive during this period.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/clientupload/lock-category`,
                {
                    year,
                    month,
                    type,
                    categoryName: categoryName || null,
                    note: ""
                },
                { withCredentials: true }
            );

            showSuccess(response.data.message || `Category locked successfully!`);

            fetchMonthData(year, month);

            if (categoryName) {
                const updatedCategories = otherCategories.map(cat =>
                    cat.categoryName === categoryName ? { ...cat, note: "" } : cat
                );
                setOtherCategories(updatedCategories);
            } else {
                setCategoryNotes(prev => ({ ...prev, [type]: "" }));
            }

        } catch (error) {
            // ========== ADDED: 401 check ==========
            if (handleUnauthorized(error)) return;
            // ========== END OF 401 check ==========

            console.error("Lock category error:", error);
            showError(error.response?.data?.message || "Failed to lock category");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check for duplicate files in a category
    const checkDuplicateFilesInCategory = (files, categoryType, categoryName = null) => {
        const existingFileNames = new Set();

        // Get existing files from the category
        if (categoryName) {
            // For "other" categories
            const otherCategory = monthData?.other?.find(cat => cat.categoryName === categoryName);
            if (otherCategory?.document?.files) {
                otherCategory.document.files.forEach(file => {
                    existingFileNames.add(file.fileName.toLowerCase());
                });
            }
        } else {
            // For main categories (sales, purchase, bank)
            const mainCategory = monthData?.[categoryType];
            if (mainCategory?.files) {
                mainCategory.files.forEach(file => {
                    existingFileNames.add(file.fileName.toLowerCase());
                });
            }
        }

        // Check for duplicates
        const duplicateFiles = [];
        const newFileNamesSet = new Set();
        const internalDuplicates = [];

        for (const file of files) {
            const fileNameLower = file.name.toLowerCase();

            // Check against existing files in the category
            if (existingFileNames.has(fileNameLower)) {
                duplicateFiles.push(file.name);
            }

            // Check for duplicates within the new selection
            if (newFileNamesSet.has(fileNameLower)) {
                internalDuplicates.push(file.name);
            }
            newFileNamesSet.add(fileNameLower);
        }

        return { duplicateFiles, internalDuplicates };
    };

    // Delete Modal Functions
    const openDeleteModal = (type, fileName, categoryName = null) => {
        if (!isMonthActive) {
            showError("Cannot delete files - Client was inactive during this period.");
            return;
        }

        setDeleteModal({
            isOpen: true,
            fileName,
            fileType: type,
            categoryName,
            deleteNote: ""
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            fileName: "",
            fileType: "",
            categoryName: null,
            deleteNote: ""
        });
    };

    const confirmDelete = async () => {
        if (!isMonthActive) {
            showError("Cannot delete files - Client was inactive during this period.");
            closeDeleteModal();
            return;
        }

        const { fileName, fileType, categoryName, deleteNote } = deleteModal;

        if (!deleteNote.trim()) {
            showError("Please provide a reason for deletion");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/clientupload/delete-file`,
                {
                    data: {
                        year,
                        month,
                        type: fileType,
                        fileName,
                        categoryName,
                        deleteNote
                    },
                    withCredentials: true
                }
            );

            showSuccess(`File "${fileName}" deleted successfully.`);

            fetchMonthData(year, month);
            fetchDeletedFiles();
            closeDeleteModal();

        } catch (error) {
            // ========== ADDED: 401 check ==========
            if (handleUnauthorized(error)) return;
            // ========== END OF 401 check ==========

            console.error("Delete error:", error);
            showError(error.response?.data?.message || "Failed to delete file");
        } finally {
            setLoading(false);
        }
    };

    // Protection Functions
    const applyProtection = () => {
        if (!previewRef.current) return;

        const disableRightClick = (e) => {
            e.preventDefault();
            return false;
        };

        const disableDragStart = (e) => {
            e.preventDefault();
            return false;
        };

        const iframe = previewRef.current.querySelector('iframe, img, canvas, .protected-view-container');
        if (iframe) {
            iframe.addEventListener('contextmenu', disableRightClick);
            iframe.addEventListener('dragstart', disableDragStart);
            iframe.setAttribute('draggable', 'false');
        }

        previewRef.current.addEventListener('contextmenu', disableRightClick);
        previewRef.current.addEventListener('dragstart', disableDragStart);
    };

    const cleanupProtection = () => {
        if (!previewRef.current) return;

        const iframe = previewRef.current.querySelector('iframe, img, canvas, .protected-view-container');
        if (iframe) {
            iframe.removeEventListener('contextmenu', () => { });
            iframe.removeEventListener('dragstart', () => { });
        }
    };

    // Open Document Preview
    const openDocumentPreview = (document) => {
        if (!document || !document.url) return;

        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
        setIsDragging(false);
        setCsvData(null);
        setCsvZoomLevel(1);

        const fileType = getFileType(document);
        setPreviewDoc({ ...document, fileType });
        setIsPreviewOpen(true);

        if (fileType === 'csv') {
            parseCSVAndDisplay(document.url);
        }

        setTimeout(() => {
            applyProtection();
        }, 100);
    };

    // Close Document Preview
    const closeDocumentPreview = () => {
        cleanupProtection();
        setIsPreviewOpen(false);
        setPreviewDoc(null);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
        setIsDragging(false);
        setCsvData(null);
        setCsvLoading(false);
        setCsvZoomLevel(1);
    };

    // Open View All Modal
    const openViewAllModal = (categoryType, categoryName = null, categoryLabel) => {
        if (!monthData) return;

        let files = [];
        if (categoryName) {
            const otherCat = monthData.other?.find(cat => cat.categoryName === categoryName);
            files = otherCat?.document?.files || [];
        } else {
            files = monthData[categoryType]?.files || [];
        }

        const sortedFiles = [...files].sort((a, b) => {
            return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        });

        setViewAllModal({
            isOpen: true,
            categoryType,
            categoryName,
            categoryLabel,
            files: sortedFiles
        });

        // Reset selections when opening modal
        setSelectedFilesForDelete([]);
        setSelectAll(false);
    };

    // Close View All Modal
    const closeViewAllModal = () => {
        setViewAllModal({
            isOpen: false,
            categoryType: null,
            categoryName: null,
            categoryLabel: "",
            files: []
        });
        setSelectedFilesForDelete([]);
        setSelectAll(false);
    };

    const fetchMonthData = async (y, m) => {
        if (!y || !m) return;

        setLoading(true);

        try {
            const monthResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/clientupload/month-data`,
                {
                    params: { year: y, month: m },
                    withCredentials: true
                }
            );

            const data = monthResponse.data || {};
            console.log("✅ MONTH DATA RESPONSE:", data);

            try {
                const clientResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/client/me`,
                    { withCredentials: true }
                );

                console.log("✅ CLIENT DATA FROM PROFILE ENDPOINT:", clientResponse.data);
                setClientData(clientResponse.data);

                if (clientResponse.data?.planSelected) {
                    data.clientPlan = clientResponse.data.planSelected;
                }

            } catch (clientError) {
                // ========== ADDED: 401 check ==========
                if (handleUnauthorized(clientError)) return;
                // ========== END OF 401 check ==========
                console.error("❌ ERROR FETCHING CLIENT INFO:", clientError);
            }

            setMonthData(data);
            setIsMonthActive(data.monthActiveStatus !== 'inactive');

            const existingOtherCategories = data.other || [];
            setOtherCategories(existingOtherCategories.map(cat => ({
                ...cat,
                newFiles: [],
                note: ""
            })));

            const employeeResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/clientupload/employee-assignment`,
                {
                    params: { year: y, month: m },
                    withCredentials: true
                }
            );

            const assignments = employeeResponse.data || [];
            setEmployeeAssignments(assignments);

            if (assignments.length > 0 && assignments[0].task) {
                setSelectedTask(assignments[0].task);
            }

        } catch (error) {
            // ========== ADDED: 401 check ==========
            if (handleUnauthorized(error)) return;
            // ========== END OF 401 check ==========

            console.error("❌ FETCH MONTH DATA ERROR:", error);

            if (error.response?.status !== 404) {
                showError(error.response?.data?.message || "Failed to load month data");
            }

            setMonthData({
                isLocked: false,
                wasLockedOnce: false,
                sales: { files: [], categoryNotes: [], isLocked: false },
                purchase: { files: [], categoryNotes: [], isLocked: false },
                bank: { files: [], categoryNotes: [], isLocked: false },
                other: [],
                monthNotes: []
            });

            setOtherCategories([]);
            setEmployeeAssignments([]);
            setIsMonthActive(true);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Deleted Files
    const fetchDeletedFiles = async () => {
        if (!year || !month) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/clientupload/deleted-files`,
                {
                    params: { year, month },
                    withCredentials: true
                }
            );
            setDeletedFiles(response.data);
        } catch (error) {
            // ========== ADDED: 401 check ==========
            if (handleUnauthorized(error)) return;
            // ========== END OF 401 check ==========
            console.error("Error fetching deleted files:", error);
        }
    };

    // Handle Month/Year Change
    useEffect(() => {
        if (year && month) {
            fetchMonthData(year, month);
            fetchDeletedFiles();
        }
    }, [year, month]);

    // Check if category can be updated
    const canUpdateCategory = (categoryType, categoryName = null) => {
        if (!isMonthActive) return false;

        if (!monthData) return true;

        if (monthData.isLocked) {
            if (categoryType === "other" && categoryName) {
                const otherCat = monthData.other?.find(
                    cat => cat.categoryName === categoryName
                );
                return otherCat && !otherCat.document?.isLocked;
            } else {
                const category = monthData[categoryType];
                return category && !category.isLocked;
            }
        }

        return true;
    };

    // Check if this is an update
    const isUpdate = (categoryType, categoryName = null) => {
        if (!monthData) return false;

        if (categoryName) {
            const existingCat = monthData.other?.find(cat => cat.categoryName === categoryName);
            return existingCat?.document?.files && existingCat.document.files.length > 0;
        } else {
            const category = monthData[categoryType];
            return category && category.files && category.files.length > 0;
        }
    };

    // Check if update mode
    const isUpdateMode = (categoryType, categoryName = null) => {
        if (!monthData) return false;
        return monthData.wasLockedOnce === true;
    };

    // Check if note is required
    const isNoteRequired = (categoryType, categoryName = null) => {
        if (!monthData) return false;
        return monthData.wasLockedOnce === true && isUpdate(categoryType, categoryName);
    };

    // Handle files change with duplicate validation
    const handleFilesChange = (type, files, categoryName = null) => {
        if (!isMonthActive) {
            showError("❌ Cannot upload files - Client was inactive during this period.");
            return;
        }

        const fileArray = Array.from(files);

        // ========== NEW: CHECK FOR EMPTY/CORRUPT FILES ==========
        const emptyFiles = fileArray.filter(file => file.size === 0);
        if (emptyFiles.length > 0) {
            showError(`❌ Cannot upload: ${emptyFiles.map(f => f.name).join(', ')} - File(s) are empty (0 bytes). Please check the files and try again.`);
            return;
        }

        const corruptedFiles = fileArray.filter(file => file.size < 100 && file.size > 0);
        if (corruptedFiles.length > 0) {
            showError(`❌ Cannot upload: ${corruptedFiles.map(f => `${f.name} (${f.size} bytes)`).join(', ')} - File(s) appear corrupted or too small. Minimum file size is 100 bytes.`);
            return;
        }
        // ========== END OF NEW CHECK ==========

        // Check file size (10MB limit total for all files combined)
        const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 10 * 1024 * 1024) {
            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            showError(`❌ Total file size (${totalSizeMB}MB) exceeds 10MB limit. Please select smaller files.`);
            return;
        }

        // Check individual file size
        const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            showError(`❌ File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 10MB per file.`);
            return;
        }

        // Check file extensions
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'xls', 'xlsx', 'csv'];
        const invalidFiles = fileArray.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return !allowedExtensions.includes(ext);
        });

        if (invalidFiles.length > 0) {
            showError(`❌ Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Allowed: PDF, Images (JPG, PNG, GIF, WEBP, HEIC/HEIF), Excel (XLS, XLSX, CSV)`);
            return;
        }

        // Check for duplicate files
        const { duplicateFiles, internalDuplicates } = checkDuplicateFilesInCategory(fileArray, type, categoryName);

        // Check against currently selected new files (not yet uploaded)
        let currentNewFiles = [];
        if (categoryName) {
            const category = otherCategories.find(cat => cat.categoryName === categoryName);
            if (category && category.newFiles) {
                currentNewFiles = category.newFiles.map(f => f.name.toLowerCase());
            }
        } else {
            if (newFiles[type]) {
                currentNewFiles = newFiles[type].map(f => f.name.toLowerCase());
            }
        }

        const duplicatesWithPending = [];
        for (const file of fileArray) {
            if (currentNewFiles.includes(file.name.toLowerCase())) {
                duplicatesWithPending.push(file.name);
            }
        }

        // Show appropriate error messages
        if (duplicateFiles.length > 0) {
            const errorMsg = `❌ Cannot upload: ${duplicateFiles.join(', ')} - These file(s) already exist in this category.`;
            showError(errorMsg);
            return;
        }

        if (duplicatesWithPending.length > 0) {
            const errorMsg = `❌ Cannot upload: ${duplicatesWithPending.join(', ')} - These file(s) are already in your pending upload list for this category.`;
            showError(errorMsg);
            return;
        }

        if (internalDuplicates.length > 0) {
            const errorMsg = `❌ Cannot upload: ${internalDuplicates.join(', ')} - Duplicate file(s) selected in the same upload. Please select unique files.`;
            showError(errorMsg);
            return;
        }

        // If no duplicates, proceed with adding files
        if (categoryName) {
            const updatedCategories = [...otherCategories];
            const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);

            if (catIndex !== -1) {
                updatedCategories[catIndex].newFiles = [
                    ...(updatedCategories[catIndex].newFiles || []),
                    ...fileArray
                ];
                setOtherCategories(updatedCategories);
                showSuccess(`✅ ${fileArray.length} file(s) added to ${categoryName}`);
            } else {
                showError(`❌ Category "${categoryName}" not found`);
            }
        } else {
            setNewFiles(prev => ({
                ...prev,
                [type]: [...(prev[type] || []), ...fileArray]
            }));
            const typeNames = { sales: 'Sales', purchase: 'Purchase', bank: 'Bank' };
            showSuccess(`✅ ${fileArray.length} file(s) added to ${typeNames[type] || type}`);
        }
    };

    // Remove file from selection (updated with better feedback)
    const removeNewFile = (type, index, categoryName = null) => {
        if (!isMonthActive) {
            showError("❌ Cannot modify files - Client was inactive during this period.");
            return;
        }

        if (categoryName) {
            const updatedCategories = [...otherCategories];
            const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);

            if (catIndex !== -1) {
                const removedFile = updatedCategories[catIndex].newFiles[index];
                updatedCategories[catIndex].newFiles =
                    updatedCategories[catIndex].newFiles.filter((_, i) => i !== index);
                setOtherCategories(updatedCategories);
                showInfo(`🗑️ Removed: ${removedFile.name}`);
            }
        } else {
            setNewFiles(prev => {
                const removedFile = prev[type][index];
                const updated = {
                    ...prev,
                    [type]: prev[type].filter((_, i) => i !== index)
                };
                showInfo(`🗑️ Removed: ${removedFile.name}`);
                return updated;
            });
        }
    };

    // Add new other category
    const addOtherCategory = () => {
        if (!isMonthActive) {
            showError("Cannot add categories - Client was inactive during this period.");
            return;
        }

        if (!newOtherCategory.trim()) {
            showWarning("Please enter a category name");
            return;
        }

        if (otherCategories.some(cat => cat.categoryName.toLowerCase() === newOtherCategory.trim().toLowerCase())) {
            showError(`Category "${newOtherCategory.trim()}" already exists`);
            return;
        }

        const mainCategoryNames = ["Sales", "Purchase", "Bank"];

        const isMainCategory = mainCategoryNames.some(
            name => name.toLowerCase() === newOtherCategory.trim().toLowerCase()
        );

        if (isMainCategory) {
            showError(`Cannot create category "${newOtherCategory.trim()}" - This is a main category name. Please use a different name.`);
            return;
        }

        const newCat = {
            categoryName: newOtherCategory.trim(),
            document: { files: [], categoryNotes: [], isLocked: false },
            newFiles: [],
            note: ""
        };

        setOtherCategories(prev => [...prev, newCat]);
        setNewOtherCategory("");
        showSuccess(`Category "${newCat.categoryName}" added successfully`);
    };

    // Upload files
    const uploadFiles = async (type, files, categoryName = null, isReplacement = false, replacedFileName = null, lockAfterUpload = false) => {
        if (!isMonthActive) {
            showError("Cannot upload files - Client was inactive during this period.");
            return;
        }

        if (!files || files.length === 0) return;

        const MAX_TOTAL_SIZE = 10 * 1024 * 1024;
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        if (totalSize > MAX_TOTAL_SIZE) {
            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            showError(`❌ Total file size (${totalSizeMB}MB) exceeds the maximum allowed of 10MB for all files combined. Please reduce file sizes.`);
            return;
        }

        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            showError(`❌ File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 10MB per file.`);
            return;
        }

        const noteRequired = isNoteRequired(type, categoryName);

        if (noteRequired && !categoryName && !categoryNotes[type]) {
            showError("Note is required when updating files after unlock");
            return;
        }

        if (noteRequired && categoryName) {
            const cat = otherCategories.find(c => c.categoryName === categoryName);
            if (cat && !cat.note) {
                showError("Note is required when updating files after unlock");
                return;
            }
        }

        const formData = new FormData();

        files.forEach((file, index) => {
            formData.append("files", file);
        });

        formData.append("year", year);
        formData.append("month", month);
        formData.append("type", type);

        if (categoryName) {
            formData.append("categoryName", categoryName);
        }

        if (isReplacement && replacedFileName) {
            formData.append("replacedFile", replacedFileName);
            formData.append("deleteNote", "Replaced with new file");
        }

        if (noteRequired) {
            const note = categoryName
                ? otherCategories.find(c => c.categoryName === categoryName)?.note
                : categoryNotes[type];
            formData.append("note", note || "");
        }

        if (lockAfterUpload) {
            formData.append("lockAfterUpload", "true");
        }

        setLoading(true);

        try {
            const endpoint = lockAfterUpload
                ? `${import.meta.env.VITE_API_URL}/clientupload/upload-and-lock`
                : `${import.meta.env.VITE_API_URL}/clientupload/upload`;

            const response = await axios.post(
                endpoint,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                    maxContentLength: 50 * 1024 * 1024,
                    maxBodyLength: 50 * 1024 * 1024
                }
            );

            showSuccess(response.data.message || `${files.length} file(s) uploaded successfully!`);

            fetchMonthData(year, month);
            fetchDeletedFiles();

            if (categoryName) {
                const updatedCategories = otherCategories.map(cat =>
                    cat.categoryName === categoryName
                        ? { ...cat, newFiles: [], note: "" }
                        : cat
                );
                setOtherCategories(updatedCategories);
            } else {
                setNewFiles(prev => ({ ...prev, [type]: [] }));
                setCategoryNotes(prev => ({ ...prev, [type]: "" }));
            }

        } catch (error) {
            // ========== ADDED: 401 check ==========
            if (handleUnauthorized(error)) return;
            // ========== END OF 401 check ==========

            console.error("Upload error:", error);

            if (error.response?.status === 413) {
                showError("❌ File too large! Maximum total size is 10MB for all files combined.");
            } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                showError("❌ Upload failed - file too large or network issue. Maximum total size is 10MB.");
            } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                showError("❌ Upload timeout - file too large. Maximum total size is 10MB.");
            } else if (error.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError("❌ Upload failed. Please check that total file size is under 10MB and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Save & Lock Month
    const saveAndLock = async () => {
        if (!isMonthActive) {
            showError("Cannot lock month - Client was inactive during this period.");
            return;
        }

        if (!year || !month) {
            showError("Please select year and month");
            return;
        }

        const hasUpdates = Object.values(newFiles).some(f => f.length > 0) ||
            otherCategories.some(c => c.newFiles.length > 0);

        if (hasUpdates && monthData?.wasLockedOnce && !monthNote.trim()) {
            showError("Month note is required when updating files after unlock");
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/clientupload/save-lock`,
                { year, month },
                { withCredentials: true }
            );

            showSuccess("Month saved and locked successfully!");

            fetchMonthData(year, month);
            setMonthNote("");

        } catch (error) {
            // ========== ADDED: 401 check ==========
            if (handleUnauthorized(error)) return;
            // ========== END OF 401 check ==========

            console.error("Save & lock error:", error);
            showError(error.response?.data?.message || "Failed to save and lock month");
        } finally {
            setLoading(false);
        }
    };

    // Get file icon
    const getFileIcon = (type) => {
        switch (type) {
            case 'sales': return <FiTrendingUp />;
            case 'purchase': return <FiPackage />;
            case 'bank': return <FiCreditCard />;
            default: return <FiFileText />;
        }
    };

    // Get status badge
    const getStatusBadge = (isLocked) => (
        <span className={`status-badge ${isLocked ? 'locked' : 'unlocked'}`}>
            {isLocked ? (
                <>
                    <FiLock size={12} /> Locked
                </>
            ) : (
                <>
                    <FiUnlock size={12} /> Unlocked
                </>
            )}
        </span>
    );

    // Google Drive Functions
    const authenticateDrive = (categoryInfo) => {
        if (!window.google || !window.google.accounts) {
            showError("Google Identity Services not loaded. Please refresh.");
            return;
        }

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.file",
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    showError("Google Drive authentication failed: " + tokenResponse.error);
                    return;
                }
                openGooglePicker(tokenResponse.access_token, categoryInfo);
            },
        });

        tokenClient.requestAccessToken();
    };

    const openGooglePicker = (accessToken, categoryInfo) => {
        if (!window.google || !window.google.picker) {
            showError("Google Picker not loaded. Please refresh.");
            return;
        }

        window.scrollTo(0, 0);

        const view = new window.google.picker.DocsView()
            .setIncludeFolders(true)
            .setMode(window.google.picker.DocsViewMode.GRID);

        const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(accessToken)
            .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
            .setAppId(import.meta.env.VITE_GOOGLE_APP_ID)
            .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
            .setCallback((data) => pickerCallback(data, accessToken, categoryInfo))
            .build();

        picker.setVisible(true);
    };

    const pickerCallback = async (data, accessToken, categoryInfo) => {
        if (data.action !== window.google.picker.Action.PICKED) {
            return;
        }

        const files = data.docs;
        if (!files || files.length === 0) return;

        setDriveLoading(true);
        showInfo(`Processing ${files.length} file(s) from Google Drive...`);

        const downloadedFiles = [];
        let successCount = 0;
        let errorCount = 0;

        for (const file of files) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/google-drive-proxy`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            fileId: file.id,
                            accessToken: accessToken,
                        }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error(`Failed to download ${file.name}:`, errorData);
                    errorCount++;
                    continue;
                }

                const contentDisposition = response.headers.get("Content-Disposition");
                let filename = file.name;
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (match && match[1]) {
                        filename = match[1].replace(/['"]/g, "");
                        try {
                            filename = decodeURIComponent(filename);
                        } catch (e) { }
                    }
                }

                const blob = await response.blob();
                const newFile = new File([blob], filename, { type: blob.type });

                downloadedFiles.push(newFile);
                successCount++;
            } catch (err) {
                console.error("Download error:", err);
                errorCount++;
            }
        }

        setDriveLoading(false);

        if (successCount > 0) {
            showSuccess(`Successfully downloaded ${successCount} file(s) from Google Drive.`);
        }
        if (errorCount > 0) {
            showError(`Failed to download ${errorCount} file(s). Check console for details.`);
        }

        if (downloadedFiles.length === 0) return;

        const { type, categoryName } = categoryInfo;

        if (categoryName) {
            setOtherCategories(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(c => c.categoryName === categoryName);
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        newFiles: [...(updated[idx].newFiles || []), ...downloadedFiles],
                    };
                }
                return updated;
            });
        } else {
            setNewFiles(prev => ({
                ...prev,
                [type]: [...(prev[type] || []), ...downloadedFiles],
            }));
        }
    };

    // Render Existing Files Info
    const renderExistingFilesInfo = (category, categoryType, categoryName = null) => {
        if (!category || !category.files || category.files.length === 0) return null;

        return (
            <div className="existing-files-info">
                <div className="files-header">
                    <div className="files-count">
                        <span className="count-badge">
                            <FiFolder size={14} /> {category.files.length} file(s)
                        </span>
                        {getStatusBadge(category.isLocked)}
                        {category.files.length > 0 && (
                            <button
                                className="view-all-btn"
                                onClick={() => openViewAllModal(
                                    categoryType,
                                    categoryName,
                                    categoryName || (categoryType === 'sales' ? 'Sales Files (Income)' :
                                        categoryType === 'purchase' ? 'Purchase Files (Purchases)' :
                                            categoryType === 'bank' ? 'Bank Statements' : categoryType)
                                )}
                                title="View all files"
                            >
                                <FiEye size={14} /> View All
                            </button>
                        )}
                    </div>
                </div>

                <div className="files-list">
                    {category.files.slice(0, 3).map((file, index) => (
                        <div key={index} className="file-item">
                            <div className="file-icon">
                                {getFileIcon(categoryType)}
                                {file.notes && file.notes.length > 0 && (
                                    <span className="file-icon-badge">
                                        <FiBell size={8} />
                                    </span>
                                )}
                            </div>
                            <div className="file-details">
                                <div className="file-name">
                                    {file.fileName}
                                    {file.notes && file.notes.length > 0 && (
                                        <span className="file-notification-text">
                                            <FiBell size={12} /> {file.notes.length} note{file.notes.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <div className="file-meta">
                                    <span className="file-size">
                                        <FiFile size={12} /> {(file.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                    <span className="upload-date">
                                        <FiClock size={12} /> {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>

                                    {file.notes && file.notes.length > 0 && (
                                        <span
                                            className="notes-badge"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const noteKey = categoryName
                                                    ? `${categoryType}-${categoryName}-${index}`
                                                    : `${categoryType}-${index}`;
                                                setShowEmployeeNotes(prev => ({
                                                    ...prev,
                                                    [noteKey]: !prev[noteKey]
                                                }));
                                            }}
                                            style={{ cursor: 'pointer' }}
                                            title={`${file.notes.length} employee note(s) - Click to view`}
                                        >
                                            <FiMessageSquare size={12} /> View notes
                                        </span>
                                    )}
                                </div>

                                {showEmployeeNotes[categoryName
                                    ? `${categoryType}-${categoryName}-${index}`
                                    : `${categoryType}-${index}`] && file.notes && file.notes.length > 0 && (
                                        <div className="employee-notes-section">
                                            <div className="notes-label">
                                                <FiUser size={14} /> Employee Feedback:
                                            </div>
                                            <div className="notes-list">
                                                {file.notes.map((note, noteIndex) => (
                                                    <div key={noteIndex} className="employee-note-item">
                                                        <div className="employee-note-text">
                                                            <strong>Note:</strong> {note.note}
                                                        </div>
                                                        <div className="employee-note-meta">
                                                            <span className="employee-note-by">
                                                                <FiUser size={12} /> {note.employeeName || note.addedBy || 'Employee'}
                                                            </span>
                                                            <span className="employee-note-date">
                                                                <FiClock size={12} /> {new Date(note.addedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                            <div className="file-actions">
                                <button
                                    className="btn-preview-small"
                                    onClick={() => openDocumentPreview(file)}
                                    title="Preview"
                                >
                                    <FiEye size={14} />
                                </button>
                                {canUpdateCategory(categoryType, categoryName) && !category.isLocked && (
                                    <button
                                        className="btn-delete-small"
                                        onClick={() => openDeleteModal(categoryType, file.fileName, categoryName)}
                                        title="Delete this file"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {category.files.length > 3 && (
                        <div className="more-files-hint">
                            <FiInfo size={12} />
                            <span>+{category.files.length - 3} more file(s). Click "View All" to see all files.</span>
                        </div>
                    )}
                </div>

                {category.categoryNotes && category.categoryNotes.length > 0 && (
                    <div className="category-notes-section">
                        <div
                            className="notes-header-toggle"
                            onClick={() => setShowCategoryNotes(prev => ({
                                ...prev,
                                [categoryName || categoryType]: !prev[categoryName || categoryType]
                            }))}
                        >
                            <div className="notes-label">
                                <FiInfo size={14} /> Update History ({category.categoryNotes.length})
                            </div>
                            <button className="notes-toggle-btn">
                                {showCategoryNotes[categoryName || categoryType] ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                            </button>
                        </div>

                        {showCategoryNotes[categoryName || categoryType] && (
                            <div className="notes-list">
                                {category.categoryNotes.map((noteItem, index) => (
                                    <div key={index} className="note-item">
                                        <div className="note-text">{noteItem.note}</div>
                                        <div className="note-meta">
                                            <span className="note-by">
                                                <FiUser size={12} /> {noteItem.employeeName || noteItem.addedBy || 'Client'}
                                            </span>
                                            <span className="note-date">
                                                <FiClock size={12} />
                                                {new Date(noteItem.addedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Render Selected Files
    const renderSelectedFiles = (files, type, categoryName = null) => {
        if (!files || files.length === 0) return null;

        return (
            <div className="selected-files-list">
                <div className="selected-files-header">
                    <span className="selected-count">
                        <FiFileText size={14} /> {files.length} file(s) selected
                    </span>
                    <button
                        className="btn-clear-all"
                        onClick={() => {
                            if (!isMonthActive) {
                                showError("Cannot modify files - Client was inactive during this period.");
                                return;
                            }

                            if (categoryName) {
                                const updatedCategories = [...otherCategories];
                                const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);
                                if (catIndex !== -1) {
                                    updatedCategories[catIndex].newFiles = [];
                                    setOtherCategories(updatedCategories);
                                }
                            } else {
                                setNewFiles(prev => ({ ...prev, [type]: [] }));
                            }
                        }}
                    >
                        <FiTrash2 size={14} /> Clear All
                    </button>
                </div>
                <div className="selected-files-items">
                    {files.map((file, index) => (
                        <div key={index} className="selected-file-item">
                            <span className="selected-file-name">
                                <FiFile size={14} /> {file.name}
                                <span className="selected-file-size">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </span>
                            <button
                                className="btn-remove-file"
                                onClick={() => removeNewFile(type, index, categoryName)}
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render Delete Modal
    const renderDeleteModal = () => {
        if (!deleteModal.isOpen) return null;

        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                closeDeleteModal();
            }
        };

        return (
            <div className="delete-confirmation-modal">
                <div
                    className="modal-overlay"
                    onClick={handleOverlayClick}
                ></div>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>
                            <FiAlertCircle size={20} /> Confirm Delete
                        </h3>
                        <button className="close-modal-btn" onClick={closeDeleteModal}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="warning-message">
                            <FiAlertCircle className="warning-icon" />
                            <p>Are you sure you want to delete <strong>"{deleteModal.fileName}"</strong>?</p>
                            <p className="warning-text">This action will be recorded in the audit trail and cannot be undone.</p>
                        </div>

                        <div className="delete-reason-section">
                            <label className="reason-label">
                                Reason for deletion <span className="required-asterisk">*</span>
                            </label>
                            <textarea
                                className="reason-textarea"
                                placeholder="Please provide a reason for deleting this file..."
                                value={deleteModal.deleteNote}
                                onChange={(e) => setDeleteModal(prev => ({
                                    ...prev,
                                    deleteNote: e.target.value
                                }))}
                                rows={3}
                                required
                            />
                            <small className="reason-hint">This reason will be saved in the audit trail</small>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn-cancel"
                            onClick={closeDeleteModal}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-delete-confirm"
                            onClick={confirmDelete}
                            disabled={loading || !deleteModal.deleteNote.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Deleting...
                                </>
                            ) : (
                                <>
                                    <FiTrash2 size={16} /> Delete File
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render Bulk Delete Modal
    const renderBulkDeleteModal = () => {
        if (!bulkDeleteModal.isOpen) return null;

        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                closeBulkDeleteModal();
            }
        };

        return (
            <div className="delete-confirmation-modal">
                <div className="modal-overlay" onClick={handleOverlayClick}></div>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>
                            <FiAlertCircle size={20} /> Confirm Bulk Delete
                        </h3>
                        <button className="close-modal-btn" onClick={closeBulkDeleteModal}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="warning-message">
                            <FiAlertCircle className="warning-icon" />
                            <p>Are you sure you want to delete <strong>{bulkDeleteModal.selectedFiles.length} file(s)</strong>?</p>
                            <div className="files-to-delete-list">
                                <strong>Files to delete:</strong>
                                <ul>
                                    {bulkDeleteModal.selectedFiles.map((fileName, idx) => (
                                        <li key={idx}>{fileName}</li>
                                    ))}
                                </ul>
                            </div>
                            <p className="warning-text">This action will be recorded in the audit trail and cannot be undone.</p>
                        </div>

                        <div className="delete-reason-section">
                            <label className="reason-label">
                                Reason for deletion <span className="required-asterisk">*</span>
                            </label>
                            <textarea
                                className="reason-textarea"
                                placeholder="Please provide a reason for deleting these files..."
                                value={bulkDeleteModal.deleteNote}
                                onChange={(e) => setBulkDeleteModal(prev => ({
                                    ...prev,
                                    deleteNote: e.target.value
                                }))}
                                rows={3}
                                required
                            />
                            <small className="reason-hint">
                                This reason will be saved for ALL deleted files in the audit trail
                            </small>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn-cancel"
                            onClick={closeBulkDeleteModal}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-delete-confirm"
                            onClick={confirmBulkDelete}
                            disabled={loading || !bulkDeleteModal.deleteNote.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Deleting...
                                </>
                            ) : (
                                <>
                                    <FiTrash2 size={16} /> Delete {bulkDeleteModal.selectedFiles.length} File(s)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const confirmBulkDelete = async () => {
        if (!bulkDeleteModal.deleteNote.trim()) {
            showError("Please provide a reason for deletion");
            return;
        }

        // Find files using URL as unique identifier
        const filesToDelete = viewAllModal.files.filter(
            file => bulkDeleteModal.selectedFileUrls?.includes(file.url)
        );

        if (filesToDelete.length === 0) {
            showError("No files selected for deletion");
            return;
        }

        const filesData = filesToDelete.map(file => ({
            type: viewAllModal.categoryType,
            fileName: file.fileName,
            fileUrl: file.url, // Include URL for backend validation
            categoryName: viewAllModal.categoryName || null
        }));

        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/clientupload/delete-multiple-files`,
                {
                    year,
                    month,
                    files: filesData,
                    deleteNote: bulkDeleteModal.deleteNote.trim()
                },
                { withCredentials: true }
            );

            showSuccess(response.data.message || `${filesToDelete.length} file(s) deleted successfully!`);

            fetchMonthData(year, month);
            fetchDeletedFiles();

            closeBulkDeleteModal();
            closeViewAllModal();
            setSelectedFilesForDelete([]);
            setSelectAll(false);

        } catch (error) {
            // ========== ADDED: 401 check ==========
            if (handleUnauthorized(error)) return;
            // ========== END OF 401 check ==========

            console.error("Bulk delete error:", error);
            showError(error.response?.data?.message || "Failed to delete files");
        } finally {
            setLoading(false);
        }
    };

    const closeBulkDeleteModal = () => {
        setBulkDeleteModal({
            isOpen: false,
            selectedFiles: [],
            selectedFileUrls: [], // Add this to track URLs
            deleteNote: ""
        });
    };

    // Render View All Modal WITH MULTIPLE DELETE - Using file URL as unique identifier
    const renderViewAllModal = () => {
        if (!viewAllModal.isOpen) return null;

        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                closeViewAllModal();
            }
        };

        // Handle file selection for bulk delete using URL as unique identifier
        const toggleFileSelection = (fileUrl) => {
            setSelectedFilesForDelete(prev => {
                if (prev.includes(fileUrl)) {
                    return prev.filter(f => f !== fileUrl);
                } else {
                    return [...prev, fileUrl];
                }
            });
        };

        const toggleSelectAll = () => {
            if (selectAll) {
                setSelectedFilesForDelete([]);
            } else {
                setSelectedFilesForDelete(viewAllModal.files.map(f => f.url));
            }
            setSelectAll(!selectAll);
        };

        const openBulkDeleteModal = () => {
            if (selectedFilesForDelete.length === 0) {
                showError("Please select files to delete");
                return;
            }

            if (!isMonthActive) {
                showError("Cannot delete files - Client was inactive during this period.");
                return;
            }

            // Get file names for display from selected URLs
            const selectedFileNames = viewAllModal.files
                .filter(file => selectedFilesForDelete.includes(file.url))
                .map(file => file.fileName);

            setBulkDeleteModal({
                isOpen: true,
                selectedFiles: selectedFileNames, // Store names for display
                selectedFileUrls: selectedFilesForDelete, // Store URLs for actual deletion
                deleteNote: ""
            });
        };

        // CHECK IF CATEGORY IS UNLOCKED
        const canDeleteFiles = () => {
            if (!monthData) return false;

            if (viewAllModal.categoryName) {
                const otherCat = monthData.other?.find(cat => cat.categoryName === viewAllModal.categoryName);
                return otherCat && !otherCat.document?.isLocked;
            } else {
                const category = monthData[viewAllModal.categoryType];
                return category && !category.isLocked;
            }
        };

        const canDelete = canDeleteFiles();

        return (
            <>
                <div className="view-all-modal">
                    <div className="modal-overlay" onClick={handleOverlayClick}></div>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>
                                <FiFolder size={20} /> {viewAllModal.categoryLabel}
                                <span className="file-count-badge">{viewAllModal.files.length} files</span>
                            </h3>
                            <button className="close-modal-btn" onClick={closeViewAllModal}>
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {viewAllModal.files.length === 0 ? (
                                <div className="no-files-message">
                                    <FiFile size={32} />
                                    <p>No files in this category</p>
                                </div>
                            ) : (
                                <>
                                    {/* Bulk Delete Toolbar - Show ONLY if category is UNLOCKED */}
                                    {canDelete && (
                                        <div className="bulk-delete-toolbar">
                                            <div className="select-controls">
                                                <label className="select-all-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectAll}
                                                        onChange={toggleSelectAll}
                                                    />
                                                    <span>Select All</span>
                                                </label>
                                                <span className="selected-count">
                                                    {selectedFilesForDelete.length} file(s) selected
                                                </span>
                                            </div>
                                            {selectedFilesForDelete.length > 0 && (
                                                <button
                                                    className="btn-bulk-delete"
                                                    onClick={openBulkDeleteModal}
                                                    disabled={loading}
                                                >
                                                    <FiTrash2 size={16} /> Delete Selected
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Show message if category is locked */}
                                    {!canDelete && (
                                        <div className="category-locked-message">
                                            <FiLock size={14} />
                                            <span>This category is locked. Cannot delete files.</span>
                                        </div>
                                    )}

                                    <div className="files-list-full">
                                        {viewAllModal.files.map((file, index) => {
                                            const isSelected = selectedFilesForDelete.includes(file.url);

                                            return (
                                                <div key={file.url || index} className={`file-list-item ${isSelected ? 'selected' : ''}`}>
                                                    {/* Show checkbox ONLY if category is UNLOCKED */}
                                                    {canDelete && (
                                                        <div className="file-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleFileSelection(file.url)}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="file-info">
                                                        <div className="file-icon">
                                                            {viewAllModal.categoryType === 'sales' ? <FiTrendingUp /> :
                                                                viewAllModal.categoryType === 'purchase' ? <FiPackage /> :
                                                                    viewAllModal.categoryType === 'bank' ? <FiCreditCard /> : <FiFileText />}
                                                            {file.notes && file.notes.length > 0 && (
                                                                <span className="file-icon-badge-small">
                                                                    <FiBell size={8} />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="file-details-full">
                                                            <div className="file-name-row">
                                                                <span className="file-name-text" title={file.fileName}>
                                                                    {file.fileName}
                                                                </span>
                                                                {file.notes && file.notes.length > 0 && (
                                                                    <span className="notes-indicator">
                                                                        <FiMessageSquare size={12} /> {file.notes.length}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="file-meta-small">
                                                                <span className="file-size">
                                                                    <FiFile size={10} /> {(file.fileSize / 1024).toFixed(1)} KB
                                                                </span>
                                                                <span className="upload-date">
                                                                    <FiClock size={10} /> {new Date(file.uploadedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="file-actions-full">
                                                        <button
                                                            className="btn-view-file"
                                                            onClick={() => {
                                                                openDocumentPreview(file);
                                                                closeViewAllModal();
                                                            }}
                                                            title="Preview file"
                                                        >
                                                            <FiEye size={16} /> View
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-close" onClick={closeViewAllModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
                {renderBulkDeleteModal()}
            </>
        );
    };

    // Render File Upload Section
    const renderFileSection = (type, label) => {
        const category = monthData?.[type];
        const canUpload = canUpdateCategory(type);
        const fileUpdate = isUpdate(type);
        const noteRequired = isNoteRequired(type);
        const hasNewFiles = newFiles[type] && newFiles[type].length > 0;
        const updateMode = isUpdateMode(type);

        const showLockButton = updateMode && category && !category.isLocked;

        const hasNotesInCategory = category?.files?.some(file =>
            file.notes && file.notes.length > 0
        );

        const monthInactive = !isMonthActive;

        return (
            <div className="file-upload-card" key={type}>
                <div className="file-header">
                    <h4 className="file-title">
                        {getFileIcon(type)} {label}
                        {hasNotesInCategory && (
                            <span className="category-notes-alert" title="Some files have employee notes">
                                <FiBell size={14} /> Notes
                            </span>
                        )}
                    </h4>
                    {category?.isLocked && (
                        <span className="locked-label">
                            <FiLock size={14} /> Category Locked
                        </span>
                    )}
                </div>

                <div className="upload-size-note">
                    <FiInfo size={13} />
                    <span>Max upload limit: <strong>10MB</strong> per submission (single or multiple files combined)</span>
                </div>

                {category && renderExistingFilesInfo(category, type)}

                {monthInactive && (
                    <div className="inactive-month-message">
                        <FiAlertCircle size={16} />
                        <span>Cannot modify files - Client was inactive during this period</span>
                    </div>
                )}

                <div className="file-upload-area">
                    <div className="upload-controls">
                        <label className="file-input-label">
                            <input
                                type="file"
                                className="file-input"
                                disabled={!canUpload || loading || monthInactive}
                                multiple
                                onChange={(e) => handleFilesChange(type, e.target.files)}
                            />
                            <span className={`file-input-button ${!canUpload || loading || monthInactive ? 'disabled' : ''}`}>
                                <FiUpload size={18} /> Choose Files
                            </span>
                        </label>

                        <button
                            className="drive-icon-btn"
                            onClick={() => authenticateDrive({ type, categoryName: null })}
                            disabled={!canUpload || loading || monthInactive}
                            title={!canUpload || monthInactive ? "Cannot add files - Category locked or month inactive" : "Add files from Google Drive"}
                        >
                            <FaGoogleDrive size={20} />
                        </button>

                        {showLockButton && (
                            <button
                                className="btn-lock-category"
                                onClick={() => lockCategoryOnly(type, null)}
                                disabled={loading || monthInactive}
                                title="Lock this category"
                            >
                                <FiLock size={16} /> Lock Category
                            </button>
                        )}
                    </div>
                    <span className="file-input-hint">(Multiple files allowed)</span>

                    {!canUpload && !monthInactive && (
                        <small className="disabled-hint">
                            Category is locked. Contact admin to unlock.
                        </small>
                    )}
                </div>

                {renderSelectedFiles(newFiles[type], type)}

                {(noteRequired && hasNewFiles) && (
                    <div className="note-section">
                        <label className="note-label">
                            Update Note <span className="required-asterisk">*</span>
                            <span className="note-subtitle">Required after unlock</span>
                        </label>
                        <textarea
                            className="note-textarea"
                            placeholder="Explain why you're updating files in this category..."
                            value={categoryNotes[type] || ""}
                            onChange={(e) =>
                                setCategoryNotes(prev => ({ ...prev, [type]: e.target.value }))
                            }
                            required
                            disabled={loading || monthInactive}
                        />
                        <small className="note-hint">
                            Required when updating files after month has been unlocked
                        </small>
                    </div>
                )}

                {hasNewFiles && canUpload && !monthInactive && (
                    <div className="upload-buttons">
                        <button
                            className="btn-upload"
                            onClick={() => uploadFiles(type, newFiles[type])}
                            disabled={loading || monthInactive}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Uploading...
                                </>
                            ) : fileUpdate ? (
                                `Upload ${newFiles[type].length} Additional File(s)`
                            ) : (
                                `Upload ${newFiles[type].length} File(s)`
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render Other Category
    const renderOtherCategory = (cat, index) => {
        const category = cat.document;
        const canUploadCat = canUpdateCategory("other", cat.categoryName);
        const isCatUpdate = isUpdate("other", cat.categoryName);
        const noteRequired = isNoteRequired("other", cat.categoryName);
        const hasNewFiles = cat.newFiles && cat.newFiles.length > 0;
        const updateMode = isUpdateMode("other", cat.categoryName);

        const showLockButton = updateMode && category && !category.isLocked;

        const hasNotesInCategory = category?.files?.some(file =>
            file.notes && file.notes.length > 0
        );

        const monthInactive = !isMonthActive;

        return (
            <div className="file-upload-card other-category" key={index}>
                <div className="category-header">
                    <h5 className="category-title">
                        <FiFolder size={16} /> {cat.categoryName}
                        {hasNotesInCategory && (
                            <span className="category-notes-alert" title="Some files have employee notes">
                                <FiBell size={12} /> Notes
                            </span>
                        )}
                    </h5>
                    {category?.isLocked && (
                        <span className="locked-label">
                            <FiLock size={14} /> Category Locked
                        </span>
                    )}
                </div>

                <div className="upload-size-note">
                    <FiInfo size={13} />
                    <span>Max upload limit: <strong>10MB</strong> per submission (single or multiple files combined)</span>
                </div>

                {category && renderExistingFilesInfo(category, "other", cat.categoryName)}

                {monthInactive && (
                    <div className="inactive-month-message">
                        <FiAlertCircle size={16} />
                        <span>Cannot modify files - Client was inactive during this period</span>
                    </div>
                )}

                <div className="file-upload-area">
                    <div className="upload-controls">
                        <label className="file-input-label">
                            <input
                                type="file"
                                className="file-input"
                                disabled={!canUploadCat || loading || monthInactive}
                                multiple
                                onChange={(e) => handleFilesChange("other", e.target.files, cat.categoryName)}
                            />
                            <span className={`file-input-button ${!canUploadCat || loading || monthInactive ? 'disabled' : ''}`}>
                                <FiUpload size={18} /> Choose Files
                            </span>
                        </label>

                        <button
                            className="drive-icon-btn"
                            onClick={() => authenticateDrive({ type: "other", categoryName: cat.categoryName })}
                            disabled={!canUploadCat || loading || monthInactive}
                            title={!canUploadCat || monthInactive ? "Cannot add files - Category locked or month inactive" : "Add files from Google Drive"}
                        >
                            <FaGoogleDrive size={20} />
                        </button>

                        {showLockButton && (
                            <button
                                className="btn-lock-category"
                                onClick={() => {
                                    console.log("Locking category:", cat.categoryName);
                                    lockCategoryOnly("other", cat.categoryName);
                                }}
                                disabled={loading || monthInactive}
                                title="Lock this category"
                            >
                                <FiLock size={16} /> Lock Category
                            </button>
                        )}
                    </div>
                    <span className="file-input-hint">(Multiple files allowed)</span>

                    {!canUploadCat && category && !monthInactive && (
                        <small className="disabled-hint">
                            Category is locked. Contact admin to unlock.
                        </small>
                    )}
                </div>

                {renderSelectedFiles(cat.newFiles, "other", cat.categoryName)}

                {(noteRequired && hasNewFiles) && (
                    <div className="note-section">
                        <label className="note-label">
                            Update Note <span className="required-asterisk">*</span>
                            <span className="note-subtitle">Required after unlock</span>
                        </label>
                        <textarea
                            className="note-textarea"
                            placeholder="Explain why you're updating files in this category..."
                            value={cat.note || ""}
                            onChange={(e) => {
                                if (!isMonthActive) {
                                    showError("Cannot modify files - Client was inactive during this period.");
                                    return;
                                }

                                const updatedCategories = [...otherCategories];
                                updatedCategories[index].note = e.target.value;
                                setOtherCategories(updatedCategories);
                            }}
                            required
                            disabled={loading || monthInactive}
                        />
                        <small className="note-hint">
                            Required when updating files after month has been unlocked
                        </small>
                    </div>
                )}

                {hasNewFiles && canUploadCat && !monthInactive && (
                    <div className="upload-buttons">
                        <button
                            className="btn-upload"
                            onClick={() => uploadFiles("other", cat.newFiles, cat.categoryName)}
                            disabled={loading || monthInactive}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Uploading...
                                </>
                            ) : isCatUpdate ? (
                                `Upload ${cat.newFiles.length} Additional File(s)`
                            ) : (
                                `Upload ${cat.newFiles.length} File(s)`
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render Document Preview
    const renderDocumentPreview = () => {
        if (!previewDoc || !isPreviewOpen) return null;

        const fileType = previewDoc.fileType || getFileType(previewDoc);

        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                closeDocumentPreview();
            }
        };

        return (
            <div
                className={`document-preview-modal ${isPreviewOpen ? 'open' : ''}`}
                onClick={handleOverlayClick}
            >
                <div className="preview-modal-overlay"></div>
                <div
                    className="preview-modal-content"
                    ref={previewRef}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }}
                >
                    <div className="preview-modal-header">
                        <h3 className="preview-title">
                            <span className="file-icon">
                                {fileType === 'pdf' && <FiFileText size={18} />}
                                {fileType === 'image' && <FiImage size={18} />}
                                {fileType === 'excel' && <FiGrid size={18} />}
                                {fileType === 'csv' && <FiGrid size={18} />}
                                {fileType === 'other' && <FiFile size={18} />}
                            </span>
                            {previewDoc.fileName}
                            <span className="file-type-badge">
                                {fileType.toUpperCase()}
                            </span>
                        </h3>
                        <button
                            className="close-preview-btn"
                            onClick={closeDocumentPreview}
                            title="Close Preview"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <div
                        className="preview-modal-body"
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <div className="protection-note">
                            <FiLock size={16} />
                            <span className="protection-text">
                                SECURE VIEW: Downloading and right-click disabled
                            </span>
                            <span className="zoom-hint">
                                <FiZoomIn size={14} /> Use zoom controls or Ctrl+Mouse Wheel to zoom
                            </span>
                        </div>

                        {fileType === 'pdf' && (
                            <div className="protected-view-container pdf-viewer-container">
                                <iframe
                                    src={`${previewDoc.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                    title="Protected PDF Viewer"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    className="pdf-iframe"
                                    scrolling="yes"
                                    style={{ display: 'block', border: 'none' }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return false;
                                    }}
                                />
                            </div>
                        )}

                        {fileType === 'image' && (
                            <div className="image-viewer-wrapper">
                                <div className="zoom-controls">
                                    <button
                                        onClick={handleZoomOut}
                                        disabled={zoomLevel <= 0.5}
                                        className="zoom-btn"
                                        title="Zoom Out"
                                    >
                                        <FiZoomOut size={18} />
                                    </button>
                                    <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                                    <button
                                        onClick={handleZoomIn}
                                        disabled={zoomLevel >= 3}
                                        className="zoom-btn"
                                        title="Zoom In"
                                    >
                                        <FiZoomIn size={18} />
                                    </button>
                                    <button
                                        onClick={handleZoomReset}
                                        className="zoom-btn reset"
                                        title="Reset Zoom"
                                    >
                                        <FiMaximize size={16} />
                                        <span>Reset</span>
                                    </button>
                                </div>

                                <div
                                    className="image-scroll-container"
                                    ref={imageScrollRef}
                                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                                    onMouseDown={(e) => {
                                        if (zoomLevel > 1) {
                                            setIsDragging(true);
                                            setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
                                        }
                                    }}
                                    onMouseMove={(e) => {
                                        if (isDragging && zoomLevel > 1) {
                                            setImagePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
                                        }
                                    }}
                                    onMouseUp={() => setIsDragging(false)}
                                    onMouseLeave={() => setIsDragging(false)}
                                    style={{
                                        overflow: 'auto',
                                        maxHeight: '70vh',
                                        backgroundColor: '#f5f5f5',
                                        cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                    }}
                                >
                                    <div
                                        className="image-transform-wrapper"
                                        style={{
                                            transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                                            transformOrigin: 'center',
                                            transition: isDragging ? 'none' : 'transform 0.1s ease',
                                            display: 'inline-block',
                                            minWidth: '100%',
                                            minHeight: '100%',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <img
                                            src={previewDoc.url}
                                            alt={previewDoc.fileName}
                                            draggable={false}
                                            onContextMenu={(e) => { e.preventDefault(); return false; }}
                                            onDragStart={(e) => e.preventDefault()}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                display: 'block',
                                                margin: '0 auto'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {fileType === 'csv' && (
                            <div className="csv-viewer-wrapper">
                                <div className="zoom-controls">
                                    <button
                                        onClick={() => setCsvZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                                        disabled={csvZoomLevel <= 0.5}
                                        className="zoom-btn"
                                        title="Zoom Out"
                                    >
                                        <FiZoomOut size={18} />
                                    </button>
                                    <span className="zoom-level">{Math.round(csvZoomLevel * 100)}%</span>
                                    <button
                                        onClick={() => setCsvZoomLevel(prev => Math.min(prev + 0.1, 3))}
                                        disabled={csvZoomLevel >= 3}
                                        className="zoom-btn"
                                        title="Zoom In"
                                    >
                                        <FiZoomIn size={18} />
                                    </button>
                                    <button
                                        onClick={() => setCsvZoomLevel(1)}
                                        className="zoom-btn reset"
                                        title="Reset Zoom"
                                    >
                                        <FiMaximize size={16} />
                                        <span>Reset</span>
                                    </button>
                                </div>

                                <div
                                    className="csv-scroll-container"
                                    style={{
                                        flex: 1,
                                        overflow: 'auto',
                                        background: '#ffffff',
                                        position: 'relative'
                                    }}
                                >
                                    {csvLoading ? (
                                        <div className="csv-loading">
                                            <div className="loading-spinner-small"></div>
                                            <p>Loading CSV data...</p>
                                        </div>
                                    ) : csvData ? (
                                        <div
                                            className="csv-table-container"
                                            style={{
                                                display: 'inline-block',
                                                minWidth: '100%',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    zoom: csvZoomLevel,
                                                    MozTransform: `scale(${csvZoomLevel})`,
                                                    MozTransformOrigin: '0 0',
                                                    display: 'inline-block',
                                                    minWidth: '100%'
                                                }}
                                            >
                                                <div dangerouslySetInnerHTML={{ __html: csvData }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="csv-error">Unable to load CSV file</div>
                                    )}
                                </div>
                                <div className="viewer-info">
                                    <FiInfo size={12} />
                                    <span style={{ marginLeft: '5px' }}>
                                        CSV file displayed as table. Use zoom controls to adjust view. Data is read-only.
                                    </span>
                                </div>
                            </div>
                        )}

                        {fileType === 'excel' && (
                            <div className="excel-viewer-wrapper">
                                <div className="zoom-controls">
                                    <button
                                        onClick={handleZoomOut}
                                        disabled={zoomLevel <= 0.5}
                                        className="zoom-btn"
                                        title="Zoom Out"
                                    >
                                        <FiZoomOut size={18} />
                                    </button>
                                    <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                                    <button
                                        onClick={handleZoomIn}
                                        disabled={zoomLevel >= 3}
                                        className="zoom-btn"
                                        title="Zoom In"
                                    >
                                        <FiZoomIn size={18} />
                                    </button>
                                    <button
                                        onClick={handleZoomReset}
                                        className="zoom-btn reset"
                                        title="Reset Zoom"
                                    >
                                        <FiMaximize size={16} />
                                        <span>Reset</span>
                                    </button>
                                </div>

                                <div
                                    className="protected-view-container excel-viewer-container"
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return false;
                                    }}
                                    style={{
                                        height: '70vh',
                                        position: 'relative',
                                        overflow: 'auto',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <div
                                        style={{
                                            transform: `scale(${zoomLevel})`,
                                            transformOrigin: 'top left',
                                            transition: 'transform 0.1s ease',
                                            width: `${100 / zoomLevel}%`,
                                            height: `${100 / zoomLevel}%`,
                                            minWidth: '100%',
                                            minHeight: '100%'
                                        }}
                                    >
                                        <iframe
                                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewDoc.url)}&wdStartOn=1`}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            style={{ border: 'none', display: 'block' }}
                                            title={`Excel Viewer - ${previewDoc.fileName}`}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return false;
                                            }}
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                                        />
                                    </div>
                                </div>

                                <div className="viewer-info" style={{
                                    padding: '10px',
                                    backgroundColor: '#f5f5f5',
                                    fontSize: '12px',
                                    borderTop: '1px solid #ddd'
                                }}>
                                    <FiInfo size={12} />
                                    <span style={{ marginLeft: '5px' }}>
                                        Online Excel Viewer - Full screen available via top-right icon
                                    </span>
                                </div>
                            </div>
                        )}

                        {fileType === 'other' && (
                            <div
                                className="protected-view-container other-file-container"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '8px'
                                }}
                            >
                                <FiFile size={64} style={{ marginBottom: '20px', color: '#666' }} />
                                <h4 style={{ marginBottom: '10px' }}>File Preview Not Available</h4>
                                <p style={{ marginBottom: '20px', color: '#666' }}>
                                    This file type cannot be previewed in the browser.
                                </p>
                                <div className="file-info-box" style={{
                                    backgroundColor: '#fff',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }}>
                                    <p><strong>File Name:</strong> {previewDoc.fileName}</p>
                                    <p><strong>File Size:</strong> {(previewDoc.fileSize / 1024).toFixed(1)} KB</p>
                                    <p><strong>Security:</strong> File download is disabled</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="preview-modal-footer">
                        <div className="file-info-simple">
                            <span className="file-size">
                                <FiFile size={14} /> Size: {(previewDoc.fileSize / 1024).toFixed(1)} KB
                            </span>
                            <span className="upload-date">
                                <FiClock size={14} /> Uploaded: {previewDoc.uploadedAt ?
                                    new Date(previewDoc.uploadedAt).toLocaleDateString() :
                                    'N/A'}
                            </span>
                            <span className="file-type-indicator">
                                Type: {fileType.toUpperCase()}
                            </span>
                        </div>

                        <button
                            className="btn-close-preview"
                            onClick={closeDocumentPreview}
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ClientLayout>
            <div className="client-files-upload">
                {/* Header */}
                <div className="upload-header">
                    <div className="header-left">
                        <h2>Upload Accounting Documents</h2>
                        <p className="subtitle">
                            Select month and upload your files
                        </p>
                    </div>

                    <div className="header-right">
                        {!clientData?.isActive ? (
                            <div className="active-plan-badge inactive">
                                <FiAlertCircle size={16} />
                                <span className="inactive-text">Account Inactive</span>
                            </div>
                        ) : monthData?.clientPlan ? (
                            <div className="active-plan-badge">
                                <span className="plan-label">Active Plan:</span>
                                <span className="plan-name">
                                    {monthData.clientPlan}
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="main-content">
                    {/* Left Sidebar - Month Selection */}
                    <div className="upload-sidebar">
                        <div className="sidebar-header">
                            <h3>
                                <FiCalendar size={20} /> Month Selection
                            </h3>
                        </div>

                        <div className="month-selection-section">
                            <div className="form-group">
                                <label className="form-label">Select Year</label>
                                <select
                                    className="form-control"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Choose Year</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select Month</label>
                                <select
                                    className="form-control"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Choose Month</option>
                                    {monthNames.map((name, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {month && year && (
                                <div className="selected-month-display">
                                    <div className="current-month-text">
                                        {monthNames[parseInt(month) - 1]} {year}
                                    </div>
                                    {monthData?.isLocked && (
                                        <div className="month-lock-indicator">
                                            <FiLock size={12} /> Month Locked
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Month Info Panel */}
                        {monthData && (
                            <div className="month-info-panel">
                                <div className="info-section">
                                    <div className="info-header">
                                        <h4>
                                            <FiInfo size={18} /> Month Status
                                        </h4>
                                    </div>
                                    <div className="info-details">
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Status:</span>
                                                {monthData.isLocked ? (
                                                    <span className="value locked">
                                                        <FiLock size={14} /> Locked
                                                    </span>
                                                ) : (
                                                    <span className="value unlocked">
                                                        <FiUnlock size={14} /> Unlocked
                                                    </span>
                                                )}
                                            </div>
                                            {monthData.wasLockedOnce && (
                                                <div className="info-item">
                                                    <span className="label">Update Mode:</span>
                                                    <span className="value note-required">
                                                        Notes Required
                                                    </span>
                                                </div>
                                            )}
                                            {monthData.lockedAt && (
                                                <div className="info-item">
                                                    <span className="label">Locked At:</span>
                                                    <span className="value">
                                                        {new Date(monthData.lockedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="info-item">
                                                <span className="label">Client Status:</span>
                                                <span className={`value ${isMonthActive ? 'active' : 'inactive'}`}>
                                                    {isMonthActive ? (
                                                        <>✅ Active</>
                                                    ) : (
                                                        <>❌ Inactive - No modifications allowed</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Employee Assignment */}
                        {employeeAssignments.length > 0 && (
                            <div className="employee-info-panel">
                                <div className="info-section">
                                    <div className="info-header">
                                        <h4>
                                            <FiUser size={18} /> Assigned Tasks
                                        </h4>
                                    </div>

                                    <div className="task-selection-dropdown">
                                        <label className="dropdown-label">
                                            <FiList size={14} /> Select Task
                                        </label>
                                        <select
                                            className="task-dropdown"
                                            value={selectedTask || ""}
                                            onChange={(e) => setSelectedTask(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="">All Tasks</option>
                                            {Array.from(new Set(employeeAssignments.map(a => a.task)))
                                                .filter(task => task)
                                                .map(task => (
                                                    <option key={task} value={task}>
                                                        {task}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="employee-list-section">
                                        {(() => {
                                            const filteredAssignments = selectedTask
                                                ? employeeAssignments.filter(a => a.task === selectedTask)
                                                : employeeAssignments;

                                            if (filteredAssignments.length === 0) {
                                                return (
                                                    <div className="no-employee-message">
                                                        <FiInfo size={14} />
                                                        No tasks assigned
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="employee-assignments-list">
                                                    {filteredAssignments.map((assignment, index) => (
                                                        <div key={index} className="employee-assignment-card">
                                                            <div className="employee-header">
                                                                <div className="employee-name">
                                                                    <FiUser size={14} /> Assigned
                                                                </div>
                                                                <span className={`task-badge task-${assignment.task?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                                    {assignment.task || "No Task"}
                                                                </span>
                                                            </div>

                                                            <div className="employee-details">
                                                                <div className="detail-row">
                                                                    <span className="detail-label">
                                                                        <FiClock size={12} /> Status:
                                                                    </span>
                                                                    <span className={`detail-value ${assignment.accountingDone ? 'accounting-done' : 'accounting-pending'}`}>
                                                                        {assignment.accountingDone ? (
                                                                            <>
                                                                                <FiCheckCircle size={12} /> Completed
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FiAlertCircle size={12} /> Pending
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {assignment.accountingDoneAt && (
                                                                    <div className="detail-row">
                                                                        <span className="detail-label">
                                                                            <FiCalendar size={12} /> Completed:
                                                                        </span>
                                                                        <span className="detail-value">
                                                                            {new Date(assignment.accountingDoneAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="upload-content">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading month data...</p>
                            </div>
                        ) : (!year || !month) ? (
                            <div className="no-selection-state">
                                <FiCalendar size={64} />
                                <h3>Select Month and Year</h3>
                                <p>Choose a month and year to view and upload documents</p>
                            </div>
                        ) : (
                            <>
                                {/* Main Documents */}
                                <div className="files-section">
                                    <div className="section-header">
                                        <h3>
                                            <FiFolder size={20} /> Main Documents
                                        </h3>
                                        <p className="section-subtitle">
                                            Upload multiple files for each category
                                        </p>
                                    </div>

                                    <div className="files-grid">
                                        {renderFileSection("sales", "Sales Files (Income)")}
                                        {renderFileSection("purchase", "Purchase Files (Purchases)")}
                                        {renderFileSection("bank", "Bank Statements")}
                                    </div>
                                </div>

                                {/* Other Documents */}
                                <div className="files-section">
                                    <div className="section-header">
                                        <h3>
                                            <FiFolder size={20} /> Additional Documents
                                        </h3>
                                        <div className="add-category-control">
                                            <div className="search-box">
                                                <input
                                                    type="text"
                                                    placeholder="New category name"
                                                    value={newOtherCategory}
                                                    onChange={(e) => {
                                                        if (!isMonthActive) {
                                                            showError("Cannot add categories - Client was inactive during this period.");
                                                            return;
                                                        }
                                                        setNewOtherCategory(e.target.value);
                                                    }}
                                                    disabled={monthData?.isLocked || loading || !isMonthActive}
                                                />
                                                <button
                                                    className="filter-btn"
                                                    onClick={addOtherCategory}
                                                    disabled={monthData?.isLocked || loading || !isMonthActive}
                                                >
                                                    <FiPlus size={16} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="section-subtitle">
                                        Optional supporting documents (multiple files per category)
                                    </p>

                                    {otherCategories.length === 0 ? (
                                        <div className="empty-state">
                                            <FiFolder size={32} />
                                            <p>No additional categories added yet.</p>
                                        </div>
                                    ) : (
                                        <div className="files-grid">
                                            {otherCategories.map((cat, index) => renderOtherCategory(cat, index))}
                                        </div>
                                    )}
                                </div>

                                {/* Save & Lock Button */}
                                <div className="month-actions-section">
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn lock-btn"
                                            onClick={saveAndLock}
                                            disabled={!year || !month || monthData?.isLocked || loading || !isMonthActive}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner"></span> Processing...
                                                </>
                                            ) : monthData?.isLocked ? (
                                                <>
                                                    <FiLock size={16} /> Month is Locked
                                                </>
                                            ) : !isMonthActive ? (
                                                <>
                                                    <FiLock size={16} /> Month Inactive
                                                </>
                                            ) : (
                                                <>
                                                    <FiSave size={16} /> Save & Lock Month
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {(!year || !month) && (
                                        <small className="form-hint">
                                            Please select both year and month to proceed
                                        </small>
                                    )}

                                    {monthData?.isLocked && (
                                        <small className="form-hint">
                                            Month is already locked. Contact admin to unlock.
                                        </small>
                                    )}

                                    {!isMonthActive && (
                                        <small className="form-hint inactive-hint">
                                            <FiAlertCircle size={12} /> Month is inactive - No modifications allowed
                                        </small>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {renderDeleteModal()}

                {/* Document Preview Modal */}
                {renderDocumentPreview()}

                {/* View All Files Modal */}
                {renderViewAllModal()}
            </div>

            {/* Google Drive Loading Overlay with Modal */}
            {driveLoading && (
                <div className="drive-loading-overlay">
                    <div className="drive-loading-modal">
                        <div className="drive-loading-spinner"></div>
                        <p>Processing files from Google Drive...</p>
                        <small>This may take a few seconds</small>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
};

export default ClientFilesUpload;