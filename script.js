document.addEventListener('DOMContentLoaded', () => {
    const folderInput = document.getElementById('folderInput');
    const fileInfo = document.getElementById('fileInfo');
    const processButton = document.getElementById('processButton');
    const status = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const processingArea = document.getElementById('processing-area');

    let htmlFiles = [];

    folderInput.addEventListener('change', (event) => {
        const files = event.target.files;
        htmlFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.html'));

        if (htmlFiles.length > 0) {
            fileInfo.textContent = `${htmlFiles.length} HTML file(s) selected.`;
            processButton.disabled = false;
            processingArea.style.display = 'block';
            status.textContent = 'Ready to process.';
            downloadLink.style.display = 'none';
            downloadLink.href = '#';
        } else {
            fileInfo.textContent = 'No HTML files found in the selected folder.';
            processButton.disabled = true;
            processingArea.style.display = 'none';
        }
    });

    processButton.addEventListener('click', async () => {
        if (htmlFiles.length === 0) {
            status.textContent = 'No files selected.';
            return;
        }

        processButton.disabled = true;
        status.textContent = 'Processing... (this may take a moment for many files)';
        downloadLink.style.display = 'none';

        const csvData = [];
        // *** CHANGE: Replaced 'Timestamp (Pacific)' with 'Date (Pacific)' and 'Time (Pacific)' ***
        const header = [
            'Phone Number', 'Direction', 'Timestamp (UTC)', 'Date (Pacific)', 'Time (Pacific)',
            'Duration', 'Message'
        ];
        csvData.push(header);

        const parser = new DOMParser();

        for (const file of htmlFiles) {
            try {
                const fileContent = await readFileAsText(file);
                const doc = parser.parseFromString(fileContent, 'text/html');
                const parsedRow = parseCallHtml(file.name, doc);
                // Map using the updated header
                const rowArray = header.map(field => parsedRow[field] || '');
                csvData.push(rowArray);
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                status.textContent = `Error processing file ${file.name}. Check console for details.`;
            }
        }

        if (csvData.length > 1) {
            generateCsvDownload(csvData);
            status.textContent = `Processing complete. ${csvData.length - 1} records extracted.`;
        } else {
            status.textContent = 'No data could be extracted from the selected files.';
        }
    });

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(file, 'utf-8');
        });
    }

    function parseCallHtml(filename, doc) {
        // *** CHANGE: Replaced 'Timestamp (Pacific)' with 'Date (Pacific)' and 'Time (Pacific)' fields ***
        const fields = {
            'Phone Number': null,
            'Direction': null,
            'Timestamp (UTC)': null,
            'Date (Pacific)': null, // New field
            'Time (Pacific)': null, // New field
            'Duration': null,
            // 'Labels': null,
            // 'User Deleted': null,
            'Message': null,
        };

        // --- Filename Parsing ---
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        const parts = nameWithoutExt.split(' - ').map(p => p.trim());

        if (parts.length >= 3) {
            const timestampIndex = parts.length - 1;
            const directionIndex = parts.length - 2;
            fields['Phone Number'] = parts.slice(0, directionIndex).join(' - ');
            fields['Direction'] = parts[directionIndex];
            const tsStrRaw = parts[timestampIndex];
            const tsStr = tsStrRaw.replace('Z', '').replace('T', ' ').replace(/_/g, ':');

            try {
                const dt = new Date(tsStr + 'Z'); // Parse as UTC

                 if (!isNaN(dt)) {
                     // Set UTC Timestamp
                     fields['Timestamp (UTC)'] = dt.toISOString();

                     // *** CHANGE: Convert to Pacific Date and Time (MM/DD/YYYY, hh:mm:ss AM/PM) ***
                     try {
                         // Options for Pacific Date (MM/DD/YYYY)
                         const dateOptions = {
                             timeZone: 'America/Los_Angeles',
                             year: 'numeric',
                             month: '2-digit', // Use '2-digit' for leading zeros (04 vs 4)
                             day: '2-digit'
                         };
                         fields['Date (Pacific)'] = dt.toLocaleDateString('en-US', dateOptions); // e.g., "04/23/2025"

                         // Options for Pacific Time (hh:mm:ss AM/PM)
                         const timeOptions = {
                             timeZone: 'America/Los_Angeles',
                             hour: '2-digit',   // Use '2-digit' for leading zero on hour (08 vs 8)
                             minute: '2-digit',
                             second: '2-digit',
                             hour12: true // Use AM/PM
                         };
                         fields['Time (Pacific)'] = dt.toLocaleTimeString('en-US', timeOptions); // e.g., "08:47:50 AM"

                     } catch (tzError) {
                         console.error(`Error converting timestamp to Pacific Date/Time for ${filename}:`, tzError);
                         fields['Date (Pacific)'] = 'Error';
                         fields['Time (Pacific)'] = 'Error';
                     }

                 } else {
                     console.warn(`Could not parse timestamp: ${tsStrRaw} in file ${filename}`);
                     fields['Timestamp (UTC)'] = tsStrRaw;
                     fields['Date (Pacific)'] = 'Invalid UTC';
                     fields['Time (Pacific)'] = 'Invalid UTC';
                 }
            } catch (e) {
                 console.warn(`Error creating Date object for timestamp: ${tsStrRaw} in file ${filename}`, e);
                 fields['Timestamp (UTC)'] = tsStrRaw;
                 fields['Date (Pacific)'] = 'Error';
                 fields['Time (Pacific)'] = 'Error';
            }
        } else {
            console.warn(`Unexpected filename format: ${filename}`);
            fields['Phone Number'] = nameWithoutExt;
            // Date/Time fields remain null
        }

        // --- HTML Content Parsing (remains the same logic) ---
        // 1. Try standard table rows
        const tableRows = doc.querySelectorAll('tr');
        tableRows.forEach(tr => {
            const th = tr.querySelector('th');
            const td = tr.querySelector('td');
            if (th && td) {
                const key = th.textContent.trim();
                const value = td.textContent.trim();
                switch (key) {
                    case 'Duration': fields['Duration'] = value; break;
                    // case 'Labels': fields['Labels'] = value; break;
                    // case 'User Deleted': fields['User Deleted'] = value; break;
                }
            }
        });

        // 2. Fallback using simple class/ID selectors
        if (!fields['Duration']) {
             const durElement = doc.querySelector('.duration, #duration');
             if (durElement) fields['Duration'] = durElement.textContent.trim();
        }
        // if (!fields['Labels']) {
        //      const labelElements = doc.querySelectorAll('.label, span.label');
        //      if (labelElements.length > 0) {
        //          fields['Labels'] = Array.from(labelElements).map(el => el.textContent.trim()).join(', ');
        //      }
        // }
        // if (!fields['User Deleted']) {
        //     const udElement = doc.querySelector('.user-deleted, #user-deleted');
        //     if (udElement) fields['User Deleted'] = udElement.textContent.trim();
        // }

        // 3. Fallback by iterating through TH elements
        if (!fields['Duration']) {
            const allThElements = doc.querySelectorAll('th');
            for (const th of allThElements) {
                const key = th.textContent.trim();
                const valueTd = th.nextElementSibling;
                if (valueTd && valueTd.tagName === 'TD') {
                    const value = valueTd.textContent.trim();
                    if (!fields['Duration'] && key === 'Duration') fields['Duration'] = value;
                    // else if (!fields['Labels'] && key === 'Labels') fields['Labels'] = value;
                    // else if (!fields['User Deleted'] && key === 'User Deleted') fields['User Deleted'] = value;
                }
                if (fields['Duration'] && fields['Labels'] && fields['User Deleted']) break;
            }
        }

        // 4. Extract message text
        const qElement = doc.querySelector('div.message q');
        if (qElement) {
            fields['Message'] = qElement.textContent.trim();
        }

        return fields;
    }

    function generateCsvDownload(data) {
        // Format data array into CSV string (no changes needed here)
        const csvContent = data.map(row =>
            row.map(field => {
                const stringField = String(field === null || field === undefined ? '' : field);
                if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            }).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = 'exported_calls.csv';
        downloadLink.style.display = 'inline-block';

        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
});