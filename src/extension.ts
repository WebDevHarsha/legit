import * as vscode from "vscode";
import { exec } from "child_process";
import * as util from "util";

const execPromise = util.promisify(exec);

interface CommitMessageOptions {
  style: "conventional" | "descriptive" | "brief";
  maxLines: number;
}

// Check if we're in a git repository
async function isGitRepository(workspaceRoot: string): Promise<boolean> {
  try {
    await execPromise("git rev-parse --git-dir", { cwd: workspaceRoot });
    return true;
  } catch {
    return false;
  }
}

// Get the current working directory for git commands
function getWorkspaceRoot(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    throw new Error("No workspace folder open");
  }
  return workspaceFolders[0].uri.fsPath;
}

// Generate commit message using Gemini
async function generateCommitMessage(diff: string, options: CommitMessageOptions): Promise<string> {
  const config = vscode.workspace.getConfiguration("legit");
  const apiKey = config.get<string>("apiKey");
  
  if (!apiKey) {
    throw new Error("Gemini API key not set. Please add it in VS Code settings (legit.apiKey).\nGet your API key from Google AI Studio: https://aistudio.google.com/app/apikey");
  }

  // Truncate diff if it's too long
  const truncatedDiff = diff.split('\n').slice(0, options.maxLines).join('\n');
  if (diff.split('\n').length > options.maxLines) {
    vscode.window.showWarningMessage(`Diff truncated to ${options.maxLines} lines to stay within API limits`);
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  let prompt = `Analyze the following git diff and generate a commit message. `;
  
  switch (options.style) {
    case "conventional":
      prompt += `Use Conventional Commits format (type(scope): description). Common types: feat, fix, docs, style, refactor, test, chore. Keep it under 50 characters for the summary line.`;
      break;
    case "descriptive":
      prompt += `Write a descriptive commit message that clearly explains what was changed and why. Use present tense and imperative mood.`;
      break;
    case "brief":
      prompt += `Write a brief, concise commit message that summarizes the changes in a few words.`;
      break;
  }

  prompt += `\n\nGit diff:\n${truncatedDiff}\n\nReturn only the commit message, no additional text or explanation.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response
    return text.trim().replace(/^["']|["']$/g, '');
  } catch (error: any) {
    if (error.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid API key. Please check your Gemini API key in settings.');
    }
    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("LeGit extension is now active!");

  // Command to generate commit message only
  const generateCommand = vscode.commands.registerCommand(
    "legit.generateCommitMessage",
    async () => {
      try {
        const workspaceRoot = getWorkspaceRoot();
        
        // Check if we're in a git repository
        if (!(await isGitRepository(workspaceRoot))) {
          vscode.window.showErrorMessage("Not in a git repository!");
          return;
        }

        // Get configuration
        const config = vscode.workspace.getConfiguration("legit");
        const options: CommitMessageOptions = {
          style: config.get<"conventional" | "descriptive" | "brief">("commitMessageStyle") || "conventional",
          maxLines: config.get<number>("maxDiffLines") || 500
        };

        // Step 1: Get staged changes
        const { stdout: diff } = await execPromise("git diff --cached", { cwd: workspaceRoot });

        if (!diff.trim()) {
          // If no staged changes, ask if user wants to stage all changes
          const stageAll = await vscode.window.showQuickPick(
            ["Stage all changes and generate message", "Cancel"],
            { placeHolder: "No staged changes found. What would you like to do?" }
          );
          
          if (stageAll === "Stage all changes and generate message") {
            await execPromise("git add .", { cwd: workspaceRoot });
            const { stdout: newDiff } = await execPromise("git diff --cached", { cwd: workspaceRoot });
            if (!newDiff.trim()) {
              vscode.window.showWarningMessage("No changes to commit!");
              return;
            }
          } else {
            return;
          }
        }

        // Get the actual diff to use
        const { stdout: finalDiff } = await execPromise("git diff --cached", { cwd: workspaceRoot });

        // Step 2: Generate commit message
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(sync~spin) Generating commit message...";
        statusBarItem.show();

        try {
          const aiMessage = await generateCommitMessage(finalDiff, options);
          statusBarItem.dispose();

          // Step 3: Show the generated message in an input box for editing
          const commitMessage = await vscode.window.showInputBox({
            value: aiMessage,
            prompt: "Review and edit the generated commit message",
            placeHolder: "Edit commit message if needed...",
            validateInput: (value) => {
              if (!value.trim()) {
                return "Commit message cannot be empty";
              }
              return null;
            }
          });

          if (commitMessage) {
            // Copy to clipboard for easy use
            await vscode.env.clipboard.writeText(commitMessage);
            vscode.window.showInformationMessage("Commit message copied to clipboard!", "Open Source Control").then(selection => {
              if (selection === "Open Source Control") {
                vscode.commands.executeCommand("workbench.view.scm");
              }
            });
          }
        } catch (error) {
          statusBarItem.dispose();
          throw error;
        }

      } catch (err: any) {
        vscode.window.showErrorMessage(`Error: ${err.message}`);
      }
    }
  );

  // Command to generate and commit in one step
  const generateAndCommitCommand = vscode.commands.registerCommand(
    "legit.generateAndCommit",
    async () => {
      try {
        const workspaceRoot = getWorkspaceRoot();
        
        // Check if we're in a git repository
        if (!(await isGitRepository(workspaceRoot))) {
          vscode.window.showErrorMessage("Not in a git repository!");
          return;
        }

        // Get configuration
        const config = vscode.workspace.getConfiguration("legit");
        const options: CommitMessageOptions = {
          style: config.get<"conventional" | "descriptive" | "brief">("commitMessageStyle") || "conventional",
          maxLines: config.get<number>("maxDiffLines") || 500
        };

        // Step 1: Get staged changes
        let { stdout: diff } = await execPromise("git diff --cached", { cwd: workspaceRoot });

        if (!diff.trim()) {
          // If no staged changes, ask if user wants to stage all changes
          const stageAll = await vscode.window.showQuickPick(
            ["Stage all changes and commit", "Cancel"],
            { placeHolder: "No staged changes found. What would you like to do?" }
          );
          
          if (stageAll === "Stage all changes and commit") {
            await execPromise("git add .", { cwd: workspaceRoot });
            const { stdout: newDiff } = await execPromise("git diff --cached", { cwd: workspaceRoot });
            if (!newDiff.trim()) {
              vscode.window.showWarningMessage("No changes to commit!");
              return;
            }
            diff = newDiff;
          } else {
            return;
          }
        }

        // Step 2: Generate commit message
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(sync~spin) Generating commit message...";
        statusBarItem.show();

        try {
          const aiMessage = await generateCommitMessage(diff, options);
          statusBarItem.dispose();

          // Step 3: Let user review/edit before committing
          const commitMessage = await vscode.window.showInputBox({
            value: aiMessage,
            prompt: "Review the generated commit message before committing",
            placeHolder: "Edit commit message if needed...",
            validateInput: (value) => {
              if (!value.trim()) {
                return "Commit message cannot be empty";
              }
              return null;
            }
          });

          if (!commitMessage) {
            vscode.window.showInformationMessage("Commit cancelled.");
            return;
          }

          // Step 4: Commit
          statusBarItem.text = "$(git-commit) Committing...";
          statusBarItem.show();
          
          // Escape quotes properly for cross-platform compatibility
          const escapedMessage = commitMessage.replace(/"/g, '\\"');
          await execPromise(`git commit -m "${escapedMessage}"`, { cwd: workspaceRoot });
          
          statusBarItem.dispose();
          vscode.window.showInformationMessage(`✅ Commit successful: "${commitMessage}"`);
          
          // Refresh source control view
          vscode.commands.executeCommand("git.refresh");
          
        } catch (error) {
          statusBarItem.dispose();
          throw error;
        }

      } catch (err: any) {
        vscode.window.showErrorMessage(`Error: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(generateCommand, generateAndCommitCommand);
}

export function deactivate() {}
