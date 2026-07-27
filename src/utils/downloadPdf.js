/**
 * downloadPdf.js
 * Utility to generate a PDF from HTML and save it to the device's public Downloads folder.
 * 
 * Uses react-native-html-to-pdf to generate the PDF, then react-native-blob-util
 * to copy it to the MediaStore (Downloads) so it's visible in the user's file manager.
 * 
 * Works on all Android versions (API 21+).
 */
import { Platform, PermissionsAndroid } from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';

/**
 * Generate a PDF from HTML content and save it to the public Downloads folder.
 * 
 * @param {string} html - Full HTML content for the PDF
 * @param {string} fileName - Desired file name (without .pdf extension)
 * @returns {Promise<{ filePath: string, fileName: string }>} - Path and name of saved file
 */
export async function downloadInvoicePdf(html, fileName) {
    if (!html || html.length < 50) {
        throw new Error('Invoice HTML content is empty or invalid.');
    }

    // 1. Generate PDF in app-private directory
    const pdf = await generatePDF({
        html,
        fileName: fileName || 'Invoice',
        directory: 'Documents', // app-private directory (temp)
    });

    const sourcePath = pdf?.filePath || pdf?.uri;
    if (!sourcePath) {
        throw new Error('PDF generation failed — no file path returned.');
    }

    // 2. Copy to public Downloads folder so it's visible in file manager
    const finalFileName = `${fileName || 'Invoice'}.pdf`;
    let publicPath;

    if (Platform.OS === 'android') {
        try {
            // For Android 10+ (API 29+), use MediaStore for scoped storage
            if (Platform.Version >= 29) {
                publicPath = await copyToDownloadsMediaStore(sourcePath, finalFileName);
            } else {
                // For older Android, copy directly to Download directory
                publicPath = await copyToDownloadsLegacy(sourcePath, finalFileName);
            }
        } catch (err) {
            console.warn('[downloadPdf] Failed to copy to Downloads, using original path:', err.message);
            // Fallback: return the private path (at least the PDF was generated)
            publicPath = sourcePath;
        }
    } else {
        // iOS: the Documents directory is already accessible
        publicPath = sourcePath;
    }

    return {
        filePath: publicPath,
        fileName: finalFileName,
    };
}

/**
 * Open/Preview the downloaded PDF file using native system applications.
 * Works seamlessly on both Android and iOS.
 * 
 * @param {string} filePath - Local path or MediaStore URI of the PDF file
 */
export async function openDownloadedPdf(filePath) {
    if (!filePath) {
        throw new Error('Cannot open PDF: file path is empty.');
    }

    if (Platform.OS === 'android') {
        try {
            // actionViewIntent handles both content:// URIs and absolute paths
            const success = await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/pdf');
            if (!success) {
                throw new Error('Could not start view intent.');
            }
        } catch (err) {
            console.error('Failed to open PDF on Android:', err);
            throw new Error('No PDF reader app found. Please install a PDF viewer to open this invoice.');
        }
    } else {
        try {
            // iOS uses QuickLook preview document
            await ReactNativeBlobUtil.ios.previewDocument(filePath);
        } catch (err) {
            console.error('Failed to open PDF on iOS:', err);
            throw new Error('Failed to open PDF preview on iOS.');
        }
    }
}

/**
 * Android 10+ (API 29+): Use MediaStore via react-native-blob-util to insert into Downloads.
 */
async function copyToDownloadsMediaStore(sourcePath, fileName) {
    const { fs } = ReactNativeBlobUtil;
    
    // Read the generated PDF as base64
    const base64Data = await fs.readFile(sourcePath, 'base64');
    
    // Use MediaCollection (MediaStore) to add to Downloads
    // This makes the file visible in the system file manager and Downloads app
    const res = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        {
            name: fileName,
            parentFolder: '', // root of Downloads
            mimeType: 'application/pdf',
        },
        'Download', // MediaStore collection
        sourcePath,
    );

    // Clean up the private temp file
    try {
        await fs.unlink(sourcePath);
    } catch { /* ignore cleanup errors */ }

    return res || `Downloads/${fileName}`;
}

/**
 * Android < 10 (API < 29): Copy directly to the public Download directory.
 */
async function copyToDownloadsLegacy(sourcePath, fileName) {
    // Check and request write permission for older Android devices
    const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    if (!hasPermission) {
        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: 'Storage Permission Required',
                message: 'This app needs access to your storage to save the invoice PDF.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            }
        );
        if (status !== PermissionsAndroid.RESULTS.GRANTED) {
            throw new Error('Storage permission denied. Cannot save invoice to Downloads.');
        }
    }

    const { fs } = ReactNativeBlobUtil;
    const downloadDir = fs.dirs.DownloadDir;
    const destPath = `${downloadDir}/${fileName}`;

    // If file already exists, remove it first to avoid conflicts
    const exists = await fs.exists(destPath);
    if (exists) {
        await fs.unlink(destPath);
    }

    await fs.cp(sourcePath, destPath);

    // Register with DownloadManager to show in system notifications bar
    try {
        await ReactNativeBlobUtil.android.addCompleteDownload({
            title: fileName,
            description: 'ONEBind Invoice',
            mime: 'application/pdf',
            path: destPath,
            showNotification: true,
        });
    } catch (err) {
        console.warn('[downloadPdf] Failed to register download with DownloadManager:', err.message);
    }

    // Clean up the private temp file
    try {
        await fs.unlink(sourcePath);
    } catch { /* ignore cleanup errors */ }

    return destPath;
}

