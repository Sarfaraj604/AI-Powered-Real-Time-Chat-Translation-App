export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
];

export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_TRANSLATION_PROVIDER = "mymemory";

const MYMEMORY_LANGUAGE_CODES = {
  zh: "zh-CN",
};

const LANGUAGE_SCRIPT_PATTERNS = [
  { code: "hi", pattern: /[\u0900-\u097F]/ },
  { code: "ja", pattern: /[\u3040-\u30FF]/ },
  { code: "ko", pattern: /[\uAC00-\uD7AF]/ },
  { code: "ar", pattern: /[\u0600-\u06FF]/ },
  { code: "ru", pattern: /[\u0400-\u04FF]/ },
  { code: "zh", pattern: /[\u4E00-\u9FFF]/ },
];

export const getLanguageByCode = (code = DEFAULT_LANGUAGE) =>
  SUPPORTED_LANGUAGES.find((language) => language.code === code) ||
  SUPPORTED_LANGUAGES.find((language) => language.code === DEFAULT_LANGUAGE);

const getProvider = () =>
  (process.env.TRANSLATION_PROVIDER || DEFAULT_TRANSLATION_PROVIDER).toLowerCase();

const getMyMemoryLanguageCode = (code) => MYMEMORY_LANGUAGE_CODES[code] || code;

const detectSourceLanguageCode = (text) => {
  const configuredSource = process.env.TRANSLATION_SOURCE_LANGUAGE;
  if (configuredSource && configuredSource !== "auto") {
    return getLanguageByCode(configuredSource).code;
  }

  return (
    LANGUAGE_SCRIPT_PATTERNS.find(({ pattern }) => pattern.test(text))?.code ||
    DEFAULT_LANGUAGE
  );
};

const extractOutputText = (data) => {
  if (data?.output_text) return data.output_text.trim();

  const outputText = data?.output
    ?.flatMap((item) => item.content || [])
    ?.find((content) => content.type === "output_text")?.text;

  return outputText?.trim() || "";
};

const translateWithOpenAI = async (text, targetLanguageCode, sourceLanguageCode) => {
  const sourceLanguage = getLanguageByCode(sourceLanguageCode);
  const targetLanguage = getLanguageByCode(targetLanguageCode);

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATION_MODEL || "gpt-4.1-mini",
      instructions:
        "You translate chat messages. Return only the translated message, preserving names, emojis, URLs, formatting, and the sender's tone. Do not explain.",
      input: `Translate this ${sourceLanguage.name} message to ${targetLanguage.name}.\n\nMessage:\n${text}`,
      max_output_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI translation failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return extractOutputText(data) || null;
};

const translateWithMyMemory = async (text, targetLanguageCode, sourceLanguageCode) => {
  const sourceLanguage = getMyMemoryLanguageCode(sourceLanguageCode);
  const targetLanguage = getMyMemoryLanguageCode(targetLanguageCode);
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLanguage}|${targetLanguage}`,
  });

  const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
  const data = await response.json();

  if (!response.ok || data?.responseStatus >= 400) {
    throw new Error(
      data?.responseDetails || `MyMemory translation failed: ${response.status}`
    );
  }

  return data?.responseData?.translatedText?.trim() || null;
};

export const translateText = async (text, targetLanguageCode) => {
  if (!text?.trim()) return null;

  try {
    const sourceLanguageCode = detectSourceLanguageCode(text);
    const targetLanguage = getLanguageByCode(targetLanguageCode);

    if (sourceLanguageCode === targetLanguage.code) {
      return text.trim();
    }

    if (getProvider() === "openai") {
      return await translateWithOpenAI(text, targetLanguage.code, sourceLanguageCode);
    }

    return await translateWithMyMemory(text, targetLanguage.code, sourceLanguageCode);
  } catch (error) {
    console.error("Translation error:", error.message);
    throw error;
  }
};
