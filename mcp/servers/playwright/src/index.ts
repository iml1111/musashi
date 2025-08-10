#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium } from 'playwright';
import { z } from 'zod';

const server = new Server({
  name: 'musashi-playwright-mcp',
  version: '1.0.0',
});

let browser: any = null;
let page: any = null;

// Schema definitions
const NavigateSchema = z.object({
  url: z.string().url(),
});

const ClickSchema = z.object({
  selector: z.string(),
});

const TypeSchema = z.object({
  selector: z.string(),
  text: z.string(),
});

const ScreenshotSchema = z.object({
  path: z.string().optional(),
  fullPage: z.boolean().optional().default(false),
});

const WaitForSelectorSchema = z.object({
  selector: z.string(),
  timeout: z.number().optional().default(30000),
});

// Initialize browser
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    });
  }
  if (!page) {
    page = await browser.newPage();
  }
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'navigate',
        description: 'Navigate to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              format: 'uri',
              description: 'URL to navigate to',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'click',
        description: 'Click on an element',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the element to click',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'type',
        description: 'Type text into an input field',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the input field',
            },
            text: {
              type: 'string',
              description: 'Text to type',
            },
          },
          required: ['selector', 'text'],
        },
      },
      {
        name: 'screenshot',
        description: 'Take a screenshot of the current page',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to save the screenshot',
            },
            fullPage: {
              type: 'boolean',
              description: 'Take a full page screenshot',
              default: false,
            },
          },
        },
      },
      {
        name: 'wait_for_selector',
        description: 'Wait for an element to appear',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector to wait for',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds',
              default: 30000,
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'get_page_content',
        description: 'Get the HTML content of the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'evaluate',
        description: 'Execute JavaScript on the page',
        inputSchema: {
          type: 'object',
          properties: {
            script: {
              type: 'string',
              description: 'JavaScript code to execute',
            },
          },
          required: ['script'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    await initBrowser();

    switch (name) {
      case 'navigate': {
        const { url } = NavigateSchema.parse(args);
        await page!.goto(url);
        return {
          content: [
            {
              type: 'text',
              text: `Navigated to ${url}`,
            },
          ],
        };
      }

      case 'click': {
        const { selector } = ClickSchema.parse(args);
        await page!.click(selector);
        return {
          content: [
            {
              type: 'text',
              text: `Clicked on element: ${selector}`,
            },
          ],
        };
      }

      case 'type': {
        const { selector, text } = TypeSchema.parse(args);
        await page!.fill(selector, text);
        return {
          content: [
            {
              type: 'text',
              text: `Typed "${text}" into ${selector}`,
            },
          ],
        };
      }

      case 'screenshot': {
        const { path, fullPage } = ScreenshotSchema.parse(args);
        const screenshotPath = path || `/tmp/screenshot-${Date.now()}.png`;
        await page!.screenshot({ path: screenshotPath, fullPage });
        return {
          content: [
            {
              type: 'text',
              text: `Screenshot saved to ${screenshotPath}`,
            },
          ],
        };
      }

      case 'wait_for_selector': {
        const { selector, timeout } = WaitForSelectorSchema.parse(args);
        await page!.waitForSelector(selector, { timeout });
        return {
          content: [
            {
              type: 'text',
              text: `Element ${selector} appeared`,
            },
          ],
        };
      }

      case 'get_page_content': {
        const content = await page!.content();
        return {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        };
      }

      case 'evaluate': {
        const { script } = z.object({ script: z.string() }).parse(args);
        const result = await page!.evaluate(script);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Cleanup on exit
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});