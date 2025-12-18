## MODIFIED Requirements
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
