## MODIFIED Requirements
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
