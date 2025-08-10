export const nodeDescriptions: Record<string, string> = {
  userinput: 'Captures user input like text or JSON and passes it to the next node.',
  agent: 'Takes input and creates output based on a prompt using AI.',
  agenttool: 'Built-in tools that AI agents can use to extend their capabilities.',
  vectorstore: 'Stores and retrieves data using vector embeddings. Supports MongoDB, Qdrant, and Pinecone for similarity-based document search.',
  knowledgebase: 'Searches structured data (like databases) using queries to find information.',
  mcp: 'Requests and returns information in a standard format that AI can understand.',
  apicall: 'Calls external APIs (REST/GraphQL) to get data or trigger remote actions.',
  router: 'Decides which path to take based on input values, scores, or rules.',
  finaloutput: 'Collects all results and returns them to the user or another system.',
}