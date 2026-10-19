// GitHub Pages is static, so live NPC chat runs through the separately deployed
// Vercel function. This URL is public; the Groq key and playtest PIN stay server-side.
export const NPC_CHAT_API = 'https://repository-town-claude-playtest.vercel.app/api/npc-chat';
