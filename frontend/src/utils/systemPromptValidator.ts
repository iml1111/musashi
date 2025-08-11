import { PromptContext } from '../types/node'

export interface SystemPromptValidationResult {
  isValid: boolean
  warnings: string[]
  unusedInputs: string[]
  invalidTokens: string[]
}

/**
 * Extracts tokens in the format $$TOKEN$$ from a system prompt
 */
export function extractTokensFromPrompt(prompt: string): string[] {
  const tokenPattern = /\$\$([A-Za-z_][A-Za-z0-9_]*)\$\$/g
  const tokens: string[] = []
  let match
  
  while ((match = tokenPattern.exec(prompt)) !== null) {
    tokens.push(match[1])
  }
  
  return [...new Set(tokens)] // Remove duplicates
}

/**
 * Validates system prompt against available inputs
 */
export function validateSystemPrompt(
  prompt: string,
  inputs: Array<{ key: string; type: string }>,
  prompts?: PromptContext[]
): SystemPromptValidationResult {
  const result: SystemPromptValidationResult = {
    isValid: true,
    warnings: [],
    unusedInputs: [],
    invalidTokens: []
  }
  
  if (!prompt || !inputs || inputs.length === 0) {
    return result
  }
  
  // Extract tokens from the developer message
  const tokensInPrompt = extractTokensFromPrompt(prompt)
  
  // Extract tokens from prompt contexts if provided
  const tokensInPromptContext = prompts ? 
    prompts.flatMap(p => extractTokensFromPrompt(p.content)) : []
  
  // Combine all tokens from both developer message and prompt contexts
  const allTokensUsed = [...new Set([...tokensInPrompt, ...tokensInPromptContext])]
  
  // Get all input keys
  const inputKeys = inputs.map(input => input.key)
  
  // Find invalid tokens (tokens that don't match any input)
  const invalidTokens = allTokensUsed.filter(token => !inputKeys.includes(token))
  if (invalidTokens.length > 0) {
    result.isValid = false
    result.invalidTokens = invalidTokens
    result.warnings.push(`Unknown tokens: ${invalidTokens.map(t => `$$${t}$$`).join(', ')}`)
  }
  
  // Find unused inputs (inputs that aren't referenced in either developer message or prompt contexts)
  const unusedInputs = inputKeys.filter(key => !allTokensUsed.includes(key))
  if (unusedInputs.length > 0) {
    result.isValid = false
    result.unusedInputs = unusedInputs
    result.warnings.push(`Unused inputs: ${unusedInputs.join(', ')}`)
  }
  
  return result
}

/**
 * Formats a system prompt validation warning message
 */
export function formatValidationWarning(validation: SystemPromptValidationResult): string {
  const messages: string[] = []
  
  if (validation.invalidTokens.length > 0) {
    messages.push(`Unknown tokens: ${validation.invalidTokens.map(t => `$$${t}$$`).join(', ')}`)
  }
  
  if (validation.unusedInputs.length > 0) {
    messages.push(`Unused inputs: ${validation.unusedInputs.join(', ')}`)
  }
  
  return messages.join(' • ')
}