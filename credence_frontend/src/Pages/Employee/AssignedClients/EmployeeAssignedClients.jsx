import { useEffect, useState, useRef } from "react";
import axios from "axios";
import EmployeeLayout from "../Layout/EmployeeLayout";
import {
  FiUsers,
  FiCalendar,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiUnlock,
  FiDownload,
  FiEye,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInfo,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiFile,
  FiPlus,
  FiMessageSquare,
  FiRefreshCw,
  FiEdit,
  FiUserCheck,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiChevronLeft,
  FiImage,
  FiGrid,
  FiArrowLeft,
  FiArrowRight,
  FiCheckSquare,
  FiSquare,
  FiZoomIn,
  FiZoomOut,
  FiMaximize
} from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";
import "./EmployeeAssignedClients.scss";
import audit from "../../../assets/Images/employee/audit.png";

const EmployeeAssignedClients = () => {
  /* ================= STATE ================= */
  const [assignments, setAssignments] = useState([]);
  const [groupedAssignments, setGroupedAssignments] = useState({});
  const [clientList, setClientList] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [activeMonthYear, setActiveMonthYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [updatingAccounting, setUpdatingAccounting] = useState(false);

  /* ================= NOTES MODAL STATE ================= */
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedFileForNote, setSelectedFileForNote] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [activeFilesData, setActiveFilesData] = useState(null);

  /* ================= ALL NOTES MODAL STATE (NEW) ================= */
  const [showAllNotesModal, setShowAllNotesModal] = useState(false);
  const [allNotesData, setAllNotesData] = useState({ notes: [], fileName: "", categoryName: "" });

  /* ================= DOCUMENT PREVIEW STATES ================= */
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewCategoryName, setPreviewCategoryName] = useState("");
  const [currentCategoryFiles, setCurrentCategoryFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const previewRef = useRef(null);
  const imageScrollRef = useRef(null);

  /* ================= ZOOM AND PAN STATES ================= */
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  /* ================= CSV STATES ================= */
  const [csvData, setCsvData] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvZoomLevel, setCsvZoomLevel] = useState(1);

  /* ================= EXPANDED CATEGORY NOTES STATE ================= */
  const [expandedCategoryNotes, setExpandedCategoryNotes] = useState({});

  /* ================= EXPANDED MONTH GROUPS STATE ================= */
  const [expandedMonthGroups, setExpandedMonthGroups] = useState({});

  /* ================= FILE VIEWED STATUS STATE ================= */
  const [fileViewedStatus, setFileViewedStatus] = useState({});
  const [checkingViewed, setCheckingViewed] = useState(false);

  /* ================= FILE AUDIT STATUS STATE (NEW) ================= */
  const [fileAuditStatus, setFileAuditStatus] = useState({});
  const [checkingAudit, setCheckingAudit] = useState(false);

  /* ================= CSV HELPER FUNCTIONS ================= */
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
        html += '<thead></tr>';
        rows[0].forEach(cell => {
          html += `<th>${escapeHtmlForCSV(cell)}</th>`;
        });
        html += '</thead>';
      }

      html += '<tbody>';
      for (let i = 1; i < rows.length; i++) {
        html += '<tr>';
        rows[i].forEach(cell => {
          html += `<tr>${escapeHtmlForCSV(cell)}</table>`;
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

  /* ================= ZOOM FUNCTIONS ================= */
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

  /* ================= PAN FUNCTIONS FOR IMAGES ================= */
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

  /* ================= IMPROVED FILE TYPE DETECTION WITH CSV ================= */
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

  const loadAssignedClients = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/assigned-clients`,
        { withCredentials: true }
      );

      const data = res.data;

      setAssignments(data);

      const grouped = groupAssignmentsByMonthYear(data);
      setGroupedAssignments(grouped);

      const clientMap = {};
      data.forEach((row) => {
        if (!row.client || !row.client.clientId) return;

        if (!clientMap[row.client.clientId]) {
          clientMap[row.client.clientId] = {
            ...row.client,
            assignmentCount: 0,
            tasksByMonth: {}
          };
        }
        clientMap[row.client.clientId].assignmentCount++;

        const monthKey = `${row.year}-${row.month}`;
        if (!clientMap[row.client.clientId].tasksByMonth[monthKey]) {
          clientMap[row.client.clientId].tasksByMonth[monthKey] = [];
        }
        clientMap[row.client.clientId].tasksByMonth[monthKey].push({
          task: row.task || 'Bookkeeping',
          accountingDone: row.accountingDone,
          assignedAt: row.assignedAt,
          year: row.year,
          month: row.month
        });
      });

      const clientsArray = Object.values(clientMap);

      const sortedClients = [...clientsArray].sort((a, b) => {
        const nameA = a.name.toLowerCase().trim();
        const nameB = b.name.toLowerCase().trim();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      setClientList(sortedClients);
      setFilteredClients(sortedClients);

      if (sortedClients.length > 0) {
        const defaultClient = sortedClients[0];
        setActiveClient(defaultClient);

        const clientAssignments = getAssignmentsForClient(defaultClient.clientId);
        if (clientAssignments.length > 0) {
          const firstMonthYear = Object.keys(grouped[defaultClient.clientId] || {})[0];
          if (firstMonthYear) {
            setActiveMonthYear(firstMonthYear);
            const monthAssignments = grouped[defaultClient.clientId][firstMonthYear];
            if (monthAssignments && monthAssignments.length > 0) {
              setActiveAssignment(monthAssignments[0]);
            }
          }
        } else {
          setActiveAssignment(null);
          setActiveMonthYear(null);
        }
      } else {
        setActiveClient(null);
        setActiveAssignment(null);
        setActiveMonthYear(null);
      }

    } catch (error) {
      console.error("Error loading assigned clients", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= GROUP ASSIGNMENTS BY MONTH-YEAR ================= */
  const groupAssignmentsByMonthYear = (assignmentsList) => {
    const grouped = {};

    assignmentsList.forEach(assignment => {
      const clientId = assignment.client.clientId;
      const monthKey = `${assignment.year}-${assignment.month}`;

      if (!grouped[clientId]) {
        grouped[clientId] = {};
      }

      if (!grouped[clientId][monthKey]) {
        grouped[clientId][monthKey] = [];
      }

      grouped[clientId][monthKey].push(assignment);
    });

    Object.keys(grouped).forEach(clientId => {
      Object.keys(grouped[clientId]).forEach(monthKey => {
        grouped[clientId][monthKey].sort((a, b) => {
          const taskOrder = {
            'Bookkeeping': 1,
            'VAT Filing Computation': 2,
            'VAT Filing': 3,
            'Financial Statement Generation': 4
          };
          return (taskOrder[a.task] || 99) - (taskOrder[b.task] || 99);
        });
      });
    });

    return grouped;
  };

  /* ================= LOAD FILES DATA ================= */
  const loadAssignmentFiles = async (clientId, year, month) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/assignment-files`,
        {
          params: { clientId, year, month },
          withCredentials: true
        }
      );
      setActiveFilesData(res.data);
    } catch (error) {
      console.error("Error loading assignment files:", error);
      setActiveFilesData(null);
    }
  };

  useEffect(() => {
    if (activeAssignment) {
      loadAssignmentFiles(
        activeAssignment.client.clientId,
        activeAssignment.year,
        activeAssignment.month
      );
    }
  }, [activeAssignment]);

  useEffect(() => {
    const loadAllViewedStatus = async () => {
      if (!activeAssignment || !activeFilesData) return;

      const categories = [
        { type: 'sales', files: activeFilesData.categories?.sales?.files },
        { type: 'purchase', files: activeFilesData.categories?.purchase?.files },
        { type: 'bank', files: activeFilesData.categories?.bank?.files },
        ...(activeFilesData.categories?.other?.map(cat => ({
          type: 'other',
          name: cat.categoryName,
          files: cat.files
        })) || [])
      ];

      for (const category of categories) {
        if (!category.files) continue;

        for (const file of category.files) {
          await checkFileViewedStatus({
            categoryType: category.type,
            categoryName: category.name || null,
            fileName: file.fileName,
            url: file.url
          });
          await checkFileAuditStatus({
            categoryType: category.type,
            categoryName: category.name || null,
            fileName: file.fileName,
            url: file.url
          });
        }
      }
    };

    if (activeFilesData) {
      loadAllViewedStatus();
    }
  }, [activeFilesData, activeAssignment]);

  useEffect(() => {
    loadAssignedClients();
  }, []);

  /* ================= FILTER CLIENTS BASED ON SEARCH TERM, YEAR & MONTH ================= */
  useEffect(() => {
    let filtered = clientList;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearFilter || monthFilter) {
      filtered = filtered.filter(client => {
        const clientAssignments = assignments.filter(a => a.client.clientId === client.clientId);

        if (clientAssignments.length === 0) return false;

        return clientAssignments.some(assignment => {
          let matches = true;

          if (yearFilter) {
            matches = matches && assignment.year.toString() === yearFilter;
          }

          if (monthFilter) {
            matches = matches && assignment.month.toString() === monthFilter;
          }

          return matches;
        });
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const nameA = a.name.toLowerCase().trim();
      const nameB = b.name.toLowerCase().trim();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    setFilteredClients(sorted);

    if (activeClient && sorted.length > 0) {
      const isActiveInFiltered = sorted.some(c => c.clientId === activeClient.clientId);
      if (!isActiveInFiltered) {
        setActiveClient(sorted[0]);
        setActiveAssignment(null);
        setActiveMonthYear(null);
      }
    } else if (sorted.length > 0 && !activeClient) {
      setActiveClient(sorted[0]);
    } else if (sorted.length === 0) {
      setActiveClient(null);
      setActiveAssignment(null);
      setActiveMonthYear(null);
    }

  }, [searchTerm, yearFilter, monthFilter, clientList, assignments, activeClient]);

  useEffect(() => {
    const grouped = groupAssignmentsByMonthYear(assignments);
    setGroupedAssignments(grouped);
  }, [assignments]);

  /* ================= CHECK FILE VIEWED STATUS ================= */
  const checkFileViewedStatus = async (fileData) => {
    if (!fileData || !activeAssignment) return;

    try {
      setCheckingViewed(true);

      const clientId = activeAssignment.client.clientId;
      const { year, month } = activeAssignment;
      const { categoryType, categoryName, fileName, url } = fileData;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/check-file-viewed`,
        {
          params: {
            clientId,
            year,
            month,
            categoryType,
            categoryName: categoryName || undefined,
            fileName,
            fileUrl: url
          },
          withCredentials: true
        }
      );

      const fileKey = `${clientId}-${year}-${month}-${categoryType}-${categoryName || 'main'}-${fileName}-${url || 'no-url'}`;

      setFileViewedStatus(prev => ({
        ...prev,
        [fileKey]: response.data.isViewed
      }));

      return response.data.isViewed;

    } catch (error) {
      console.error("Error checking file viewed status:", error);
      return false;
    } finally {
      setCheckingViewed(false);
    }
  };

  /* ================= TOGGLE FILE VIEWED STATUS ================= */
  const toggleFileViewed = async (fileData) => {
    if (!fileData || !activeAssignment || checkingViewed) return;

    if (!activeAssignment.client?.clientId) {
      console.error("No clientId found in activeAssignment");
      return null;
    }

    try {
      setCheckingViewed(true);

      const clientId = activeAssignment.client.clientId;
      const { year, month, task } = activeAssignment;
      const { categoryType, categoryName, fileName, url } = fileData;

      if (!url) {
        console.error("No fileUrl provided for file:", fileName);
        return null;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/toggle-file-viewed`,
        {
          clientId,
          year,
          month,
          categoryType,
          categoryName: categoryName || undefined,
          fileName,
          fileUrl: url,
          task
        },
        { withCredentials: true }
      );

      const fileKey = `${clientId}-${year}-${month}-${categoryType}-${categoryName || 'main'}-${fileName}-${url}`;

      setFileViewedStatus(prev => ({
        ...prev,
        [fileKey]: response.data.isViewed
      }));

      return response.data.isViewed;

    } catch (error) {
      console.error("Error toggling file viewed status:", error);
      return null;
    } finally {
      setCheckingViewed(false);
    }
  };

  /* ================= GET FILE VIEWED STATUS ================= */
  const getFileViewedStatus = (fileData) => {
    if (!fileData || !activeAssignment) return false;

    const clientId = activeAssignment.client.clientId;
    const { year, month } = activeAssignment;
    const { categoryType, categoryName, fileName, url } = fileData;

    const fileKey = `${clientId}-${year}-${month}-${categoryType}-${categoryName || 'main'}-${fileName}-${url || 'no-url'}`;

    return fileViewedStatus[fileKey] || false;
  };

  /* ================= CHECK FILE AUDIT STATUS ================= */
  const checkFileAuditStatus = async (fileData) => {
    if (!fileData || !activeAssignment) return;

    try {
      setCheckingAudit(true);

      const clientId = activeAssignment.client.clientId;
      const { year, month } = activeAssignment;
      const { categoryType, categoryName, fileName, url } = fileData;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/check-file-audited`,
        {
          params: {
            clientId,
            year,
            month,
            categoryType,
            categoryName: categoryName || undefined,
            fileName,
            fileUrl: url
          },
          withCredentials: true
        }
      );

      const fileKey = `${clientId}-${year}-${month}-${categoryType}-${categoryName || 'main'}-${fileName}-${url || 'no-url'}`;

      setFileAuditStatus(prev => ({
        ...prev,
        [fileKey]: response.data.isAudited
      }));

      return response.data.isAudited;

    } catch (error) {
      console.error("Error checking file audit status:", error);
      return false;
    } finally {
      setCheckingAudit(false);
    }
  };


  /* ================= TOGGLE FILE AUDIT STATUS ================= */
  const toggleFileAudit = async (fileData) => {
    if (!fileData || !activeAssignment || checkingAudit) return;

    if (!activeAssignment.client?.clientId) {
      console.error("No clientId found in activeAssignment");
      return null;
    }

    try {
      setCheckingAudit(true);

      const clientId = activeAssignment.client.clientId;
      const { year, month, task } = activeAssignment;
      const { categoryType, categoryName, fileName, url } = fileData;

      if (!url) {
        console.error("No fileUrl provided for file:", fileName);
        return null;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/toggle-file-audited`,
        {
          clientId,
          year,
          month,
          categoryType,
          categoryName: categoryName || undefined,
          fileName,
          fileUrl: url,
          task
        },
        { withCredentials: true }
      );

      const fileKey = `${clientId}-${year}-${month}-${categoryType}-${categoryName || 'main'}-${fileName}-${url}`;

      setFileAuditStatus(prev => ({
        ...prev,
        [fileKey]: response.data.isAudited
      }));

      return response.data.isAudited;

    } catch (error) {
      console.error("Error toggling file audit status:", error);
      return null;
    } finally {
      setCheckingAudit(false);
    }
  };

  /* ================= GET FILE AUDIT STATUS ================= */
  const getFileAuditStatus = (fileData) => {
    if (!fileData || !activeAssignment) return false;

    const clientId = activeAssignment.client.clientId;
    const { year, month } = activeAssignment;
    const { categoryType, categoryName, fileName, url } = fileData;

    const fileKey = `${clientId}-${year}-${month}-${categoryType}-${categoryName || 'main'}-${fileName}-${url || 'no-url'}`;

    return fileAuditStatus[fileKey] || false;
  };

  /* ================= OPEN ALL NOTES MODAL (NEW) ================= */
  const openAllNotesModal = (notes, fileName, categoryName) => {
    setAllNotesData({
      notes: notes,
      fileName: fileName,
      categoryName: categoryName
    });
    setShowAllNotesModal(true);
  };

  const closeAllNotesModal = () => {
    setShowAllNotesModal(false);
    setAllNotesData({ notes: [], fileName: "", categoryName: "" });
  };

  /* ================= DOCUMENT PREVIEW PROTECTION ================= */
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

    const disableTextSelect = (e) => {
      e.preventDefault();
      return false;
    };

    const disableShortcuts = (e) => {
      if ((e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'p' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
    };

    const iframe = previewRef.current.querySelector('iframe, img, canvas, .protected-view-container');
    if (iframe) {
      iframe.addEventListener('contextmenu', disableRightClick);
      iframe.addEventListener('dragstart', disableDragStart);
      iframe.addEventListener('selectstart', disableTextSelect);
      iframe.addEventListener('keydown', disableShortcuts);
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
      iframe.removeEventListener('selectstart', () => { });
      iframe.removeEventListener('keydown', () => { });
    }
  };

  /* ================= useEffect for image wheel/pinch zoom ================= */
  useEffect(() => {
    const el = imageScrollRef.current;
    if (!el || !isPreviewOpen) return;

    const handleWheel = (e) => {
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
  }, [isPreviewOpen]);

  /* ================= GET FILES FROM CATEGORY ================= */
  const getFilesFromCategory = (fileName, categoryType, categoryName = null) => {
    if (!activeFilesData || !activeFilesData.categories) return [];

    if (categoryType === 'sales' && activeFilesData.categories.sales) {
      return activeFilesData.categories.sales.files || [];
    } else if (categoryType === 'purchase' && activeFilesData.categories.purchase) {
      return activeFilesData.categories.purchase.files || [];
    } else if (categoryType === 'bank' && activeFilesData.categories.bank) {
      return activeFilesData.categories.bank.files || [];
    } else if (categoryType === 'other' && activeFilesData.categories.other) {
      const otherCategory = activeFilesData.categories.other.find(
        cat => cat.categoryName === categoryName
      );
      return otherCategory?.files || [];
    }
    return [];
  };

  /* ================= OPEN DOCUMENT PREVIEW WITH CSV SUPPORT ================= */
  const openDocumentPreview = async (document, categoryType = null, categoryName = null) => {
    if (!document || !document.url) return;

    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
    setCsvData(null);
    setCsvZoomLevel(1);

    const fileType = getFileType(document);

    let actualCategoryType = categoryType;
    let actualCategoryName = categoryName;

    if (!categoryType && activeFilesData?.categories) {
      if (activeFilesData.categories.sales?.files?.some(f => f.fileName === document.fileName)) {
        actualCategoryType = 'sales';
        actualCategoryName = 'Sales';
      } else if (activeFilesData.categories.purchase?.files?.some(f => f.fileName === document.fileName)) {
        actualCategoryType = 'purchase';
        actualCategoryName = 'Purchase';
      } else if (activeFilesData.categories.bank?.files?.some(f => f.fileName === document.fileName)) {
        actualCategoryType = 'bank';
        actualCategoryName = 'Bank';
      } else if (activeFilesData.categories.other) {
        for (const cat of activeFilesData.categories.other) {
          if (cat.files?.some(f => f.fileName === document.fileName)) {
            actualCategoryType = 'other';
            actualCategoryName = cat.categoryName;
            break;
          }
        }
      }
    }

    const categoryFiles = getFilesFromCategory(document.fileName, actualCategoryType, actualCategoryName);

    const currentIndex = categoryFiles.findIndex(f =>
      f.fileName === document.fileName &&
      f.uploadedAt === document.uploadedAt
    );

    setCurrentCategoryFiles(categoryFiles);
    setCurrentFileIndex(currentIndex);
    setPreviewCategoryName(actualCategoryName || 'Documents');
    setPreviewDoc({ ...document, fileType, categoryType: actualCategoryType });
    setIsPreviewOpen(true);

    if (fileType === 'csv') {
      parseCSVAndDisplay(document.url);
    }

    await checkFileViewedStatus({
      categoryType: actualCategoryType,
      categoryName: actualCategoryName,
      fileName: document.fileName,
      url: document.url
    });

    await checkFileAuditStatus({
      categoryType: actualCategoryType,
      categoryName: actualCategoryName,
      fileName: document.fileName,
      url: document.url
    });

    setTimeout(() => {
      applyProtection();
    }, 100);
  };

  const navigateToNextFile = async () => {
    if (currentFileIndex < currentCategoryFiles.length - 1) {
      const nextFile = currentCategoryFiles[currentFileIndex + 1];
      setCurrentFileIndex(currentFileIndex + 1);
      setPreviewDoc({
        ...nextFile,
        fileType: getFileType(nextFile),
        categoryType: previewDoc?.categoryType
      });

      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setCsvData(null);
      setCsvZoomLevel(1);

      if (getFileType(nextFile) === 'csv') {
        parseCSVAndDisplay(nextFile.url);
      }

      await checkFileViewedStatus({
        categoryType: previewDoc?.categoryType,
        categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
          ? null
          : previewCategoryName,
        fileName: nextFile.fileName,
        url: nextFile.url
      });

      await checkFileAuditStatus({
        categoryType: previewDoc?.categoryType,
        categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
          ? null
          : previewCategoryName,
        fileName: nextFile.fileName,
        url: nextFile.url
      });

      setTimeout(() => {
        applyProtection();
      }, 100);
    }
  };

  const navigateToPreviousFile = async () => {
    if (currentFileIndex > 0) {
      const prevFile = currentCategoryFiles[currentFileIndex - 1];
      setCurrentFileIndex(currentFileIndex - 1);
      setPreviewDoc({
        ...prevFile,
        fileType: getFileType(prevFile),
        categoryType: previewDoc?.categoryType
      });

      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setCsvData(null);
      setCsvZoomLevel(1);

      if (getFileType(prevFile) === 'csv') {
        parseCSVAndDisplay(prevFile.url);
      }

      await checkFileViewedStatus({
        categoryType: previewDoc?.categoryType,
        categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
          ? null
          : previewCategoryName,
        fileName: prevFile.fileName,
        url: prevFile.url
      });

      await checkFileAuditStatus({
        categoryType: previewDoc?.categoryType,
        categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
          ? null
          : previewCategoryName,
        fileName: prevFile.fileName,
        url: prevFile.url
      });

      setTimeout(() => {
        applyProtection();
      }, 100);
    }
  };

  /* ================= CLOSE DOCUMENT PREVIEW ================= */
  const closeDocumentPreview = () => {
    cleanupProtection();
    setIsPreviewOpen(false);
    setPreviewDoc(null);
    setCurrentCategoryFiles([]);
    setCurrentFileIndex(0);
    setPreviewCategoryName("");
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
    setCsvData(null);
    setCsvLoading(false);
    setCsvZoomLevel(1);
  };

  const openAddNoteModal = (file, categoryType, categoryName = null) => {
    setSelectedFileForNote({
      file: {
        fileName: file.fileName,
        fileUrl: file.url
      },
      categoryType,
      categoryName,
      clientId: activeAssignment.client.clientId,
      year: activeAssignment.year,
      month: activeAssignment.month
    });
    setNewNoteText("");
    setShowAddNoteModal(true);
  };

  const closeAddNoteModal = () => {
    setShowAddNoteModal(false);
    setSelectedFileForNote(null);
    setNewNoteText("");
  };

  const handleAddNote = async () => {
    if (!selectedFileForNote || !newNoteText.trim()) return;

    try {
      setAddingNote(true);

      const noteData = {
        clientId: selectedFileForNote.clientId,
        year: selectedFileForNote.year,
        month: selectedFileForNote.month,
        categoryType: selectedFileForNote.categoryType,
        fileName: selectedFileForNote.file.fileName,
        fileUrl: selectedFileForNote.file.fileUrl,
        note: newNoteText.trim()
      };

      if (selectedFileForNote.categoryType === 'other') {
        noteData.categoryName = selectedFileForNote.categoryName;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/add-file-note`,
        noteData,
        { withCredentials: true }
      );

      await loadAssignmentFiles(
        selectedFileForNote.clientId,
        selectedFileForNote.year,
        selectedFileForNote.month
      );

      closeAddNoteModal();
    } catch (error) {
      console.error("Error adding note:", error);
      alert(`Failed to add note: ${error.response?.data?.message || error.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  /* ================= EXPAND/COLLAPSE FUNCTIONS ================= */
  const toggleCategoryNotes = (categoryKey) => {
    setExpandedCategoryNotes(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const toggleMonthGroup = (monthKey) => {
    setExpandedMonthGroups(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  /* ================= HELPERS ================= */
  const getAssignmentsForClient = (clientId) => {
    return assignments
      .filter((a) => a.client.clientId === clientId)
      .sort((a, b) => {
        if (a.isCurrentMonth && !b.isCurrentMonth) return -1;
        if (!a.isCurrentMonth && b.isCurrentMonth) return 1;
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  const formatPhone = (phone) => {
    if (!phone) return "Not provided";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getUniqueYears = () => {
    const years = [...new Set(assignments.map(item => item.year))];
    return years.sort((a, b) => b - a);
  };

  const toggleAccountingDone = async () => {
    if (!activeAssignment) return;

    try {
      setUpdatingAccounting(true);
      const newStatus = !activeAssignment.accountingDone;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/employee/toggle-accounting-done`,
        {
          clientId: activeAssignment.client.clientId,
          year: activeAssignment.year,
          month: activeAssignment.month,
          task: activeAssignment.task || 'Bookkeeping',
          accountingDone: newStatus
        },
        { withCredentials: true }
      );

      setActiveAssignment(prev => ({
        ...prev,
        accountingDone: newStatus,
        accountingDoneAt: new Date(),
        accountingDoneBy: "current-user"
      }));

      setAssignments(prev => prev.map(item =>
        item.client.clientId === activeAssignment.client.clientId &&
          item.year === activeAssignment.year &&
          item.month === activeAssignment.month &&
          item.task === activeAssignment.task
          ? {
            ...item,
            accountingDone: newStatus,
            accountingDoneAt: new Date(),
            accountingDoneBy: "current-user"
          }
          : item
      ));

      const updatedGrouped = { ...groupedAssignments };
      if (updatedGrouped[activeAssignment.client.clientId] &&
        updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`]) {

        const monthAssignments = updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`];
        const assignmentIndex = monthAssignments.findIndex(a => a.task === activeAssignment.task);

        if (assignmentIndex !== -1) {
          updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`][assignmentIndex].accountingDone = newStatus;
          updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`][assignmentIndex].accountingDoneAt = new Date();
          setGroupedAssignments(updatedGrouped);
        }
      }

    } catch (error) {
      console.error("Error toggling accounting status:", error);
    } finally {
      setUpdatingAccounting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  /* ================= HANDLE CLIENT SELECTION ================= */
  const handleClientSelect = (client) => {
    setActiveClient(client);
    setActiveAssignment(null);
    setActiveMonthYear(null);

    const clientGrouped = groupedAssignments[client.clientId] || {};
    const firstMonthYear = Object.keys(clientGrouped)[0];

    if (firstMonthYear) {
      setActiveMonthYear(firstMonthYear);
      const monthAssignments = clientGrouped[firstMonthYear];
      if (monthAssignments && monthAssignments.length > 0) {
        setActiveAssignment(monthAssignments[0]);
      }
    }
  };

  const toggleMonthExpand = (monthKey, e) => {
    e.stopPropagation();
    e.preventDefault();

    setExpandedMonthGroups(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const handleMonthYearSelect = (monthKey) => {
    setActiveMonthYear(monthKey);

    if (!expandedMonthGroups[monthKey]) {
      setExpandedMonthGroups(prev => ({
        ...prev,
        [monthKey]: true
      }));
    }

    const [year, month] = monthKey.split('-').map(Number);

    if (groupedAssignments[activeClient.clientId] &&
      groupedAssignments[activeClient.clientId][monthKey]) {

      const monthAssignments = groupedAssignments[activeClient.clientId][monthKey];

      if (monthAssignments.length === 1) {
        setActiveAssignment(monthAssignments[0]);
      } else if (monthAssignments.length > 0 && !activeAssignment) {
        setActiveAssignment(monthAssignments[0]);
      }
    }
  };

  const handleTaskSelect = (assignment, e) => {
    if (e) e.stopPropagation();
    setActiveAssignment(assignment);
  };

  /* ================= RENDER TASK BADGE ================= */
  const renderTaskBadge = (task) => {
    const taskClass = task.toLowerCase().replace(/\s+/g, '-');

    return (
      <span className={`task-badge task-${taskClass}`}>
        {task}
      </span>
    );
  };

  /* ================= RENDER CATEGORY NOTES ================= */
  const renderCategoryNotes = (category, categoryKey) => {
    if (!category || !category.categoryNotes || category.categoryNotes.length === 0) {
      return null;
    }

    const isExpanded = expandedCategoryNotes[categoryKey];
    const notesToShow = isExpanded ? category.categoryNotes : category.categoryNotes.slice(0, 3);

    return (
      <div className="category-notes-section">
        <div className="category-notes-header">
          <FiUserCheck size={16} />
          <span className="notes-title">Category Notes</span>
          <span className="notes-count-badge">{category.categoryNotes.length}</span>
        </div>
        <div className="category-notes-list">
          {notesToShow.map((note, index) => (
            <div key={index} className="category-note-item">
              <div className="category-note-text">
                <FiEdit size={12} />
                <span>{note.note}</span>
              </div>
              <div className="category-note-meta">
                <span className="category-note-date">
                  {formatDate(note.addedAt)}
                </span>
              </div>
            </div>
          ))}
          {category.categoryNotes.length > 3 && (
            <div
              className="more-category-notes"
              onClick={() => toggleCategoryNotes(categoryKey)}
            >
              {isExpanded ? (
                <>
                  <FiChevronUp size={12} />
                  Show less
                </>
              ) : (
                <>
                  <FiChevronDown size={12} />
                  +{category.categoryNotes.length - 3} more notes
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ================= RENDER ALL NOTES MODAL (NEW) ================= */
  const renderAllNotesModal = () => {
    if (!showAllNotesModal) return null;

    return (
      <div className="modal-overlay" onClick={closeAllNotesModal}>
        <div className="modal all-notes-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              <FiMessageSquare size={24} /> All Notes
            </h3>
            <button className="close-modal" onClick={closeAllNotesModal}>
              <FiX size={24} />
            </button>
          </div>
          <div className="modal-body">
            <div className="all-notes-header">
              <h4>{allNotesData.fileName}</h4>
              <p className="category-breadcrumb">{allNotesData.categoryName}</p>
            </div>
            <div className="all-notes-list">
              {allNotesData.notes.map((note, index) => (
                <div key={index} className="all-note-item">
                  <div className="note-text">{note.note}</div>
                  <div className="note-meta">
                    <span className="note-by">
                      {note.employeeName || note.addedBy || "Unknown"}
                    </span>
                    <span className="note-date">
                      {formatDate(note.addedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="primary-btn" onClick={closeAllNotesModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ================= RENDER FILES ================= */
  const renderFilesSection = (title, files, category, categoryName = null) => {
    const categoryKey = `${title}-${categoryName || 'main'}`;
    const categoryNotes = category?.categoryNotes || [];

    if ((!files || files.length === 0) && categoryNotes.length === 0) {
      return (
        <div className="category-section empty">
          <div className="category-header">
            <h4>{title}</h4>
            {category?.isLocked && (
              <span className="locked-badge">
                <FiLock size={12} /> Locked
              </span>
            )}
          </div>
          <div className="empty-files">
            <FiFileText size={32} />
            <p>No files uploaded</p>
            <span className="pending-badge">Pending</span>
          </div>
        </div>
      );
    }

    return (
      <div className="category-section">
        <div className="category-header">
          <div className="header-left">
            <h4>{title}</h4>
            <span className="file-count-badge">{files?.length || 0} file{(files?.length || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="header-right">
            {category?.isLocked && (
              <span className="locked-badge">
                <FiLock size={12} /> Locked
              </span>
            )}
          </div>
        </div>

        {renderCategoryNotes(category, categoryKey)}

        {files && files.length > 0 ? (
          <div className="files-list">
            {files.map((file, index) => {
              const isViewed = getFileViewedStatus({
                categoryType: categoryName ? 'other' : title.toLowerCase().split(' ')[0],
                categoryName: categoryName || null,
                fileName: file.fileName,
                url: file.url
              });

              const isAudited = getFileAuditStatus({
                categoryType: categoryName ? 'other' : title.toLowerCase().split(' ')[0],
                categoryName: categoryName || null,
                fileName: file.fileName,
                url: file.url
              });

              return (
                <div key={index} className="file-card">
                  <div className="file-icon">
                    <FiFileText size={24} />
                  </div>
                  <div className="file-info">
                    <h5>{file.fileName}</h5>
                    <div className="file-meta">
                      <span className="meta-item">
                        <FiClock size={12} />
                        {formatDate(file.uploadedAt)}
                      </span>
                      <span className="meta-item">
                        {formatFileSize(file.fileSize)}
                      </span>
                      {isViewed && (
                        <span className="meta-item viewed-badge">
                          <FiCheckSquare size={12} />
                          Viewed
                        </span>
                      )}
                      {isAudited && (
                        <span className="meta-item audited-badge">
                          <FiCheckCircle size={12} />
                          Audited
                        </span>
                      )}
                    </div>

                    {file.notes && file.notes.length > 0 && (
                      <div className="file-notes">
                        <div className="notes-label">
                          <FiMessageSquare size={12} /> Employee Notes ({file.notes.length}):
                        </div>
                        <div className="notes-list">
                          {file.notes.slice(0, 2).map((note, noteIndex) => (
                            <div key={noteIndex} className="note-item">
                              <div className="note-text">{note.note}</div>
                              <div className="note-meta">
                                <span className="note-by">
                                  {note.employeeName || note.addedBy || "Unknown"}
                                </span>
                                <span className="note-date">
                                  {formatDate(note.addedAt)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {file.notes.length > 2 && (
                            <div
                              className="more-notes"
                              onClick={() => openAllNotesModal(file.notes, file.fileName, title)}
                            >
                              +{file.notes.length - 2} more employee notes
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="file-actions">
                    <button
                      className="action-btn view"
                      onClick={() => {
                        let catType;
                        let displayCategoryName;

                        if (categoryName) {
                          catType = 'other';
                          displayCategoryName = categoryName;
                        } else {
                          catType = title.toLowerCase().split(' ')[0];
                          if (title === 'Sales Documents (Income)') displayCategoryName = 'Sales';
                          else if (title === 'Purchase Documents (Expenses)') displayCategoryName = 'Purchase';
                          else if (title === 'Bank Documents') displayCategoryName = 'Bank';
                          else displayCategoryName = title;
                        }

                        openDocumentPreview(file, catType, displayCategoryName);
                      }}
                      title="Preview Document"
                    >
                      <FiEye size={16} />
                    </button>

                    <div className="add-note-wrapper">
                      <button
                        className="action-btn add-note"
                        onClick={() => {
                          let catType;
                          if (categoryName) {
                            catType = 'other';
                          } else {
                            catType = title.toLowerCase().split(' ')[0];
                          }
                          openAddNoteModal(file, catType, categoryName);
                        }}
                        title="Add Employee Note"
                      >
                        <FiPlus size={16} />
                      </button>

                      {file.notes && file.notes.length > 0 && (
                        <span className="notes-count-badge">
                          {file.notes.length}
                        </span>
                      )}
                    </div>

                    <button
                      className={`action-btn check-btn ${isViewed ? 'checked' : ''}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        const newStatus = await toggleFileViewed({
                          categoryType: categoryName ? 'other' : title.toLowerCase().split(' ')[0],
                          categoryName: categoryName || null,
                          fileName: file.fileName,
                          url: file.url
                        });
                      }}
                      title={isViewed ? "Mark as not viewed" : "Mark as viewed"}
                      disabled={checkingViewed}
                    >
                      {isViewed ? (
                        <FiCheckSquare size={16} />
                      ) : (
                        <FiSquare size={16} />
                      )}
                    </button>

                    <button
                      className={`action-btn audit-btn ${isAudited ? 'audited' : ''}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        const newStatus = await toggleFileAudit({
                          categoryType: categoryName ? 'other' : title.toLowerCase().split(' ')[0],
                          categoryName: categoryName || null,
                          fileName: file.fileName,
                          url: file.url
                        });
                      }}
                      title={isAudited ? "Mark as not audited" : "Mark as audited"}
                      disabled={checkingAudit}
                    >
                      <img
                        src={audit}
                        alt="Audit"
                        className={`audit-icon ${isAudited ? 'audited-active' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : categoryNotes.length > 0 ? (
          <div className="empty-files">
            <FiFileText size={32} />
            <p>No files uploaded</p>
            <span className="pending-badge">Pending</span>
          </div>
        ) : null}
      </div>
    );
  };

  /* ================= RENDER DOCUMENTS MODAL ================= */
  const renderDocumentsModal = () => {
    if (!showDocumentModal || !activeAssignment || !activeFilesData) return null;

    return (
      <div className="modal-overlay">
        <div className="modal documents-modal">
          <div className="modal-header">
            <div className="modal-header-left">
              <h3>
                <FiFileText size={24} /> Documents - {getMonthName(activeAssignment.month)} {activeAssignment.year}
              </h3>
              <div className="modal-header-stats">
                <span className="stat-item">
                  <FiFile size={16} /> Total Files: {activeFilesData.totalFiles || 0}
                </span>
                <span className="stat-item">
                  <FiMessageSquare size={16} /> Category Notes: {activeFilesData.totalCategoryNotes || 0}
                </span>
                <span className="stat-item">
                  <FiMessageSquare size={16} /> File Notes: {activeFilesData.totalFileNotes || 0}
                </span>
              </div>
            </div>
            <button
              className="close-modal"
              onClick={() => setShowDocumentModal(false)}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="documents-container">
              {renderFilesSection(
                "Sales Documents (Income)" ,
                activeFilesData.categories?.sales?.files,
                activeFilesData.categories?.sales,
                null
              )}

              {renderFilesSection(
                "Purchase Documents (Expenses)",
                activeFilesData.categories?.purchase?.files,
                activeFilesData.categories?.purchase,
                null
              )}

              {renderFilesSection(
                "Bank Documents",
                activeFilesData.categories?.bank?.files,
                activeFilesData.categories?.bank,
                null
              )}

              {activeFilesData.categories?.other && activeFilesData.categories.other.length > 0 && (
                <div className="other-categories">
                  <h4>Other Documents</h4>
                  {activeFilesData.categories.other.map((otherCat, index) => (
                    <div key={index} className="other-category">
                      {renderFilesSection(
                        otherCat.categoryName,
                        otherCat.files,
                        otherCat,
                        otherCat.categoryName
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(!activeFilesData.categories ||
                (!activeFilesData.categories.sales?.files?.length &&
                  !activeFilesData.categories.purchase?.files?.length &&
                  !activeFilesData.categories.bank?.files?.length &&
                  !activeFilesData.categories.other?.length)) && (
                  <div className="empty-documents">
                    <FiFileText size={64} />
                    <h4>No Documents Available</h4>
                    <p>No documents have been uploaded for this period.</p>
                  </div>
                )}
            </div>

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={() => setShowDocumentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================= RENDER ADD NOTE MODAL ================= */
  const renderAddNoteModal = () => {
    if (!showAddNoteModal || !selectedFileForNote) return null;

    return (
      <div className="modal-overlay">
        <div className="modal add-note-modal">
          <div className="modal-header">
            <h3>
              <FiMessageSquare size={24} /> Add Employee Note
            </h3>
            <button
              className="close-modal"
              onClick={closeAddNoteModal}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="file-info-note">
              <div className="file-icon">
                <FiFileText size={32} />
              </div>
              <div className="file-info-content">
                <h4>{selectedFileForNote.file.fileName}</h4>
                <p className="file-path">
                  {selectedFileForNote.categoryType === 'other'
                    ? `${selectedFileForNote.categoryName} / ${getMonthName(selectedFileForNote.month)} ${selectedFileForNote.year}`
                    : `${selectedFileForNote.categoryType} / ${getMonthName(selectedFileForNote.month)} ${selectedFileForNote.year}`
                  }
                </p>
              </div>
            </div>

            <div className="note-input-section">
              <label htmlFor="noteText">Your Note:</label>
              <textarea
                id="noteText"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type your note here..."
                rows={6}
                disabled={addingNote}
              />
              <div className="note-help">
                <FiInfo size={14} />
                Note will be visible to the client and other employees
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={closeAddNoteModal}
                disabled={addingNote}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleAddNote}
                disabled={!newNoteText.trim() || addingNote}
              >
                {addingNote ? (
                  <>
                    <span className="spinner"></span> Adding...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} /> Add Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================= RENDER DOCUMENT PREVIEW WITH CSV SUPPORT ================= */
  const renderDocumentPreview = () => {
    if (!previewDoc || !isPreviewOpen) return null;

    const fileType = previewDoc.fileType || getFileType(previewDoc);
    const totalFilesInCategory = currentCategoryFiles.length;
    const isFirstFile = currentFileIndex === 0;
    const isLastFile = currentFileIndex === totalFilesInCategory - 1;

    const isFileViewed = getFileViewedStatus({
      categoryType: previewDoc.categoryType,
      categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
        ? null
        : previewCategoryName,
      fileName: previewDoc.fileName,
      url: previewDoc.url
    });

    const isFileAudited = getFileAuditStatus({
      categoryType: previewDoc.categoryType,
      categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
        ? null
        : previewCategoryName,
      fileName: previewDoc.fileName,
      url: previewDoc.url
    });

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
            <div className="preview-header-left">
              <h3 className="preview-title">
                <span className="file-icon">
                  {fileType === 'pdf' && <FiFileText size={18} />}
                  {fileType === 'image' && <FiImage size={18} />}
                  {fileType === 'excel' && <FiGrid size={18} />}
                  {fileType === 'csv' && <FiGrid size={18} />}
                  {fileType === 'other' && <FiFile size={18} />}
                </span>

                <div className="category-file-name">
                  <span className="category-label">{previewCategoryName}</span>
                  <FiChevronRight size={12} className="separator-icon" />
                  <span className="file-name-text">{previewDoc.fileName}</span>
                </div>

                <span className="file-type-badge">
                  {fileType.toUpperCase()}
                </span>
              </h3>

              {totalFilesInCategory > 1 && (
                <div className="file-counter">
                  {currentFileIndex + 1} of {totalFilesInCategory}
                </div>
              )}
            </div>

            <div className="preview-header-right">
              <button
                className={`checkmark-btn ${isFileViewed ? 'checked' : ''}`}
                onClick={async () => {
                  const newStatus = await toggleFileViewed({
                    categoryType: previewDoc.categoryType,
                    categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
                      ? null
                      : previewCategoryName,
                    fileName: previewDoc.fileName,
                    url: previewDoc.url
                  });
                }}
                title={isFileViewed ? "Mark as not viewed" : "Mark as viewed"}
                disabled={checkingViewed}
              >
                {isFileViewed ? (
                  <FiCheckSquare size={24} />
                ) : (
                  <FiSquare size={24} />
                )}
                <span className="checkmark-text">
                  {isFileViewed ? "Viewed" : "Mark as Viewed"}
                </span>
              </button>

              <button
                className={`audit-preview-btn ${isFileAudited ? 'audited' : ''}`}
                onClick={async () => {
                  const newStatus = await toggleFileAudit({
                    categoryType: previewDoc.categoryType,
                    categoryName: previewCategoryName === 'Sales' || previewCategoryName === 'Purchase' || previewCategoryName === 'Bank'
                      ? null
                      : previewCategoryName,
                    fileName: previewDoc.fileName,
                    url: previewDoc.url
                  });
                }}
                title={isFileAudited ? "Mark as not audited" : "Mark as audited"}
                disabled={checkingAudit}
              >
                <img
                  src={audit}
                  alt="Audit"
                  className={`audit-icon-preview ${isFileAudited ? 'audited-active' : ''}`}
                />
                <span className="audit-text">
                  {isFileAudited ? "Audited" : "Mark as Audited"}
                </span>
              </button>

              <button
                className="close-preview-btn"
                onClick={closeDocumentPreview}
                title="Close Preview"
              >
                <FiX size={20} />
              </button>
            </div>
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
                <FiZoomIn size={14} /> Use zoom controls or Mouse Wheel to zoom
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
                  style={{
                    display: 'block',
                    border: 'none'
                  }}
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
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
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
                >
                  <div
                    className="image-transform-wrapper"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                      cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default'),
                    }}
                  >
                    <img
                      src={previewDoc.url}
                      alt={previewDoc.fileName}
                      draggable={false}
                      onContextMenu={(e) => { e.preventDefault(); return false; }}
                      onDragStart={(e) => e.preventDefault()}
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
                      style={{
                        border: 'none',
                        display: 'block'
                      }}
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
                    Using Microsoft Office Online Viewer. File cannot be downloaded from this view.
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
                  <p><strong>File Size:</strong> {formatFileSize(previewDoc.fileSize)}</p>
                  <p><strong>Category:</strong> {previewCategoryName}</p>
                  <p><strong>Security:</strong> File download is disabled</p>
                </div>
              </div>
            )}
          </div>

          <div className="preview-modal-footer">
            <div className="file-info-simple">
              <span className="file-size">
                <FiFile size={14} /> Size: {formatFileSize(previewDoc.fileSize)}
              </span>
              <span className="upload-date">
                <FiClock size={14} /> Uploaded: {previewDoc.uploadedAt ?
                  formatDate(previewDoc.uploadedAt) :
                  'N/A'}
              </span>
              <span className="file-type-indicator">
                Type: {fileType.toUpperCase()}
              </span>
              {totalFilesInCategory > 1 && (
                <span className="category-files-count">
                  {totalFilesInCategory} files in {previewCategoryName}
                </span>
              )}
            </div>

            {totalFilesInCategory > 1 && (
              <div className="file-navigation-bottom">
                <button
                  className="nav-btn prev-btn"
                  onClick={navigateToPreviousFile}
                  disabled={isFirstFile}
                  title="Previous File"
                >
                  <FiArrowLeft size={20} />
                  <span className="nav-text">Previous</span>
                </button>

                <div className="file-position">
                  {currentFileIndex + 1} / {totalFilesInCategory}
                </div>

                <button
                  className="nav-btn next-btn"
                  onClick={navigateToNextFile}
                  disabled={isLastFile}
                  title="Next File"
                >
                  <span className="nav-text">Next</span>
                  <FiArrowRight size={20} />
                </button>
              </div>
            )}

            <button
              className="btn-close-preview"
              onClick={closeDocumentPreview}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ================= RENDER TASK SELECTION DROPDOWN ================= */
  const renderTaskSelection = () => {
    if (!activeClient || !activeMonthYear) return null;

    const monthAssignments = groupedAssignments[activeClient.clientId]?.[activeMonthYear] || [];

    if (monthAssignments.length <= 1) return null;

    return (
      <div className="task-selection-dropdown">
        <div className="dropdown-label">
          <FiList size={16} />
          <span>Select Task:</span>
        </div>
        <div className="task-options">
          {monthAssignments.map((assignment, index) => (
            <button
              key={`${assignment.task}-${index}`}
              className={`task-option ${activeAssignment?.task === assignment.task ? 'active' : ''}`}
              onClick={() => handleTaskSelect(assignment)}
            >
              {renderTaskBadge(assignment.task)}
              <span className={`status-indicator ${assignment.accountingDone ? 'done' : 'pending'}`}>
                {assignment.accountingDone ? (
                  <FiCheckCircle size={14} />
                ) : (
                  <FiAlertCircle size={14} />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ================= MAIN RENDER ================= */
  return (
    <EmployeeLayout>
      <div className="employee-assigned-clients">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <h2>
                <FiBriefcase /> My Assigned Clients
              </h2>
              <p className="subtitle">
                View your assigned clients and manage accounting status per task
              </p>
            </div>
            <div className="header-right">
              <button
                className="refresh-btn"
                onClick={loadAssignedClients}
                disabled={refreshing}
              >
                <FiRefreshCw className={refreshing ? "spinning" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-info">
                <span className="stat-number">{clientList.length}</span>
                <span className="stat-label">Total Clients</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiCalendar />
              </div>
              <div className="stat-info">
                <span className="stat-number">{assignments.length}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiCheckCircle />
              </div>
              <div className="stat-info">
                <span className="stat-number">
                  {assignments.filter(a => a.accountingDone).length}
                </span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Years</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>

            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm("");
                setYearFilter("");
                setMonthFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your assigned clients...</p>
          </div>
        ) : (
          <div className="main-content">
            {/* Client List Section */}
            <div className="clients-section">
              <div className="section-header">
                <h3>
                  <FiUsers /> Client List
                </h3>
                <span className="count-badge">{filteredClients.length}</span>
              </div>

              {filteredClients.length === 0 ? (
                <div className="empty-state">
                  <FiBriefcase />
                  <h4>No Clients Found</h4>
                  <p>No clients match your search or filter criteria.</p>
                </div>
              ) : (
                <div className="clients-list">
                  {filteredClients.map((client) => {
                    return (
                      <div
                        key={client.clientId}
                        className={`client-card ${activeClient?.clientId === client.clientId ? 'active' : ''}`}
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="client-avatar">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="client-info">
                          <h4>{client.name}</h4>
                          <div className="client-meta">
                            <span className="assignments-count">
                              <FiCalendar />
                              {client.assignmentCount} task{client.assignmentCount !== 1 ? 's' : ''}
                            </span>
                            <span className="client-plan-badge">
                              <FiBriefcase />
                              {client.currentPlan || client.planSelected || client.nextMonthPlan || 'No Plan'}
                            </span>
                          </div>
                        </div>
                        {activeClient?.clientId === client.clientId && (
                          <FiChevronRight className="active-indicator" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assignments History - Grouped by Month-Year */}
            <div className="assignments-section">
              {activeClient ? (
                <>
                  <div className="section-header">
                    <div>
                      <h3>
                        <FiCalendar /> Assignments for {activeClient.name}
                      </h3>
                      <p className="section-subtitle">
                        All assignments grouped by month
                      </p>
                    </div>
                  </div>

                  <div className="assignments-grid">
                    {Object.keys(groupedAssignments[activeClient.clientId] || {}).map((monthKey) => {
                      const [year, month] = monthKey.split('-').map(Number);
                      const monthAssignments = groupedAssignments[activeClient.clientId][monthKey];
                      const isActiveMonth = activeMonthYear === monthKey;
                      const isExpanded = expandedMonthGroups[monthKey] || isActiveMonth;
                      const completedTasks = monthAssignments.filter(a => a.accountingDone).length;
                      const totalTasks = monthAssignments.length;

                      return (
                        <div
                          key={monthKey}
                          className={`assignment-month-card ${isActiveMonth ? 'active-month' : ''}`}
                          onClick={() => {
                            setActiveMonthYear(monthKey);

                            const newExpandedState = {};
                            newExpandedState[monthKey] = !isExpanded;
                            setExpandedMonthGroups(newExpandedState);

                            if (monthAssignments.length > 0) {
                              setActiveAssignment(monthAssignments[0]);
                            }
                          }}
                        >
                          <div className="month-header">
                            <div className="month-info">
                              <h4>{getMonthName(month)} {year}</h4>
                              <div className="month-stats">
                                <span className="tasks-count">
                                  {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                                </span>
                                {completedTasks > 0 && (
                                  <span className="completed-count">
                                    {completedTasks} completed
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="month-actions">
                              <button
                                className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  setActiveMonthYear(monthKey);

                                  const newExpandedState = {};
                                  newExpandedState[monthKey] = !isExpanded;
                                  setExpandedMonthGroups(newExpandedState);

                                  if (monthAssignments.length > 0) {
                                    const currentAssignmentKey = activeAssignment ?
                                      `${activeAssignment.client.clientId}-${activeAssignment.year}-${activeAssignment.month}-${activeAssignment.task}` : '';

                                    const firstAssignmentKey = `${monthAssignments[0].client.clientId}-${monthAssignments[0].year}-${monthAssignments[0].month}-${monthAssignments[0].task}`;

                                    if (currentAssignmentKey !== firstAssignmentKey) {
                                      setActiveAssignment(monthAssignments[0]);
                                    }
                                  }
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title={isExpanded ? "Collapse tasks" : "Expand tasks"}
                              >
                                <FiChevronDown size={18} />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="month-tasks-list">
                              {monthAssignments.map((assignment, index) => {
                                const assignmentKey = `${assignment.client.clientId}-${assignment.year}-${assignment.month}-${assignment.task}`;
                                const isActiveTask = activeAssignment?.task === assignment.task &&
                                  activeAssignment?.year === assignment.year &&
                                  activeAssignment?.month === assignment.month;

                                return (
                                  <div
                                    key={assignmentKey}
                                    className={`task-item ${isActiveTask ? 'selected-task' : ''}`}
                                    onClick={(e) => handleTaskSelect(assignment, e)}
                                  >
                                    <div className="task-info">
                                      <div className="task-badge-wrapper">
                                        <span className="task-badge">
                                          {assignment.task}
                                        </span>
                                      </div>
                                      <span className="task-status">
                                        {assignment.accountingDone ? (
                                          <span className="status-done" title="Done">
                                            <FiCheckCircle size={14} />
                                          </span>
                                        ) : (
                                          <span className="status-pending" title="Pending">
                                            <FiAlertCircle size={14} />
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="task-action">
                                      {isActiveTask && (
                                        <FiChevronRight size={16} />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <FiInfo />
                  <h4>Select a Client</h4>
                  <p>Choose a client from the list to view assignments</p>
                </div>
              )}
            </div>

            {/* Assignment Details */}
            <div className="details-section">
              {activeAssignment ? (
                <>
                  <div className="section-header">
                    <div>
                      <h3>
                        <FiBriefcase /> Assignment Details
                      </h3>
                      <p className="section-subtitle">
                        {getMonthName(activeAssignment.month)} {activeAssignment.year} • {activeAssignment.task}
                      </p>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="view-docs-btn"
                        onClick={() => setShowDocumentModal(true)}
                        disabled={!activeAssignment.totalFiles || activeAssignment.totalFiles === 0}
                      >
                        <FiEye />
                        {activeAssignment.totalFiles > 0
                          ? `View Documents (${activeAssignment.totalFiles})`
                          : "No Documents"}
                      </button>
                    </div>
                  </div>

                  {renderTaskSelection()}

                  <div className="details-content">
                    <div className="info-card">
                      <h4>
                        <FiUser /> Client Information
                      </h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Name:</span>
                          <span className="value">{activeAssignment.client.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Email:</span>
                          <span className="value">{activeAssignment.client.email}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Phone:</span>
                          <span className="value">{formatPhone(activeAssignment.client.phone)}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Address:</span>
                          <span className="value">{activeAssignment.client.address || "Not provided"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-card">
                      <h4>
                        <FiCalendar /> Assignment Information
                      </h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Period:</span>
                          <span className="value highlight">
                            {getMonthName(activeAssignment.month)} {activeAssignment.year}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Task:</span>
                          <div className="value">
                            {renderTaskBadge(activeAssignment.task)}
                          </div>
                        </div>
                        <div className="info-item">
                          <span className="label">Assigned On:</span>
                          <span className="value">
                            {formatDate(activeAssignment.assignedAt)}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Assigned By:</span>
                          <span className="value">{activeAssignment.adminName || "Admin"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-card">
                      <h4>
                        <FiFile /> Files Summary
                      </h4>
                      <div className="files-summary-grid">
                        <div className="summary-item">
                          <div className="summary-label">Total Files</div>
                          <div className="summary-value">{activeAssignment.totalFiles || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Sales Files</div>
                          <div className="summary-value">{activeAssignment.salesFilesCount || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Purchase Files</div>
                          <div className="summary-value">{activeAssignment.purchaseFilesCount || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Bank Files</div>
                          <div className="summary-value">{activeAssignment.bankFilesCount || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Other Categories</div>
                          <div className="summary-value">{activeAssignment.otherCategoriesCount || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="info-card accounting-action-card">
                      <div className="accounting-header">
                        <h4>
                          <FiCheckCircle /> Accounting Status
                        </h4>
                        {activeAssignment.accountingDoneAt && (
                          <div className="completion-info">
                            Updated on {formatDate(activeAssignment.accountingDoneAt)}
                          </div>
                        )}
                      </div>

                      <div className="accounting-action">
                        <div className="status-indicator">
                          <div className={`status-dot ${activeAssignment.accountingDone ? 'done' : 'pending'}`}></div>
                          <span className="status-text">
                            {activeAssignment.accountingDone ? "Accounting completed" : "Accounting pending"}
                          </span>
                        </div>

                        <button
                          className={`accounting-toggle-btn ${activeAssignment.accountingDone ? 'undo' : 'done'}`}
                          onClick={toggleAccountingDone}
                          disabled={updatingAccounting}
                          title="Toggle accounting status"
                        >
                          {updatingAccounting ? (
                            <span className="spinner"></span>
                          ) : activeAssignment.accountingDone ? (
                            <>
                              <FiX /> Mark as Pending
                            </>
                          ) : (
                            <>
                              <FiCheck /> Mark as Done
                            </>
                          )}
                        </button>
                      </div>
                      {activeAssignment.isLocked && (
                        <div className="locked-warning">
                          <FiLock /> This assignment is locked (Accounting status can still be updated)
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : activeMonthYear ? (
                <div className="empty-state">
                  <FiList />
                  <h4>Select a Task</h4>
                  <p>Choose a task from the month assignment to view details</p>
                </div>
              ) : (
                <div className="empty-state">
                  <FiAlertCircle />
                  <h4>No Assignment Selected</h4>
                  <p>Select an assignment to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        {renderDocumentsModal()}
        {renderAddNoteModal()}
        {renderDocumentPreview()}
        {renderAllNotesModal()}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeAssignedClients;