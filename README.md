# LeGit - AI-Powered Git Commit Message Generator

LeGit is a VS Code extension that uses Google's Gemini AI to automatically generate meaningful and descriptive git commit messages based on your staged changes.

## Features

- 🤖 **AI-Generated Commit Messages**: Uses Gemini 3.8 Flash to analyze your code changes and generate contextual commit messages
- 📝 **Multiple Commit Styles**: Choose between Conventional Commits, descriptive, or brief message styles
- 🎯 **Smart Staging**: Automatically offers to stage all changes if no changes are staged
- ✏️ **Editable Messages**: Review and edit generated messages before committing
- 📋 **Clipboard Integration**: Copy generated messages to clipboard for use in other git tools
- 🔄 **Source Control Integration**: Seamlessly integrates with VS Code's built-in Source Control panel

## Prerequisites

- VS Code version 1.103.0 or higher
- Git installed and configured
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Installation

1. Install the extension from the VS Code Marketplace
2. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Open VS Code settings and search for "LeGit"
4. Paste your API key in the "LeGit: Api Key" setting

## Usage

### Commands

1. **Generate Commit Message** (`Ctrl+Shift+P` → "LeGit: Generate Commit Message")
   - Generates a commit message and copies it to your clipboard
   - Opens Source Control panel for you to paste and commit manually

2. **Generate & Commit** (`Ctrl+Shift+P` → "LeGit: Generate & Commit")
   - Generates a commit message and commits immediately after your review

### From Source Control Panel

- Look for the LeGit button in your Source Control panel title bar
- Click it to generate a commit message for your staged changes

## Configuration

Configure LeGit through VS Code settings:

- **API Key**: Your Google Gemini API key
- **Commit Message Style**: 
  - `conventional`: Uses Conventional Commits format (e.g., `feat: add new feature`)
  - `descriptive`: Detailed explanatory messages
  - `brief`: Short, concise messages
- **Max Diff Lines**: Maximum number of diff lines to analyze (default: 500)

## Examples

### Conventional Style
```
feat: add user authentication system
fix: resolve memory leak in data processing
docs: update API documentation
```

### Descriptive Style
```
Add comprehensive user authentication with JWT tokens
Fix memory leak that occurred during large data processing operations
Update API documentation to include new endpoints and examples
```

### Brief Style
```
Add user auth
Fix memory leak
Update docs
```

## Troubleshooting

### "No staged changes found"
- Make sure you have changes staged (`git add .` or stage files in Source Control panel)
- The extension will offer to stage all changes automatically

### "API key not set"
- Go to VS Code Settings → Extensions → LeGit
- Add your Google Gemini API key
- Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### "Not in a git repository"
- Make sure your workspace folder is a git repository
- Initialize git with `git init` if needed

## Privacy & Security

- Your code diffs are sent to Google's Gemini API for analysis
- API keys are stored locally in VS Code settings
- No data is stored or logged by the extension itself
- Consider your organization's policies regarding AI code analysis tools

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/WebDevHarsha/legit/issues).

## License

MIT License - see LICENSE file for details.

## Release Notes

### 0.0.1

Initial release of LeGit with:
- AI-powered commit message generation using Google Gemini
- Multiple commit message styles (Conventional, Descriptive, Brief)
- Source Control panel integration
- Clipboard support for generated messages

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
