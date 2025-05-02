// app/utils/printPdfUtils.ts

// Removed printResultsSection function as we'll use CSS in the component

/**
 * Handles saving the specified element's content as a PDF using html2pdf.js.
 * @param elementId The ID of the HTML element to save.
 * @param setIsSaving A state setter function to manage loading state in the component.
 */
export const saveResultsAsPdf = async (
    elementId: string,
    setIsSaving: (isSaving: boolean) => void
): Promise<void> => {

    setIsSaving(true); // Indicate loading state
    const resultsElement = document.getElementById(elementId);

    if (!resultsElement) {
        console.error(`Could not find element with ID "${elementId}" to save as PDF.`);
        setIsSaving(false);
        return;
    }

    // Function to perform the PDF generation
    const generatePdf = (element: HTMLElement) => {
        const timestamp = new Date().toISOString().slice(0, 10); //<y_bin_46>-MM-DD
        const filename = `commuted-value-results-${timestamp}.pdf`;

        // --- Clone element ---
        const elementToConvert = element.cloneNode(true) as HTMLElement;

        // Find and hide buttons within the cloned element using inline style
        const buttons = elementToConvert.querySelector('.print-hide-button');
        if (buttons instanceof HTMLElement) { // Check if it's an HTMLElement
             buttons.style.display = 'none';
             buttons.style.visibility = 'hidden';
        }
        // --- End button hiding ---

        // --- Minimal Style Injection (Optional - primarily for background) ---
        // Rely mostly on html2pdf capturing existing styles.
        // Only add essential overrides if needed, like background color.
        const styleOverrides = `
          <style>
            /* Ensure white background for PDF generation if needed */
            #${elementId} { background-color: white !important; }
            #${elementId} > div { background-color: white !important; }
             /* Ensure text colors are suitable for PDF (e.g., not white on white) */
            #${elementId}, #${elementId} * { color: #333 !important; } /* Example base text color */
            #${elementId} .text-muted-foreground { color: #6b7280 !important; }
            #${elementId} .text-primary { color: #1f2937 !important; }
          </style>
        `;
        elementToConvert.insertAdjacentHTML('afterbegin', styleOverrides);
        // --- End Style Injection ---


        const pdfOptions = {
            margin: 0.75, // Margin in inches
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2, // Increase scale for better resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff', // Explicitly set background
                // Avoid removing container, it might be needed for layout capture
                // removeContainer: false
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Use html2pdf library (assuming it's loaded)
        window.html2pdf().set(pdfOptions).from(elementToConvert).save()
            .then(() => {
                console.log("PDF Saved successfully");
            })
            .catch((err: any) => {
                console.error("Error generating PDF:", err);
                if (err.message && (err.message.includes('unsupported color function') || err.message.includes('oklab'))) {
                    alert("Failed to generate PDF due to unsupported styles. Please try printing instead.");
                } else {
                    alert("An error occurred while generating the PDF.");
                }
            })
            .finally(() => {
                 setIsSaving(false); // Reset loading state regardless of success/failure
            });
    };

    // Dynamically load html2pdf library if not already available
    if (typeof window.html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        script.async = true;
        script.onload = () => generatePdf(resultsElement); // Call generation after script loads
        script.onerror = () => {
            console.error("Failed to load html2pdf.js library.");
            alert("Failed to load PDF generation library. Please check your internet connection or try again later.");
            setIsSaving(false);
        }
        document.body.appendChild(script);
    } else {
        generatePdf(resultsElement); // Library already loaded
    }
};

// Extend the Window interface to declare the html2pdf property
declare global {
    interface Window {
        html2pdf: any; // Use 'any' or find/create a more specific type definition
    }
}
