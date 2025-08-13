# I18n Translation Plan - Korean to English

## Summary
Found **1,495 Korean strings** across the repository that need translation.

## File Type Distribution
- **Markdown files (.md)**: 855 strings - Documentation and README files
- **Shell scripts (.sh)**: 279 strings - Build and deployment scripts  
- **HTML files (.html)**: 99 strings - Template and static HTML
- **TypeScript React (.tsx)**: 66 strings - Frontend components
- **YAML files (.yml)**: 43 strings - Configuration files
- **Environment files (.env, .example)**: 84 strings - Configuration examples
- **JavaScript/TypeScript (.js, .ts)**: 59 strings - Application code
- **Other files**: 10 strings - Logs and misc files

## Translation Strategy by File Type

### 1. Documentation Files (.md)
**Priority**: HIGH  
**Strategy**: Full translation with natural English, focusing on clarity over literal translation
- Technical documentation should use standard terminology
- README files should be developer-friendly
- Maintain formatting and code examples
- Keep URLs, emails, and code identifiers unchanged

### 2. Frontend Code (.tsx, .ts, .js)
**Priority**: HIGH  
**Strategy**: Translate user-facing strings only
- UI labels, buttons, messages
- Error messages and notifications
- Form labels and placeholders
- Keep variable names, function names, and API endpoints unchanged
- Preserve format placeholders ({name}, %s, etc.)

### 3. Shell Scripts (.sh)
**Priority**: MEDIUM  
**Strategy**: Translate comments and echo messages
- Keep command syntax unchanged
- Translate user-facing output messages
- Maintain script functionality

### 4. Configuration Files (.yml, .env)
**Priority**: LOW  
**Strategy**: Translate comments only
- Keep configuration keys and values unchanged
- Translate descriptive comments for better understanding

### 5. HTML Templates
**Priority**: HIGH  
**Strategy**: Translate all visible text content
- Page titles, headings, paragraphs
- Button text and form labels
- Keep HTML structure and attributes unchanged

## Translation Rules

### General Rules
1. **Preserve Technical Terms**: Keep programming terms, frameworks, and tools in English
2. **Maintain Placeholders**: Keep format strings like {variable}, %s, ${var} unchanged
3. **Keep Identifiers**: Don't translate variable names, function names, class names, or API paths
4. **URLs and Emails**: Keep all URLs and email addresses unchanged
5. **License Text**: Keep standard license headers unchanged

### Code-Specific Rules
1. **Comments**: Translate to clear, concise English
2. **Console Messages**: Translate log messages but keep log levels (INFO, ERROR, etc.)
3. **Error Messages**: Translate to helpful English messages
4. **Test Data**: Skip test snapshots and mock data

### Documentation Rules
1. **Natural Language**: Use idiomatic English, not word-for-word translation
2. **Technical Writing**: Follow standard technical documentation style
3. **Examples**: Keep code examples but translate surrounding explanations
4. **Headers**: Use standard English section headers

## Implementation Steps

1. **Phase 1 - Documentation**: Translate all .md files for better international accessibility
2. **Phase 2 - Frontend**: Translate user-facing strings in React components
3. **Phase 3 - Backend**: Translate error messages and logs
4. **Phase 4 - Scripts**: Translate shell script comments and messages
5. **Phase 5 - Configuration**: Translate configuration file comments

## Quality Assurance

1. **Consistency Check**: Use translation map to ensure same Korean phrase always translates to same English
2. **Context Preservation**: Ensure translations make sense in their context
3. **Functionality Test**: Verify no code functionality is broken
4. **UI/UX Review**: Check that translated text fits properly in UI components

## Exclusions

- Binary files
- Third-party libraries (node_modules, vendor)
- Build artifacts (dist, build, coverage)
- Cache files
- Test snapshots (will update separately if needed)
- Git metadata (.git)

## Success Criteria

- Zero Korean strings remaining in non-excluded files
- All tests passing
- Application builds successfully
- UI displays correctly with English text
- Documentation is clear and readable in English