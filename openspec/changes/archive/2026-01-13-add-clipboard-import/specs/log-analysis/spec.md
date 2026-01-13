## MODIFIED Requirements

### Requirement: Import Additional Files
The system SHALL provide functionality to import additional JSON files and merge them with the existing data source. Users SHALL be able to click an "导入其他文件" button to open a modal dialog containing an upload area identical to the main upload area. Additionally, the system SHALL provide a "导入剪贴板" button that allows users to import JSON data directly from the clipboard without requiring a file upload.

#### Scenario: Import Button Display
- **WHEN** user views the Mini Program data analysis page
- **THEN** the system SHALL display an "📥 导入其他文件" button in the filter section
- **AND** SHALL replace the previous "📥 导出筛选结果" button with the import button

#### Scenario: Clipboard Import Button Display
- **WHEN** user views the Mini Program data analysis page
- **THEN** the system SHALL display a "导入剪贴板" button near the upload area
- **AND** the button SHALL be visually distinct and easily accessible
- **AND** the button SHALL use appropriate styling consistent with other action buttons

#### Scenario: Clipboard Import Button Click
- **WHEN** user clicks the "导入剪贴板" button
- **THEN** the system SHALL attempt to read text content from the clipboard using the Clipboard API
- **AND** SHALL display a loading indicator or message (e.g., "正在读取剪贴板...")
- **AND** SHALL handle clipboard access errors gracefully (e.g., permission denied)

#### Scenario: Clipboard Content Validation
- **WHEN** clipboard content is successfully read
- **THEN** the system SHALL validate that the content is valid JSON format
- **AND** SHALL parse the JSON content using `JSON.parse()`
- **AND** SHALL accept both JSON objects and JSON arrays
- **AND** SHALL automatically wrap a single JSON object into an array `[object]` for processing
- **AND** SHALL validate that the parsed result (or wrapped result) is an array with at least one element
- **AND** SHALL display an error message if the content is not valid JSON or does not meet format requirements

#### Scenario: Clipboard JSON Processing
- **WHEN** clipboard content is successfully validated as valid JSON (object or array)
- **THEN** the system SHALL wrap single JSON objects into an array format
- **AND** SHALL process the JSON data using the same parsing logic as file import (`parseMiniprogramData`)
- **AND** SHALL merge the parsed data with existing `allData` array using the same merging logic as file import
- **AND** SHALL preserve all existing data records
- **AND** SHALL add all new records from the clipboard data

#### Scenario: Clipboard Import Success Feedback
- **WHEN** clipboard data is successfully imported and merged
- **THEN** the system SHALL display a success message indicating the number of records imported
- **AND** SHALL update the event filter dropdown with all unique events from the merged data
- **AND** SHALL reset filters and reapply them to the merged dataset
- **AND** SHALL reset pagination to page 1
- **AND** SHALL refresh the table display with the merged data

#### Scenario: Clipboard Import Error Handling
- **WHEN** clipboard access fails or content is invalid
- **THEN** the system SHALL display an appropriate error message
- **AND** SHALL NOT modify the existing data source
- **AND** SHALL allow user to try importing again or use file import instead

#### Scenario: Import Modal Dialog
- **WHEN** user clicks the "📥 导入其他文件" button
- **THEN** the system SHALL display a modal dialog
- **AND** the modal SHALL contain an upload area identical to the main page upload area (uploadArea)
- **AND** the upload area SHALL support both click and drag-and-drop file selection
- **AND** the upload area SHALL accept only JSON files (.json format)
- **AND** the modal SHALL have a close button or method to dismiss it

#### Scenario: File Upload in Modal
- **WHEN** user selects or drops a JSON file in the import modal upload area
- **THEN** the system SHALL parse the JSON file using the same parsing logic as the main upload
- **AND** SHALL validate that the file is a valid JSON format
- **AND** SHALL display parsing status (loading, success, or error) within the modal

#### Scenario: Data Merging
- **WHEN** a JSON file is successfully parsed in the import modal or clipboard content is successfully processed
- **THEN** the system SHALL merge the newly parsed data with the existing `allData` array
- **AND** SHALL combine the arrays to create a new unified data source
- **AND** SHALL preserve all existing data records
- **AND** SHALL add all new records from the imported file or clipboard

#### Scenario: Data Source Update After Import
- **WHEN** data is successfully merged after import (from file or clipboard)
- **THEN** the system SHALL update the event filter dropdown with all unique events from the merged data
- **AND** SHALL reset filters and reapply them to the merged dataset
- **AND** SHALL reset pagination to page 1
- **AND** SHALL refresh the table display with the merged data
- **AND** SHALL close the import modal automatically (if opened from file import)
- **AND** SHALL display a success message indicating the number of records imported

#### Scenario: Import Error Handling
- **WHEN** file parsing fails in the import modal or clipboard content validation fails
- **THEN** the system SHALL display an error message within the modal (for file import) or as a notification (for clipboard import)
- **AND** SHALL NOT merge any data
- **AND** SHALL NOT close the modal automatically (for file import)
- **AND** SHALL allow user to try importing another file or clipboard content

#### Scenario: Empty Data Handling
- **WHEN** user imports a file or clipboard content with no valid log records
- **THEN** the system SHALL display an appropriate message
- **AND** SHALL NOT modify the existing data source
- **AND** SHALL allow user to import another file or clipboard content

#### Scenario: Session Color Mapping Preservation
- **WHEN** data is merged from an imported file or clipboard
- **THEN** the system SHALL preserve existing sessionId color mappings for existing records
- **AND** SHALL assign colors to new sessionIds from imported data using the same color cycling logic
- **AND** SHALL ensure color consistency across merged records
