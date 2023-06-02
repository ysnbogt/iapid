<h1 align="center">iapid</h1>

## Installation

```zsh
$ npm install --global iapid
```

## Usage

```zsh
$ iapid <command> <subcommand>
```

### Commands

- `new`
- `delete`
- `generate`
- `list`
- `set`
- `show`
- `update`

### Subcommand

- `template`
- `project`

---

| Command  | Subcommand        | Project Only | Description                                                               |
| -------- | ----------------- | ------------ | ------------------------------------------------------------------------- |
| new      | project, template |              | Creates a new project or template.                                        |
| delete   | project, template |              | Deletes an existing project or template.                                  |
| list     | project, template |              | Lists all existing projects or templates.                                 |
| show     | project, template |              | Displays the details of an existing project or template.                  |
| update   | project, template |              | Updates the details of an existing project or template.                   |
| generate | -                 | ⚪︎           | Generates the API documentation based on the settings of a given project. |
| set      | -                 | ⚪︎           | Sets the current project or template as the target for future operations. |

## Examples

```zsh
$ iapid new project
$ iapid new template
$ iapid set
$ iapid generate --select --display
$ iapid update
```
