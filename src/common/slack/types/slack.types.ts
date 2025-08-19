// slack.service.ts (o un nuevo archivo de tipos)

// 💡 TIPOS MEJORADOS PARA SLACK BLOCK KIT

// Define los objetos de texto que Slack puede usar
interface PlainTextElement {
  type: 'plain_text';
  text: string;
  emoji?: boolean;
}

interface MrkdwnElement {
  type: 'mrkdwn';
  text: string;
}

type TextElement = PlainTextElement | MrkdwnElement;

// Define cada tipo de bloque que usarás
interface HeaderBlock {
  type: 'header';
  text: PlainTextElement;
}

interface SectionBlock {
  type: 'section';
  text?: TextElement;
  fields?: MrkdwnElement[]; // ✅ Aquí está la propiedad 'fields' que faltaba
}

interface DividerBlock {
  type: 'divider';
}

// Crea una unión de todos los tipos de bloques posibles
export type SlackBlock = HeaderBlock | SectionBlock | DividerBlock;

// La interfaz para el payload principal que se envía a la API
export interface SlackMessagePayload {
  blocks: SlackBlock[];
  text?: string; // Texto de fallback para notificaciones
}
