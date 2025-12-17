## ADDED Requirements
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
- **AND** SHALL maintain the current page position when possible
- **AND** SHALL preserve all active filters during sorting

#### Scenario: Sort with Filters
- **WHEN** user applies filters and then changes sort order
- **THEN** the system SHALL sort only the filtered results
- **AND** SHALL maintain filter state across sort operations
