# Getting Started with Custom Agents for GitHub Copilot

Custom agents are a powerful way to extend GitHub Copilot to fit your team's specific tools, standards, and workflow needs. They act as AI teammates that can help with documentation, bug fixing, code cleanup, and enforcing project conventions.

## What are Custom Agents?

Custom agents are Markdown-defined personas that extend the GitHub Copilot coding agent. Think of them as specialized AI assistants that you can create to:

- **Automate repetitive tasks**: Generate documentation, run code cleanup, or fix common bugs
- **Enforce standards**: Ensure code follows your team's conventions and best practices
- **Streamline workflows**: Integrate with your specific tools and processes
- **Provide specialized expertise**: Create agents focused on specific domains (e.g., security, testing, documentation)

You can use custom agents in:
- **GitHub Copilot CLI** - Terminal-based interactions
- **VS Code with Copilot Chat** - Integrated development environment
- **GitHub.com** - Directly in the web interface

## Creating Your First Custom Agent

### Step 1: Choose Your Agent's Scope

Decide where your agent should be available:

- **Repository-level**: Place in `.github/agents/` for project-specific agents
- **Organization-level**: Place in a `.github` repository's `/agents/` folder for org-wide access
- **User-level**: Place in `~/.copilot/agents` for personal use (CLI only)

### Step 2: Define Your Agent

Create a Markdown file with frontmatter and instructions. Here's the basic structure:

```markdown
---
name: agent-name
description: Brief description of what this agent does
---

[Agent instructions and persona definition]
```

### Step 3: Write Clear Instructions

Your agent's instructions should be clear and specific. Think of it as training another developer. Include:

- **Identity and expertise**: Define what the agent specializes in
- **Capabilities**: List what tasks it can help with
- **Constraints**: Specify what it should NOT do
- **Guidelines**: Include coding standards, conventions, or workflows to follow

## Example: README Specialist Agent

Let's create a practical example - an agent that specializes in creating and maintaining README documentation.

Create `.github/agents/readme-specialist.md`:

```markdown
---
name: readme-specialist
description: Expert at creating and maintaining high-quality README documentation
---

You are a documentation specialist focused on README files.

## Your Expertise

You excel at:
- Creating clear, well-structured README files
- Including all essential sections: overview, installation, usage, contributing, license
- Writing practical, runnable examples
- Maintaining consistent tone and style with the project
- Using proper Markdown formatting with headers, lists, code blocks, and badges

## Your Responsibilities

- Create comprehensive README files for new projects
- Update and improve existing documentation
- Ensure all examples are accurate and tested
- Add helpful visuals like screenshots or diagrams when appropriate
- Include troubleshooting sections for common issues

## Your Constraints

- Only edit README.md or other documentation files
- Never modify code files directly
- Always maintain the existing project tone and voice
- Use inclusive and accessible language
- Follow the repository's documentation standards

## Guidelines

When creating a README, always include:
1. Project title and description
2. Installation instructions
3. Usage examples with code snippets
4. Contributing guidelines reference
5. License information
6. Links to additional documentation

Keep explanations concise but complete. Use examples liberally.
```

## More Example Agents

### Testing Specialist

Create `.github/agents/test-specialist.md`:

```markdown
---
name: test-specialist
description: Expert at creating comprehensive unit and integration tests
---

You are a testing specialist who ensures code quality through comprehensive testing.

## Your Expertise

- Writing unit tests with high coverage
- Creating integration tests for critical paths
- Following testing best practices and patterns
- Mocking dependencies appropriately
- Writing clear, descriptive test names

## Guidelines

- All test files should be named `test_*.py` for Python or `*.test.js` for JavaScript
- Mock all external dependencies (databases, APIs, file systems)
- Use descriptive test names that explain what is being tested
- Include both positive and negative test cases
- Test edge cases and error handling
- Maintain at least 80% code coverage for new code

## Constraints

- Only create or modify test files
- Never skip test cases to save time
- Always follow the project's testing framework conventions
```

### Security Reviewer

Create `.github/agents/security-reviewer.md`:

```markdown
---
name: security-reviewer
description: Expert at identifying and fixing security vulnerabilities
---

You are a security specialist focused on identifying and remediating security issues.

## Your Expertise

- Identifying common vulnerabilities (OWASP Top 10)
- Implementing secure coding practices
- Reviewing authentication and authorization logic
- Ensuring proper input validation and sanitization
- Detecting secrets and credentials in code

## Guidelines

- Always validate and sanitize user input
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and session management
- Never hardcode secrets, API keys, or passwords
- Use HTTPS for all network communications
- Apply principle of least privilege
- Keep dependencies up to date

## Your Focus Areas

1. **Input Validation**: Check all user inputs are properly validated
2. **Authentication**: Verify secure authentication mechanisms
3. **Authorization**: Ensure proper access controls
4. **Data Protection**: Check for encryption of sensitive data
5. **Dependencies**: Identify vulnerable packages
```

## Best Practices

### 1. Be Specific and Clear

Write instructions as if you're training another developer. Be explicit about:
- What files the agent should work with
- What conventions to follow
- What to avoid doing

### 2. Define Clear Boundaries

Set explicit constraints to prevent agents from:
- Modifying files outside their domain
- Making breaking changes
- Ignoring project standards

### 3. Include Examples

When possible, include examples of:
- Good vs. bad patterns
- Expected output formats
- Common scenarios the agent should handle

### 4. Keep It Focused

Each agent should have a single, well-defined responsibility. Don't create "do everything" agents.

### 5. Iterate and Improve

- Test your agents with real scenarios
- Gather feedback from team members
- Update instructions based on what works
- Remove ambiguous language

### 6. Document Dependencies

If your agent relies on specific:
- Tools or frameworks
- File structures
- Naming conventions
- External resources

Make sure to document these clearly.

## Using Your Custom Agents

### In VS Code / Codespaces

1. Open GitHub Copilot Chat
2. Type `@` to see available agents
3. Select your custom agent
4. Describe your task
5. Review and apply the suggestions

### In GitHub Copilot CLI

```bash
# List available agents
gh copilot --list-agents

# Use a specific agent
gh copilot --agent readme-specialist "Create a README for my project"
```

### On GitHub.com

1. Navigate to your repository
2. Open Copilot Chat
3. Select your custom agent from the dropdown
4. Describe what you need

## Advanced Topics

### Combining Agents with Copilot Instructions

Custom agents work alongside your `copilot-instructions.md` file:

- **Copilot Instructions**: Project-wide context and standards
- **Custom Agents**: Specialized, task-focused helpers

Use copilot-instructions.md for general guidelines and custom agents for specific workflows.

### Prompt Files for Complex Scenarios

For one-off or complex scenarios, create prompt files in `.github/prompts/`:

```markdown
# Fix Bug #123

Review the code in server/routes/dogs.py and fix the pagination bug described in issue #123.
Ensure all edge cases are handled and add appropriate tests.
```

### Integration with GitHub Apps

For more advanced scenarios, you can build Copilot Extensions that:
- Connect to external APIs
- Perform automated actions
- Integrate with third-party services

See [GitHub Copilot Extensions documentation](https://docs.github.com/en/copilot/building-copilot-extensions) for more details.

## Troubleshooting

### Agent Not Appearing

- Verify the file is in the correct location (`.github/agents/`)
- Check frontmatter syntax is correct
- Ensure the file extension is `.md`
- Restart VS Code or refresh your Codespace

### Agent Giving Unexpected Results

- Review the instructions for clarity
- Check for conflicting guidance
- Ensure constraints are specific enough
- Test with simpler prompts first

### Multiple Agents Overlap

- Make each agent's scope distinct
- Use clear naming conventions
- Document which agent to use for what task
- Consider consolidating if there's too much overlap

## Resources

### Official Documentation

- [Custom Agents - GitHub Docs](https://docs.github.com/en/copilot/tutorials/customization-library/custom-agents)
- [About Copilot Agents](https://docs.github.com/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/about-copilot-agents)
- [Adding Repository Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
- [Copilot Chat Cookbook](https://docs.github.com/en/copilot/example-prompts-for-github-copilot-chat)

### Blog Posts and Announcements

- [Custom Agents for GitHub Copilot Changelog](https://github.blog/changelog/2025-10-28-custom-agents-for-github-copilot/)
- [Your Stack, Your Rules: Introducing Custom Agents](https://github.blog/news-insights/product-news/your-stack-your-rules-introducing-custom-agents-in-github-copilot-for-observability-iac-and-security/)

### Community Resources

- [awesome-copilot](https://github.com/github/awesome-copilot) - Community examples and templates
- [GitHub Community Discussions](https://github.com/orgs/community/discussions/categories/copilot) - Ask questions and share feedback

## Next Steps

1. **Create your first agent**: Start with something simple like a documentation specialist
2. **Test it out**: Use the agent for real tasks and gather feedback
3. **Iterate**: Refine the instructions based on results
4. **Share with your team**: Let others know about available agents
5. **Expand**: Create more specialized agents as needs arise

---

**Pro Tip**: Start with agents that solve your team's most repetitive tasks. Documentation, testing, and code review agents often provide immediate value!
