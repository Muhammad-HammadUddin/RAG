import express from "express";
import { z } from "zod";
import {
    SystemMessage,
    HumanMessage,
    ToolMessage,
} from "@langchain/core/messages";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/errorhandler.js";
import { agentRateLimiter } from "../middleware/ratelimiter.js";
import { createTools } from "./tools.js";

const router = express.Router();

const MAX_AGENT_STEPS = 5;

// ====================== LLM ======================

const llm = new ChatGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0.7,
});

const SYSTEM_PROMPT = `You are an intelligent company assistant.

Use tools when required. Do not guess data — always use a tool to get database
or document information.

Rules:
- PDF / document / policy questions -> search_knowledge_base
- Employee questions -> search_employees
- Company questions -> search_companies
- Department questions -> search_departments`;

// ====================== Memory ======================
// One InMemoryChatMessageHistory per sessionId. Swap this Map for Redis/DB
// backed storage later if you need memory to survive a server restart.

const sessionMemories = new Map();

function getMemory(sessionId) {
    if (!sessionMemories.has(sessionId)) {
        sessionMemories.set(sessionId, new InMemoryChatMessageHistory());
    }
    return sessionMemories.get(sessionId);
}

// ====================== Agent loop ======================

async function runAgent(userInput, sessionId) {
    const memory = getMemory(sessionId);
    const history = await memory.getMessages();

    const tools = createTools(global.vectorStore);
    const llmWithTools = llm.bindTools(tools);

    const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...history,
        new HumanMessage(userInput),
    ];

    const usedTools = [];

    for (let step = 0; step < MAX_AGENT_STEPS; step++) {
        const aiMsg = await llmWithTools.invoke(messages);
        messages.push(aiMsg);

        // No tool calls -> model gave a final answer, we're done.
        if (!aiMsg.tool_calls || aiMsg.tool_calls.length === 0) {
            await memory.addUserMessage(userInput);
            await memory.addAIMessage(aiMsg.content);
            return { answer: aiMsg.content, usedTools };
        }

        for (const toolCall of aiMsg.tool_calls) {
            const selectedTool = tools.find((t) => t.name === toolCall.name);
            usedTools.push(toolCall.name);

            let result;
            try {
                if (!selectedTool) {
                    throw new Error(`Unknown tool: ${toolCall.name}`);
                }
                result = await selectedTool.invoke(toolCall.args);
            } catch (error) {
                result = `Tool error: ${error.message}`;
            }

            messages.push(
                new ToolMessage({
                    content:
                        typeof result === "string" ? result : JSON.stringify(result),
                    tool_call_id: toolCall.id,
                })
            );
        }
    }

    // Exceeded MAX_AGENT_STEPS without a final answer.
    await memory.addUserMessage(userInput);
    await memory.addAIMessage("Unable to solve request.");

    return { answer: "Unable to solve request.", usedTools };
}



const agentRequestSchema = z.object({
    message: z.string().min(1, "message is required").max(2000),
    sessionId: z.string().min(1, "sessionId is required"),
});

router.post(
    "/",
    agentRateLimiter,
    asyncHandler(async (req, res) => {
        const parsed = agentRequestSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request",
                details: parsed.error.flatten(),
            });
        }

        const { message, sessionId } = parsed.data;
        const result = await runAgent(message, sessionId);

        return res.json(result);
    })
);

export default router;
export { runAgent };