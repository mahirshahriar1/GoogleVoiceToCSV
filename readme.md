# Google Voice Call Log Exporter 📞➡️📊

**Live Tool:** Check About


Converts exported Google Voice call log `.html` files (e.g., from Google Takeout) into a single CSV file.

## Key Features

*   Parses multiple HTML files from a selected folder.
*   Extracts Phone Number, Direction, Duration, Labels, Message text.
*   Provides Timestamps in **UTC** and **Pacific Time** (as Date & Time columns).
*   **Client-Side Processing:** Runs 100% in your browser. Your files are **not** uploaded.
*   Outputs a downloadable `exported_calls.csv`.

## How to Use

1.  Go to the **Live Tool** link above.
2.  Click **"Select Folder"** and choose the folder containing your `.html` call logs.
3.  Click **"Process Files"**.
4.  Click **"Download CSV"** when complete.

## Requirements & Limitations

*   **Input:** Expects `.html` files with filenames like:
    `"<Phone Number> - <Direction> - <YYYY-MM-DDTHH_MM_SSZ>.html"`
*   **Format Changes:** If Google changes its export format, this tool may break.
*   **Browser:** Requires a modern browser supporting folder selection (`webkitdirectory`).

## Output CSV Columns

*   Phone Number
*   Direction
*   Timestamp (UTC)
*   Date (Pacific)
*   Time (Pacific)
*   Duration
*   Message

## Contributing

Found issues? Open an issue on this GitHub repository.

## License

MIT License 