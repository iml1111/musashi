import { ConnectedInput, PromptContext } from '../types/node'


/**
 * Get all used inputs from a text
 * @param text The text to search in
 * @returns Array of input keys that are used
 */
const getUsedInputsFromText = (text: string): string[] => {
  if (!text) return []
  const pattern = /\$\$([^$]+)\$\$/g
  const matches = text.match(pattern)
  if (!matches) return []
  
  // Extract input keys without $$ markers
  return matches.map(match => match.replace(/\$\$/g, ''))
}

/**
 * Check input usage across all relevant fields
 * @param inputs Connected inputs array
 * @param developerMessage Developer message / system prompt
 * @param prompts Array of prompt contexts
 * @returns Object with usage information
 */
export const checkInputUsage = (
  inputs: ConnectedInput[],
  developerMessage?: string,
  prompts?: PromptContext[]
): { used: string[], unused: string[], usageMap: Map<string, string[]> } => {
  const usageMap = new Map<string, string[]>()
  const allInputKeys = inputs.map(input => input.outputKey)
  
  // Check developer message
  if (developerMessage) {
    const usedInDeveloper = getUsedInputsFromText(developerMessage)
    usedInDeveloper.forEach(key => {
      if (!usageMap.has(key)) {
        usageMap.set(key, [])
      }
      usageMap.get(key)!.push('Developer Message')
    })
  }
  
  // Check prompt contexts
  if (prompts && prompts.length > 0) {
    prompts.forEach((prompt, index) => {
      const usedInPrompt = getUsedInputsFromText(prompt.content)
      usedInPrompt.forEach(key => {
        if (!usageMap.has(key)) {
          usageMap.set(key, [])
        }
        usageMap.get(key)!.push(`Prompt ${index + 1} (${prompt.type})`)
      })
    })
  }
  
  // Determine used and unused inputs
  const used = Array.from(usageMap.keys())
  const unused = allInputKeys.filter(key => !usageMap.has(key))
  
  return {
    used,
    unused,
    usageMap
  }
}

/**
 * Get only unused inputs
 * @param inputs Connected inputs array
 * @param developerMessage Developer message / system prompt
 * @param prompts Array of prompt contexts
 * @returns Array of unused input keys
 */
export const getUnusedInputs = (
  inputs: ConnectedInput[],
  developerMessage?: string,
  prompts?: PromptContext[]
): string[] => {
  const { unused } = checkInputUsage(inputs, developerMessage, prompts)
  return unused
}

/**
 * Check if all inputs are used
 * @param inputs Connected inputs array
 * @param developerMessage Developer message / system prompt
 * @param prompts Array of prompt contexts
 * @returns Boolean indicating if all inputs are used
 */
export const areAllInputsUsed = (
  inputs: ConnectedInput[],
  developerMessage?: string,
  prompts?: PromptContext[]
): boolean => {
  const { unused } = checkInputUsage(inputs, developerMessage, prompts)
  return unused.length === 0
}