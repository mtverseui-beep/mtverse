import { CheckCircle2, FileArchive, Gauge, Shield } from 'lucide-react'

export const PDF_STUDIO_STATIC_CONTENT = {
  'compress-pdf': {
    howItWorks: [
      { title: 'Upload one PDF', body: 'Choose or drop a PDF file.' },
      { title: 'Choose a profile', body: 'Pick Extreme, Recommended, or Less Compression.' },
      { title: 'Compress the file', body: 'The tool rebuilds the PDF and reduces internal overhead.' },
      { title: 'Download instantly', body: 'Get the smaller PDF right away.' },
    ],
    keyFeatures: [
      { title: 'Three working presets', body: 'Each mode targets a different size and quality balance.', icon: CheckCircle2 },
      { title: 'Clean layout preserved', body: 'Text and page order stay intact for normal use.', icon: Gauge },
      { title: 'Private processing', body: 'No signup and no clutter around the workflow.', icon: Shield },
      { title: 'Faster sharing', body: 'Smaller files are easier to send and upload.', icon: FileArchive },
    ],
    faq: [
      { question: 'Will compression ruin text quality or page layout?', answer: 'The compressor is tuned for normal business PDFs, so text, layout, and page order stay intact for everyday sharing and uploads.' },
      { question: 'Which preset should I use?', answer: 'Recommended works best for most reports. Extreme is better for strict upload limits, and Less Compression is safer for quality-sensitive files.' },
      { question: 'Can I compress protected PDFs?', answer: 'Some protected PDFs need to be unlocked first. If a file cannot be processed, the page shows a direct error.' },
      { question: 'Does this work on mobile?', answer: 'Yes. The layout stays compact on desktop and stacks cleanly on smaller screens.' },
    ],
    relatedSlugs: ['merge-pdf', 'pdf-to-word', 'pdf-to-jpg', 'word-to-pdf'],
  },
  'merge-pdf': {
    howItWorks: [
      { title: 'Add your PDFs', body: 'Upload at least two PDF files.' },
      { title: 'Set the order', body: 'Arrange the files exactly how you want them merged.' },
      { title: 'Choose options', body: 'Add a contents page or flatten forms if needed.' },
      { title: 'Merge and download', body: 'Get one clean PDF file instantly.' },
    ],
    keyFeatures: [
      { title: 'Reorder before merge', body: 'Move files into the final sequence before export.', icon: CheckCircle2 },
      { title: 'Contents page option', body: 'Create a simple opening page with file ranges.', icon: Gauge },
      { title: 'Cleaner form handling', body: 'Flatten interactive fields when you need a final copy.', icon: Shield },
      { title: 'Single output file', body: 'Everything is combined into one PDF download.', icon: FileArchive },
    ],
    faq: [
      { question: 'Does file order matter?', answer: 'Yes. The top-to-bottom order in the staging list becomes the final merge order.' },
      { question: 'Can I merge forms and normal PDFs together?', answer: 'Yes. If needed, turn on form flattening before you merge.' },
      { question: 'Will links still work?', answer: 'Links are preserved when the source PDFs keep them available during merge.' },
      { question: 'Can I merge on mobile?', answer: 'Yes. The layout stacks cleanly, but reordering is easier on desktop.' },
    ],
    relatedSlugs: ['compress-pdf', 'split-pdf', 'pdf-to-word', 'pdf-to-jpg'],
  },
  'split-pdf': {
    howItWorks: [
      { title: 'Upload one PDF', body: 'Choose the PDF you want to split.' },
      { title: 'Pick a split mode', body: 'Use ranges, single pages, or extract everything.' },
      { title: 'Set the pages', body: 'Enter custom ranges only when you need them.' },
      { title: 'Download the ZIP', body: 'Get all generated PDF parts in one package.' },
    ],
    keyFeatures: [
      { title: 'Three real split modes', body: 'Custom ranges, page-by-page, and extract-all each behave differently.', icon: CheckCircle2 },
      { title: 'Clear page preview', body: 'See selected pages before processing.', icon: Gauge },
      { title: 'Range-based outputs', body: 'Each custom range becomes its own PDF file.', icon: Shield },
      { title: 'One download package', body: 'All output files are delivered in one ZIP.', icon: FileArchive },
    ],
    faq: [
      { question: 'What does Custom Ranges do?', answer: 'Each entered range becomes a separate PDF file inside the ZIP.' },
      { question: 'What does Split by Pages do?', answer: 'It creates one PDF file for each selected page.' },
      { question: 'What does Extract All do?', answer: 'It exports every page as its own PDF file.' },
      { question: 'Can I split just a few pages?', answer: 'Yes. Use custom ranges or page mode and enter the pages you want.' },
    ],
    relatedSlugs: ['merge-pdf', 'compress-pdf', 'pdf-to-word', 'pdf-to-jpg'],
  },
  'pdf-to-word': {
    howItWorks: [
      { title: 'Upload your PDF', body: 'Choose one PDF file to convert.' },
      { title: 'Pick a mode', body: 'Choose layout, text-only, or editable output.' },
      { title: 'Run conversion', body: 'The tool extracts text and builds a Word-friendly file.' },
      { title: 'Download the result', body: 'Get the converted document instantly.' },
    ],
    keyFeatures: [
      { title: 'Three output modes', body: 'Each mode is tuned for a different editing workflow.', icon: CheckCircle2 },
      { title: 'Live PDF preview', body: 'See page count and document state before converting.', icon: Gauge },
      { title: 'OCR-ready workflow', body: 'OCR fallback can be requested for tougher source files.', icon: Shield },
      { title: 'Word-compatible output', body: 'The result is exported as a document you can edit or share.', icon: FileArchive },
    ],
    faq: [
      { question: 'Which mode should I use?', answer: 'Preserve Layout works best for most documents. Text Only is simpler. Edit Directly is cleaner for editing.' },
      { question: 'Will scanned PDFs always convert?', answer: 'Not always. OCR fallback can help, but some scanned files still need a dedicated OCR-first workflow.' },
      { question: 'Does this create DOCX files?', answer: 'It creates a Word-compatible document file for editing and download.' },
      { question: 'Will images from the PDF be preserved?', answer: 'This built-in converter focuses on extracted text and document readability first.' },
    ],
    relatedSlugs: ['word-to-pdf', 'pdf-ocr', 'compress-pdf', 'pdf-to-excel'],
  },
  'pdf-to-excel': {
    howItWorks: [
      { title: 'Upload one PDF', body: 'Choose a report, statement, or table-heavy PDF.' },
      { title: 'Set extraction options', body: 'Pick OCR, detection mode, and table preferences.' },
      { title: 'Review detected tables', body: 'Check the extracted rows before export.' },
      { title: 'Download Excel', body: 'Export structured sheets as an Excel workbook.' },
    ],
    keyFeatures: [
      { title: 'Table-aware extraction', body: 'Rows and columns are grouped into sheet-ready data.', icon: CheckCircle2 },
      { title: 'OCR support', body: 'Scanned PDFs can still be processed when OCR mode is on.', icon: Shield },
      { title: 'Live table preview', body: 'See sample rows before exporting the spreadsheet.', icon: Gauge },
      { title: 'Excel workbook export', body: 'Download one workbook with structured sheets.', icon: FileArchive },
    ],
    faq: [
      { question: 'Does this detect every table perfectly?', answer: 'No parser is perfect, but the tool is tuned for simple reports, invoices, and statements.' },
      { question: 'Should I enable OCR?', answer: 'Use OCR for scanned or image-based PDFs. Leave it off for selectable-text PDFs.' },
      { question: 'What format is exported?', answer: 'The output is an Excel workbook you can open in Excel, Numbers, or Sheets.' },
      { question: 'Can one PDF create multiple sheets?', answer: 'Yes. Separate detected tables are exported as separate sheets when possible.' },
    ],
    relatedSlugs: ['pdf-ocr', 'pdf-to-word', 'pdf-summarizer', 'pdf-to-jpg'],
  },
  'word-to-pdf': {
    howItWorks: [
      { title: 'Upload your Word file', body: 'Drop a DOCX file into the converter.' },
      { title: 'Review the source', body: 'Check the source text preview before converting.' },
      { title: 'Convert to PDF', body: 'The document is rebuilt into a clean PDF file.' },
      { title: 'Download instantly', body: 'Save the converted PDF right away.' },
    ],
    keyFeatures: [
      { title: 'DOCX workflow', body: 'Built for quick Word-to-PDF conversion with clean output.', icon: CheckCircle2 },
      { title: 'Source preview', body: 'Preview readable document text before export.', icon: Gauge },
      { title: 'Private processing', body: 'Files stay in-session and are not stored in a dashboard.', icon: Shield },
      { title: 'Ready-to-share PDF', body: 'Download a clean PDF file after conversion.', icon: FileArchive },
    ],
    faq: [
      { question: 'Does this support old .doc files?', answer: 'DOCX works best. Legacy .doc files may need to be resaved as DOCX first.' },
      { question: 'Will the PDF look exactly like Word?', answer: 'The built-in converter focuses on clean readable output rather than full Office rendering fidelity.' },
      { question: 'Can I preview the converted PDF?', answer: 'Yes. The result panel shows the generated PDF preview after conversion.' },
      { question: 'Does this work on mobile?', answer: 'Yes. The layout stacks cleanly and still supports upload, convert, and download.' },
    ],
    relatedSlugs: ['pdf-to-word', 'merge-pdf', 'compress-pdf', 'jpg-to-pdf'],
  },
  'jpg-to-pdf': {
    howItWorks: [
      { title: 'Add your images', body: 'Upload one or more JPG, PNG, or WebP files.' },
      { title: 'Arrange the order', body: 'Drag files into the final page sequence.' },
      { title: 'Choose page settings', body: 'Set page size, margins, and orientation.' },
      { title: 'Create the PDF', body: 'Download a single image-based PDF file.' },
    ],
    keyFeatures: [
      { title: 'Multi-image staging', body: 'Reorder pages before the final PDF is built.', icon: CheckCircle2 },
      { title: 'Layout controls', body: 'Choose page size, margins, and orientation settings.', icon: Gauge },
      { title: 'Clean page previews', body: 'Review image pages before conversion.', icon: Shield },
      { title: 'Single PDF export', body: 'All images are combined into one PDF download.', icon: FileArchive },
    ],
    faq: [
      { question: 'Can I mix JPG and PNG files?', answer: 'Yes. JPG, PNG, and WebP files can be combined in one PDF.' },
      { question: 'Does file order matter?', answer: 'Yes. The staging order becomes the final PDF page order.' },
      { question: 'Which page size should I use?', answer: 'A4 is best for most documents. Fit works well for mixed image sizes.' },
      { question: 'Can I rotate pages here?', answer: 'Use orientation controls for the whole output. Rotate images before upload if needed.' },
    ],
    relatedSlugs: ['pdf-to-jpg', 'merge-pdf', 'compress-pdf', 'word-to-pdf'],
  },
  'pdf-to-jpg': {
    howItWorks: [
      { title: 'Upload one PDF', body: 'Choose the PDF you want to convert.' },
      { title: 'Set image quality', body: 'Pick the quality and page selection you need.' },
      { title: 'Preview the pages', body: 'Check thumbnails before export.' },
      { title: 'Download JPG files', body: 'Export one image or a ZIP of page images.' },
    ],
    keyFeatures: [
      { title: 'Page selection control', body: 'Export all pages or only selected page ranges.', icon: CheckCircle2 },
      { title: 'Live PDF thumbnails', body: 'Preview real pages before generating JPG files.', icon: Gauge },
      { title: 'Quality presets', body: 'Choose smaller, balanced, or max-quality JPG output.', icon: Shield },
      { title: 'ZIP export for multi-page PDFs', body: 'Multiple pages are bundled into one ZIP download.', icon: FileArchive },
    ],
    faq: [
      { question: 'Can I export just one page?', answer: 'Yes. Select a single page in the page range field.' },
      { question: 'Is this using real page previews?', answer: 'Yes. The page grid is rendered from the uploaded PDF before export.' },
      { question: 'What happens for multi-page PDFs?', answer: 'Multiple JPG files are bundled into a ZIP for cleaner download.' },
      { question: 'Does quality change file size?', answer: 'Yes. Higher quality creates sharper images and larger files.' },
    ],
    relatedSlugs: ['jpg-to-pdf', 'split-pdf', 'pdf-to-word', 'compress-pdf'],
  },
  'pdf-ocr': {
    howItWorks: [
      { title: 'Upload a scanned PDF', body: 'Choose a PDF that needs text recognition.' },
      { title: 'Select the language', body: 'Pick the OCR language before processing.' },
      { title: 'Run OCR', body: 'Each page is rendered and recognized into readable text.' },
      { title: 'Export the result', body: 'Copy, download TXT, or export the OCR text to Word.' },
    ],
    keyFeatures: [
      { title: 'Scanned PDF support', body: 'Designed for image-based and difficult text PDFs.', icon: CheckCircle2 },
      { title: 'Language selection', body: 'Choose the OCR language that matches the document.', icon: Gauge },
      { title: 'Readable text preview', body: 'Review extracted text before export.', icon: Shield },
      { title: 'Multiple export options', body: 'Save the OCR result as text or Word.', icon: FileArchive },
    ],
    faq: [
      { question: 'When should I use OCR?', answer: 'Use OCR when a PDF does not contain selectable text or the extracted text is broken.' },
      { question: 'Will OCR be perfect?', answer: 'OCR quality depends on scan clarity, language, and page quality. Clean scans work best.' },
      { question: 'Can I export OCR text to Word?', answer: 'Yes. The OCR result can be exported as a Word-compatible document.' },
      { question: 'Does OCR take longer than normal text extraction?', answer: 'Yes. OCR renders and reads each page, so it is slower than text-layer extraction.' },
    ],
    relatedSlugs: ['pdf-to-word', 'pdf-to-excel', 'pdf-summarizer', 'pdf-translator'],
  },
  'unlock-pdf': {
    howItWorks: [
      { title: 'Upload the protected PDF', body: 'Choose the file you want to unlock.' },
      { title: 'Enter the password', body: 'Provide the current document password.' },
      { title: 'Run secure unlock', body: 'The file is decrypted into an unlocked PDF.' },
      { title: 'Download the result', body: 'Save the unlocked PDF instantly.' },
    ],
    keyFeatures: [
      { title: 'Password-based unlock', body: 'Use the existing password to remove document protection.', icon: CheckCircle2 },
      { title: 'Secure workflow', body: 'The unlock action is handled in a private in-session flow.', icon: Shield },
      { title: 'Result preview', body: 'Preview the unlocked PDF after processing.', icon: Gauge },
      { title: 'Clean output file', body: 'Download the unlocked document directly.', icon: FileArchive },
    ],
    faq: [
      { question: 'Do I still need the current password?', answer: 'Yes. The tool needs the existing password to unlock the file.' },
      { question: 'Will this work on all PDFs?', answer: 'Most password-protected PDFs work, but unusual encryption setups may still fail.' },
      { question: 'Is the unlocked file a new copy?', answer: 'Yes. The tool creates a separate unlocked output file for download.' },
      { question: 'Can I preview the locked file first?', answer: 'Some protected PDFs may not preview until after the unlock succeeds.' },
    ],
    relatedSlugs: ['compress-pdf', 'merge-pdf', 'split-pdf', 'pdf-ocr'],
  },
  'pdf-translator': {
    howItWorks: [
      { title: 'Upload your PDF', body: 'Choose a PDF to translate.' },
      { title: 'Pick the target language', body: 'Set the output language and translation mode.' },
      { title: 'Extract and translate', body: 'The tool reads the PDF and sends the text through AI translation.' },
      { title: 'Review and export', body: 'Preview the translated result and download it as text or Word.' },
    ],
    keyFeatures: [
      { title: 'Auto source detection', body: 'The translation flow is designed to detect the original language automatically.', icon: CheckCircle2 },
      { title: 'OCR-aware workflow', body: 'Scanned PDFs can be translated by enabling OCR mode first.', icon: Shield },
      { title: 'Translation preview', body: 'Review the translated text before download.', icon: Gauge },
      { title: 'Download-ready export', body: 'Save the translated result as text or a Word document.', icon: FileArchive },
    ],
    faq: [
      { question: 'Do I need to choose the source language?', answer: 'No. The translation prompt is designed to detect it automatically.' },
      { question: 'Can scanned PDFs be translated?', answer: 'Yes, when OCR mode is enabled and the scan quality is readable.' },
      { question: 'What do I download?', answer: 'You can export the translation as plain text or a Word-compatible document.' },
      { question: 'Does this preserve exact PDF layout?', answer: 'The translation focuses on readable content first, not exact visual page recreation.' },
    ],
    relatedSlugs: ['pdf-summarizer', 'pdf-ocr', 'pdf-to-word', 'pdf-to-excel'],
  },
  'pdf-summarizer': {
    howItWorks: [
      { title: 'Upload one PDF', body: 'Choose the PDF you want to summarize.' },
      { title: 'Select summary style', body: 'Pick short, detailed, or bullet-point output.' },
      { title: 'Extract and summarize', body: 'The document text is read and passed through the AI summarizer.' },
      { title: 'Export the result', body: 'Copy, download, or save the summary to Word.' },
    ],
    keyFeatures: [
      { title: 'Multiple summary styles', body: 'Switch between short, detailed, and bullet output modes.', icon: CheckCircle2 },
      { title: 'Key insights panel', body: 'Important takeaways are surfaced in a compact result view.', icon: Gauge },
      { title: 'OCR option for scans', body: 'Image-based PDFs can still be summarized with OCR mode.', icon: Shield },
      { title: 'Reusable summary export', body: 'Download the summary as text or a Word document.', icon: FileArchive },
    ],
    faq: [
      { question: 'Which summary type should I use?', answer: 'Short is best for quick reading, detailed is better for reports, and bullets are best for notes.' },
      { question: 'Can I summarize scanned PDFs?', answer: 'Yes, if OCR mode is enabled and the scan quality is readable.' },
      { question: 'Does this summarize the whole file?', answer: 'Yes. The tool uses the extracted text from the uploaded PDF.' },
      { question: 'Can I save the summary?', answer: 'Yes. You can download the summary as text or export it to Word.' },
    ],
    relatedSlugs: ['pdf-translator', 'pdf-ocr', 'pdf-to-word', 'compress-pdf'],
  },
} as const
