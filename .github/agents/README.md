# Custom Agents for GitHub Copilot

This directory contains custom agents that extend GitHub Copilot for this repository. These agents act as specialized AI teammates that can help with specific tasks.

## Available Agents

### readme-specialist
**Purpose**: Expert at creating and maintaining high-quality README documentation

Use this agent when you need to:
- Create a new README file
- Update existing documentation
- Ensure documentation follows best practices
- Add examples and usage instructions

**Example usage**:
```
@readme-specialist Create a comprehensive README for the server module
```

### test-specialist
**Purpose**: Expert at creating comprehensive unit and integration tests

Use this agent when you need to:
- Write new test cases
- Improve test coverage
- Create mocks for database calls
- Follow testing best practices

**Example usage**:
```
@test-specialist Create tests for the dogs route with full coverage
```

## How to Use Custom Agents

### In VS Code / Codespaces

1. Open GitHub Copilot Chat
2. Type `@` to see available agents
3. Select the agent you want to use
4. Describe your task in natural language
5. Review and apply the suggestions

### In GitHub Copilot CLI

```bash
# List available agents
gh copilot --list-agents

# Use a specific agent
gh copilot --agent test-specialist "Create tests for user authentication"
```

### On GitHub.com

1. Navigate to the repository
2. Open Copilot Chat
3. Select your custom agent from the dropdown
4. Describe what you need

## Creating New Agents

Want to create your own custom agent? Check out our [comprehensive guide](../../content/creating-custom-agents.md) for step-by-step instructions and best practices.

## Learn More

- [Creating Custom Agents Guide](../../content/creating-custom-agents.md) - Full guide on creating custom agents
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Custom Agents Documentation](https://docs.github.com/en/copilot/tutorials/customization-library/custom-agents)
