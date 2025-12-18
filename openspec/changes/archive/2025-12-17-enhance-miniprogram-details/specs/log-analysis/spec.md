## ADDED Requirements
### Requirement: Enhanced Mini Program Event Details
The system SHALL provide an enhanced details view for Mini Program log events through a dedicated modal dialog.

#### Scenario: Details Button Display
- **WHEN** user views the Mini Program data table
- **THEN** the system SHALL display a "查看详情" button in the operations column
- **AND** SHALL remove the properties column from the table

#### Scenario: Details Modal Content
- **WHEN** user clicks the "查看详情" button
- **THEN** the system SHALL display a modal dialog containing:
  - Event description and details from the tooltip
  - Complete event properties in formatted display
  - Data source identifier ("小程序日志")
  - Attractive, well-organized layout

#### Scenario: Modal Interaction
- **WHEN** the details modal is open
- **THEN** the system SHALL provide clear close options (X button, click outside)
- **AND** SHALL prevent interaction with the background table
- **AND** SHALL maintain responsive design for different screen sizes

#### Scenario: Properties Display Enhancement
- **WHEN** displaying event properties in the modal
- **THEN** the system SHALL format properties in a readable, structured layout
- **AND** SHALL use appropriate colors and typography for different property types
- **AND** SHALL handle long property values with proper text wrapping
