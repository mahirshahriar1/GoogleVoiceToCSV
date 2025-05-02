# Google Voice Call Log Exporter 📞➡️📊

**Live Tool:** [Click Here](https://mahirshahriar1.github.io/GoogleVoiceToCSV/)  

Converts exported Google Voice call log `.html` files (e.g., from Google Takeout) into a preview table and a downloadable CSV file.

## Key Features

*   Parses multiple HTML files from a selected folder.
*   Extracts Phone Number, Direction, Duration, Labels, User Deleted status, and Message text.
*   Provides Timestamps in **UTC** and **Pacific Time** (as separate Date & Time columns).
*   **Displays parsed data in a preview table** on the page for review.
*   **Client-Side Processing:** Runs 100% in your browser. Your files are **not** uploaded.
*   Outputs a downloadable `exported_calls.csv` file containing all extracted data.

## How to Use

1.  Go to the **Live Tool** link above.
2.  Click **"Select Folder"** and choose the folder containing your `.html` call logs.
3.  Click **"Process Files"**.
4.  **Review** the extracted data in the table displayed on the page.
5.  Click **"Download CSV"** to save the results to a file.

## Requirements & Limitations

*   **Input:** Expects `.html` files with filenames like:
    `"<Phone Number> - <Direction> - <YYYY-MM-DDTHH_MM_SSZ>.html"`
    The tool also attempts to parse `Duration`, `Labels`, `User Deleted`, and `Message` from the HTML *content*.
*   **Format Changes:** If Google changes its export format (filename or HTML structure), this tool may need updates.
*   **Browser:** Requires a modern browser supporting folder selection (`webkitdirectory`) and standard DOM APIs.

## Output CSV Columns

The displayed table and the downloaded `exported_calls.csv` file contain the following columns:

1.  `Phone Number`
2.  `Direction`
3.  `Timestamp (UTC)`
4.  `Date (Pacific)`
5.  `Time (Pacific)`
6.  `Duration`
7.  `Message`

## Contributing

Found issues or have suggestions? Please open an issue on this GitHub repository.

## License

MIT License (You may want to add a `LICENSE` file to the repository if you haven't).
