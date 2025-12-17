## MODIFIED Requirements
### Requirement: Enhanced Mini Program Event Details
The system SHALL provide an enhanced details view for Mini Program log events through a dedicated modal dialog. Event description column SHALL NOT display hover tooltips to avoid interface clutter and focus user attention on the primary detail modal.

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

#### Scenario: Reduced Interface Complexity
- **WHEN** displaying the Mini Program event table
- **THEN** the system SHALL maintain a clean, uncluttered interface
- **AND** SHALL eliminate hover interactions that could interfere with table readability
- **AND** SHALL focus user attention on primary actions and data
