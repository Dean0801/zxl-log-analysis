## REMOVED Requirements

### Requirement: Export Filtered Results
**Reason**: 用户不再需要导出筛选结果功能，改为使用导入功能合并多个文件的数据。
**Migration**: 导出功能已移除，用户可以通过导入功能合并多个文件的数据进行分析。

## ADDED Requirements

### Requirement: Import Additional Files
The system SHALL provide functionality to import additional JSON files and merge them with the existing data source. Users SHALL be able to click an "导入其他文件" button to open a modal dialog containing an upload area identical to the main upload area.

#### Scenario: Import Button Display
- **WHEN** user views the Mini Program data analysis page
- **THEN** the system SHALL display an "📥 导入其他文件" button in the filter section
- **AND** SHALL replace the previous "📥 导出筛选结果" button with the import button

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
- **WHEN** a JSON file is successfully parsed in the import modal
- **THEN** the system SHALL merge the newly parsed data with the existing `allData` array
- **AND** SHALL combine the arrays to create a new unified data source
- **AND** SHALL preserve all existing data records
- **AND** SHALL add all new records from the imported file

#### Scenario: Data Source Update After Import
- **WHEN** data is successfully merged after import
- **THEN** the system SHALL update the event filter dropdown with all unique events from the merged data
- **AND** SHALL reset filters and reapply them to the merged dataset
- **AND** SHALL reset pagination to page 1
- **AND** SHALL refresh the table display with the merged data
- **AND** SHALL close the import modal automatically
- **AND** SHALL display a success message indicating the number of records imported

#### Scenario: Import Error Handling
- **WHEN** file parsing fails in the import modal
- **THEN** the system SHALL display an error message within the modal
- **AND** SHALL NOT merge any data
- **AND** SHALL NOT close the modal automatically
- **AND** SHALL allow user to try importing another file

#### Scenario: Empty Data Handling
- **WHEN** user imports a file with no valid log records
- **THEN** the system SHALL display an appropriate message
- **AND** SHALL NOT modify the existing data source
- **AND** SHALL allow user to import another file

#### Scenario: Session Color Mapping Preservation
- **WHEN** data is merged from an imported file
- **THEN** the system SHALL preserve existing sessionId color mappings for existing records
- **AND** SHALL assign colors to new sessionIds from imported data using the same color cycling logic
- **AND** SHALL ensure color consistency across merged records

