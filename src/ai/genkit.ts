// Configuração condicional do Genkit para evitar problemas de build
let ai: any = null;

try {
  // Só importa o Genkit se as variáveis de ambiente estiverem configuradas
  if (process.env.GEMINI_API_KEY && process.env.NODE_ENV !== "production") {
    const { genkit } = require("genkit");
    const { googleAI } = require("@genkit-ai/googleai");

    ai = genkit({
      plugins: [
        googleAI({
          apiKey: process.env.GEMINI_API_KEY,
        }),
      ],
      model: "googleai/gemini-1.5-flash-latest",
    });
  }
} catch (error) {
  console.warn("Genkit não pôde ser inicializado:", error);
  // Fallback para desenvolvimento
  ai = {
    definePrompt: () => ({ text: "Genkit não disponível" }),
    defineFlow: () => async () => ({
      confirmationMessage: "Reserva confirmada!",
      emailSubject: "Confirmação de reserva",
      emailBody: "Sua reserva foi confirmada.",
    }),
  };
}

export { ai };
