# log-analysis Specification

## Purpose
TBD - created by archiving change improve-error-tooltip-display. Update Purpose after archive.
## Requirements
### Requirement: Log Analysis Tool
The system SHALL provide a web-based tool for analyzing tracking logs from multiple data sources including Sensors Analytics Excel files and Mini Program Grafana JSON exports.

#### Scenario: Data Source Selection
- **WHEN** user selects a data source (Sensors or Mini Program)
- **THEN** the tool SHALL accept the appropriate file format
- **AND** parse the data according to the selected source type

#### Scenario: Log Record Display
- **WHEN** log records are loaded and parsed
- **THEN** the tool SHALL display records in a tabular format
- **AND** show event details, categories, and properties

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

