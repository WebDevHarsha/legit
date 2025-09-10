# Change Log

All notable changes to the "LeGit" extension will be documented in this file.

## [0.0.1] - 2025-09-10

### Added
- AI-powered commit message generation using Google Gemini
- Two main commands:
  - "Generate Commit Message" - Generates message and copies to clipboard
  - "Generate & Commit" - Generates message and commits after review
- Multiple commit message styles:
  - Conventional Commits format
  - Descriptive explanatory messages
  - Brief concise messages
- Smart staging detection with auto-stage option
- Source Control panel integration
- Configurable API key and message preferences
- Input validation and error handling
- Status bar progress indicators
- Cross-platform compatibility

### Configuration
- `legit.apiKey` - Google Gemini API key
- `legit.commitMessageStyle` - Commit message style preference
- `legit.maxDiffLines` - Maximum diff lines to analyze