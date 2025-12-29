# log-analysis Specification

## Purpose
TBD - created by archiving change improve-error-tooltip-display. Update Purpose after archive.
## Requirements
### Requirement: Log Analysis Tool
The system SHALL provide web-based tools for analyzing tracking logs from multiple data sources including Sensors Analytics Excel files and Mini Program Grafana JSON exports. Each data source SHALL be accessible through dedicated pages optimized for their specific format and analysis needs.

#### Scenario: Data Source Page Separation
- **WHEN** user accesses the main page
- **THEN** the tool SHALL default to Mini Program data source page
- **AND** provide navigation to Sensors data source page

#### Scenario: Mini Program Dedicated Page
- **WHEN** user is on the Mini Program page
- **THEN** the tool SHALL only accept JSON file format
- **AND** display Mini Program specific filters and features
- **AND** provide clear navigation to Sensors page

#### Scenario: Sensors Dedicated Page
- **WHEN** user accesses the Sensors page
- **THEN** the tool SHALL only accept Excel file format
- **AND** display Sensors specific features and analysis options
- **AND** provide optimized interface for Sensors Analytics data

#### Scenario: Log Record Display
- **WHEN** log records are loaded and parsed on either page
- **THEN** the tool SHALL display records in a tabular format
- **AND** show event details, categories, and properties appropriate to the data source

#### Scenario: Error Status Code Badge Display
- **WHEN** a Mini Program log record contains a response with error status code (e.g., code 400, 401, 403, 404, 500)
- **THEN** the system SHALL display a status code badge in the event description column
- **AND** the badge SHALL show the numeric status code (e.g., "400", "401")
- **AND** the badge SHALL use a visually distinct style (e.g., red or orange background) to indicate error status
- **AND** the badge SHALL be positioned within the event description column alongside the existing event description content

#### Scenario: Error Message Badge Display
- **WHEN** a Mini Program log record contains a response with a message field
- **THEN** the system SHALL display a message badge in the event description column
- **AND** the badge SHALL show the message content (e.g., "参数校验失败")
- **AND** the badge SHALL be positioned next to the status code badge
- **AND** the badge SHALL use a style that complements the status code badge while remaining readable

#### Scenario: Badge Display Logic
- **WHEN** parsing Mini Program log data
- **THEN** the system SHALL extract code and message fields from the response data within failReason
- **AND** SHALL only display badges when code indicates an error status (400-599)
- **AND** SHALL display status code badge for any error status code
- **AND** SHALL display message badge only when message field exists and is not empty
- **AND** SHALL not display badges for successful status codes (200-299)

#### Scenario: Error Record Tooltip Enhancement
- **WHEN** user hovers over an ERROR level record in Mini Program data source
- **THEN** the tool SHALL display a detailed tooltip with structured error information
- **AND** include error code, reason, stack trace, and business context
- **AND** format the information for readability and debugging efficiency

#### Scenario: Device Information Display
- **WHEN** user hovers over any record in Mini Program data source that contains device information
- **THEN** the tool SHALL display device details in the tooltip
- **AND** include device manufacturer, model, operating system, and browser information
- **AND** prioritize device information from args.userAttributes over other sources
- **AND** organize device information in a structured, readable format

### Requirement: Code Architecture Separation
The system SHALL maintain separate JavaScript codebases for each data source to ensure clean separation of concerns and prevent cross-contamination between different data source implementations.

#### Scenario: Mini Program Code Isolation
- **WHEN** user accesses the Mini Program page
- **THEN** the system SHALL only load JavaScript code specific to Mini Program functionality
- **AND** SHALL NOT load Sensors-specific code or logic
- **AND** SHALL provide complete Mini Program analysis capabilities without dependencies on other data sources

#### Scenario: Sensors Code Isolation
- **WHEN** user accesses the Sensors page
- **THEN** the system SHALL only load JavaScript code specific to Sensors functionality
- **AND** SHALL NOT load Mini Program-specific code or logic
- **AND** SHALL provide complete Sensors analysis capabilities without dependencies on other data sources

#### Scenario: Independent Code Maintenance
- **WHEN** developers modify code for one data source
- **THEN** changes SHALL NOT affect the functionality of other data sources
- **AND** SHALL be testable in isolation from other data source implementations

### Requirement: Mini Program Data Sorting
The system SHALL provide sorting controls for Mini Program log data to allow users to view records in ascending or descending order based on record index, or in ascending order based on calibrated time (上报时间).

#### Scenario: Sort Control Display
- **WHEN** user accesses the Mini Program page
- **THEN** the system SHALL display a sort order selector in the filter section
- **AND** SHALL provide options for ascending (正序) and descending (倒序) order based on index
- **AND** SHALL provide an option for sorting by calibrated time (按上报时间排序) in ascending order

#### Scenario: Default Ascending Order
- **WHEN** Mini Program data is loaded and displayed
- **THEN** the system SHALL default to ascending order (正序) based on index
- **AND** SHALL sort records by index in ascending order

#### Scenario: Sort Order Reset on File Upload
- **WHEN** user uploads a new JSON file
- **THEN** the system SHALL reset the sort order to ascending (正序) based on index
- **AND** SHALL update the sort order selector to reflect the default value
- **AND** SHALL display the new file's data sorted in ascending order by index

#### Scenario: Sort Order Toggle
- **WHEN** user changes the sort order selector
- **THEN** the system SHALL immediately re-sort the displayed data
- **AND** SHALL reset to page 1 and update both table content and pagination controls correctly
- **AND** SHALL ensure table content reflects the newly sorted data
- **AND** SHALL ensure pagination controls display the correct current page and total pages
- **AND** SHALL preserve all active filters during sorting

#### Scenario: Sort with Filters
- **WHEN** user applies filters and then changes sort order
- **THEN** the system SHALL sort only the filtered results
- **AND** SHALL maintain filter state across sort operations

#### Scenario: Sort Update from Non-First Page
- **WHEN** user is viewing page 2 or later and changes sort order
- **THEN** the system SHALL reset to page 1
- **AND** SHALL update table content to show the first page of re-sorted data
- **AND** SHALL update pagination controls to reflect page 1 of the new total pages
- **AND** SHALL ensure no stale data or pagination state is displayed

#### Scenario: Sort by Calibrated Time
- **WHEN** user selects "按上报时间排序" option
- **THEN** the system SHALL sort records by `calibratedTime` from `item.rawData.analysisData.calibratedTime` in ascending order
- **AND** SHALL place records with earlier calibratedTime before records with later calibratedTime
- **AND** SHALL handle records missing calibratedTime field gracefully (place them at the end or use index as fallback)

#### Scenario: Calibrated Time Sort with Missing Data
- **WHEN** user selects "按上报时间排序" and some records do not have `calibratedTime` field
- **THEN** the system SHALL sort records with valid `calibratedTime` first in ascending order
- **AND** SHALL place records without `calibratedTime` at the end, sorted by index as fallback

### Requirement: Enhanced Mini Program Event Details
The system SHALL provide an enhanced details view for Mini Program log events through a dedicated modal dialog with tree-structured display of API request information. Event description column SHALL NOT display hover tooltips to avoid interface clutter and focus user attention on the primary detail modal.

The system SHALL organize API log details into three distinct sections: [method] for request information, [response] for response data, and [error] for error information (only one of response or error SHALL be displayed). Each section SHALL use a collapsible tree structure where parent nodes can be expanded to show child details.

The system SHALL display tree nodes with clear visual hierarchy that makes parent-child relationships immediately apparent. Child nodes SHALL be visually indented relative to their parent nodes, and visual connection lines SHALL indicate the nesting structure.

#### Scenario: Simplified Event Description Display
- **WHEN** user views the Mini Program data table
- **THEN** the system SHALL display event descriptions without hover tooltips
- **AND** SHALL show clean, readable text in the description column
- **AND** SHALL NOT display overlay tooltips on mouse hover

#### Scenario: Unified Detail Access
- **WHEN** user wants to view detailed event information
- **THEN** the system SHALL require clicking the "查看详情" button
- **AND** SHALL NOT provide alternative hover-based detail access
- **AND** SHALL direct all detailed information viewing through the modal dialog

#### Scenario: Tree-Structured API Details Display
- **WHEN** user clicks "查看详情" button on an API log record
- **THEN** the system SHALL display the modal dialog with three collapsible sections: [method], [response], and [error]
- **AND** SHALL display [method] section with request details in tree format
- **AND** SHALL display either [response] or [error] section (but not both) based on available data
- **AND** SHALL default all tree nodes to collapsed state
- **AND** SHALL allow users to click parent nodes to expand/collapse child details

#### Scenario: Tree Node Interaction
- **WHEN** user clicks on a collapsed parent node in the detail modal
- **THEN** the system SHALL expand the node to show child details
- **AND** SHALL display an expand indicator (▶) that changes to collapse indicator (▼) when expanded
- **AND** SHALL maintain expansion state during modal interaction
- **AND** SHALL allow nested tree structures for complex data objects

#### Scenario: Clear Visual Hierarchy
- **WHEN** displaying nested data structures in the tree view (e.g., `data.metadata`)
- **THEN** child nodes SHALL be visually indented relative to their parent nodes
- **AND** SHALL use progressive indentation (e.g., 20-24px per depth level) to clearly distinguish nesting levels
- **AND** SHALL display visual connection lines or borders to indicate parent-child relationships
- **AND** SHALL use different background colors or opacity levels for different depth levels to enhance visual distinction
- **AND** SHALL ensure that nested nodes (like `metadata` within `data`) are clearly recognizable as children, not siblings

#### Scenario: Reduced Interface Complexity
- **WHEN** displaying the Mini Program event table
- **THEN** the system SHALL maintain a clean, uncluttered interface
- **AND** SHALL eliminate hover interactions that could interfere with table readability
- **AND** SHALL focus user attention on primary actions and data

#### Scenario: API Data Section Logic
- **WHEN** displaying API log details in the modal
- **THEN** the system SHALL always show [method] section if request data exists
- **AND** SHALL show [response] section only when response data is available and no error occurred
- **AND** SHALL show [error] section only when error data is available
- **AND** SHALL display data source identifier prominently in the modal
- **AND** SHALL maintain existing copy functionality for each data section

### Requirement: Session-Based Color Coding for Error Index Badges
The system SHALL assign colors to error index badges based on sessionId to visually distinguish records from different sessions. Records with the same sessionId SHALL use the same color, and colors SHALL cycle through a predefined color list when the number of unique sessionIds exceeds the list length.

#### Scenario: Color Assignment Based on SessionId
- **WHEN** rendering an error index badge with a valid sessionId in `item.rawData.analysisData.sessionId`
- **THEN** the system SHALL assign a color from the predefined color list based on the sessionId
- **AND** SHALL apply the color to the badge's background, border, and text color
- **AND** SHALL ensure the same sessionId always receives the same color

#### Scenario: Color Consistency Across Records
- **WHEN** multiple log records share the same sessionId
- **THEN** the system SHALL display all their error index badges with the same color
- **AND** SHALL maintain color consistency across different pages and filter states

#### Scenario: Color List Cycling
- **WHEN** the number of unique sessionIds exceeds the predefined color list length
- **THEN** the system SHALL cycle through the color list from the beginning
- **AND** SHALL use modulo arithmetic to map sessionIds to colors

#### Scenario: Missing SessionId Handling
- **WHEN** a log record does not have a sessionId or the sessionId is empty/null
- **THEN** the system SHALL display the error index badge with default styling
- **AND** SHALL not apply session-based color coding

#### Scenario: Color List Definition
- **WHEN** assigning colors to error index badges
- **THEN** the system SHALL use the predefined color list: ['#67C23A', '#E6A23C', '#F56C6C', '#909399', '#409EFF']
- **AND** SHALL apply colors in the order specified in the list

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

