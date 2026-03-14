import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
let cachedKnowledge: string | null = null;

function getKnowledge(): string {
  if (cachedKnowledge) return cachedKnowledge;
  try {
    const filePath = path.join(process.cwd(), "knowledge.txt");
    cachedKnowledge = fs.readFileSync(filePath, "utf-8");
    return cachedKnowledge;
  } catch {
    return "";
  }
}

export async function getAIResponse(prompt: string): Promise<string> {
  const knowledge = getKnowledge();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const systemPrompt = `Bạn là hướng dẫn viên Ninh Bình thân thiện.

KIẾN THỨC:
${knowledge}

QUY TẮC:
- Trả lời ngắn gọn (3-4 câu)
- Thêm emoji phù hợp
- Tập trung thông tin thực tế

YÊU CẦU: ${prompt}`;

  const result = await model.generateContent(systemPrompt);
  return result.response.text();
}

const offlineResponses: Record<string, string> = {
  'trang-an': '🛶 Tràng An là Di sản UNESCO kép. Đi thuyền 2-3 tiếng qua 12 hang động tuyệt đẹp. Giá vé 250k/người.',
  'hang-mua': '🏔️ Hang Múa có 486 bậc đá. Leo 20-30 phút để ngắm view Tam Cốc từ đỉnh. Nhớ mang giày thể thao!',
  'bai-dinh': '🛕 Chùa Bái Đính lớn nhất Đông Nam Á (700ha). Có tượng Phật Di Lặc 100 tấn. Nên đi xe điện.',
  'tam-coc': '🌾 Tam Cốc có 3 hang động đẹp. Đi thuyền 2 tiếng trên sông Ngô Đồng. Đẹp nhất tháng 5-6 lúa vàng.',
  'hoa-lu': '⛩️ Cố đô Hoa Lư - kinh đô đầu tiên của Việt Nam (968-1010). Có đền thờ Vua Đinh và Vua Lê.',
  'thien-ha': '✨ Động Thiên Hà có thạch nhũ lấp lánh như ngân hà. Bên trong có sông ngầm rất đẹp.',
  'sen': '🪷 Cánh đồng sen đẹp nhất tháng 5-7. Nên chụp ảnh lúc sáng sớm hoặc chiều muộn.',
  'default': '📍 Chào mừng đến Ninh Bình! Đây là vùng đất cố đô với nhiều danh thắng tuyệt đẹp.',
};

export function getOfflineResponse(locationId: string): string {
  const id = locationId.toLowerCase().replace(/\s+/g, '-');
  return offlineResponses[id] || offlineResponses['default'];
}
