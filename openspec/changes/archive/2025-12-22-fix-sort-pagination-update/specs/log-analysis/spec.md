## MODIFIED Requirements
### Requirement: Mini Program Data Sorting
The system SHALL provide sorting controls for Mini Program log data to allow users to view records in ascending or descending order based on record index.

#### Scenario: Sort Control Display
- **WHEN** user accesses the Mini Program page
- **THEN** the system SHALL display a sort order selector in the filter section
- **AND** SHALL provide options for ascending (正序) and descending (倒序) order

#### Scenario: Default Descending Order
- **WHEN** Mini Program data is loaded and displayed
- **THEN** the system SHALL default to descending order (最新数据在前)
- **AND** SHALL sort records by index in reverse order

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

