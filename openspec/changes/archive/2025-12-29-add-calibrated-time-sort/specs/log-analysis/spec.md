## MODIFIED Requirements
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

