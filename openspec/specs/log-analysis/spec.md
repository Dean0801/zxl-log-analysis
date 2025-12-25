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
The system SHALL provide sorting controls for Mini Program log data to allow users to view records in ascending or descending order based on record index.

#### Scenario: Sort Control Display
- **WHEN** user accesses the Mini Program page
- **THEN** the system SHALL display a sort order selector in the filter section
- **AND** SHALL provide options for ascending (正序) and descending (倒序) order

#### Scenario: Default Ascending Order
- **WHEN** Mini Program data is loaded and displayed
- **THEN** the system SHALL default to ascending order (正序)
- **AND** SHALL sort records by index in ascending order

#### Scenario: Sort Order Reset on File Upload
- **WHEN** user uploads a new JSON file
- **THEN** the system SHALL reset the sort order to ascending (正序)
- **AND** SHALL update the sort order selector to reflect the default value
- **AND** SHALL display the new file's data sorted in ascending order

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

