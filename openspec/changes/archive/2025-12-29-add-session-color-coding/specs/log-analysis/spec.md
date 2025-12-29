## ADDED Requirements
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

