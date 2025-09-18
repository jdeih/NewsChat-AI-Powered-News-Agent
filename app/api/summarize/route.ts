import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json()

    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    const prompt = `Please provide a concise 2-3 sentence summary of this news article. Focus on the key facts and main points.

Title: ${title}
Content: ${content}

Summary:`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxOutputTokens: 200,
      temperature: 0.3,
    })

    const summary = text || "Unable to generate summary"

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summarization error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
