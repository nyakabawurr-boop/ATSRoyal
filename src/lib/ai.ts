type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatResponse = {
  content: string;
};

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DEFAULT_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

export const hasAiKey = () => Boolean(process.env.OPENAI_API_KEY);

export const callChat = async (
  messages: ChatMessage[],
  temperature = 0.2
): Promise<ChatResponse | null> => {
  if (!process.env.OPENAI_API_KEY) return null;
  const response = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  return { content };
};
