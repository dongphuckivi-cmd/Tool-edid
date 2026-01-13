
import { GoogleGenAI, Type } from "@google/genai";
import { FashionItem } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const detectFashionItems = async (base64Image: string) => {
  const ai = getAI();
  const prompt = `
    VAI TRÒ: Chuyên gia phân tích cấu trúc thời trang (Garment Construction Expert).
    NHIỆM VỤ: Xác định chính xác các thành phần trang phục chính và các chi tiết cấu tạo.
    
    1. DANH MỤC CHÍNH (category: 'main'): 
       - Áo sơ mi, Áo thun, Hoodie, Blazer, Quần, Váy, Giày, Túi.
    
    2. CHI TIẾT CẤU TẠO (category: 'detail'): 
       - Bo cổ (Collar/Ribbed Neckline)
       - Bo tay áo (Cuffs/Ribbed Cuffs)
       - Bo gấu áo/lưng quần (Waistband/Hem)
       - Túi (Pockets/Welt Pockets)
       - Cầu vai (Epaulettes), Nẹp áo (Placket), Viền tay áo.

    YÊU CẦU:
    - Phân tích cực kỳ chi tiết các vùng có chất liệu hoặc đường may tách biệt.
    - Cung cấp nhãn TIẾNG VIỆT chuẩn ngành may.
    - Trả về mảng JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['main', 'detail'] },
              confidence: { type: Type.NUMBER },
              box: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "[ymin, xmin, ymax, xmax]"
              }
            },
            required: ["name", "category", "confidence", "box"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Không có phản hồi từ AI");
    
    const rawItems = JSON.parse(text);
    return rawItems.map((item: any, index: number) => ({
      id: `item-${index}-${Date.now()}`,
      name: item.name,
      category: item.category as any,
      confidence: item.confidence,
      box: {
        ymin: item.box[0],
        xmin: item.box[1],
        ymax: item.box[2],
        xmax: item.box[3]
      },
      color: '#ffffff',
      pattern: 'none',
      settings: { saturation: 100, brightness: 100, contrast: 100 },
      isVisible: true
    }));
  } catch (error) {
    console.error("Lỗi nhận diện:", error);
    throw error;
  }
};

export const recolorItemsWithAI = async (
  originalImage: string,
  selectedItems: FashionItem[]
) => {
  const ai = getAI();
  
  const itemsDescription = selectedItems.map(item => 
    `- [${item.category.toUpperCase()}] ${item.name}
     - Vùng: [ymin:${item.box.ymin}, xmin:${item.box.xmin}, ymax:${item.box.ymax}, xmax:${item.box.xmax}]
     - Màu vải nền mới: ${item.color}
     - Họa tiết nền: ${item.pattern === 'ribbed' ? 'VẢI BO GÂN (Ribbed)' : item.pattern}`
  ).join('\n');

  const prompt = `
    VAI TRÒ: Nghệ sĩ Retouch chuyên nghiệp cho thương hiệu thời trang cao cấp.
    NHIỆM VỤ: Đổi màu vải nền nhưng BẢO VỆ TUYỆT ĐỐI các chi tiết đồ họa trên bề mặt:
    ${itemsDescription}

    QUY TẮC BẢO TỒN CHI TIẾT (LAYER PROTECTION RULES):
    1. LAYER TÁCH BIỆT: Hãy coi LOGO, HÌNH IN, CHỮ VIẾT, và HỌA TIẾT THÊU là một lớp (layer) nằm TRÊN vải. Bạn KHÔNG ĐƯỢC phép thay đổi màu sắc, độ bão hòa hay độ sắc nét của lớp này. 
    2. CHỈ NHUỘM VẢI NỀN: Chỉ thay đổi màu sắc của phần diện tích vải "trống" (base fabric). Màu mới phải len lỏi dưới các sợi chỉ thêu hoặc bao quanh các hình in một cách tự nhiên.
    3. GIỮ NGUYÊN PHỤ KIỆN: Tuyệt đối không làm biến đổi màu sắc của: Cúc áo, khóa kéo, đinh tán, dây thắt, và các nhãn hiệu may rời.
    4. XỬ LÝ ĐỔ BÓNG: Giữ lại toàn bộ bóng đổ (shadows) và vùng bắt sáng (highlights) gốc trên vải để đảm bảo khối 3D của trang phục không bị bẹt.
    5. KHÔNG LÀM MỜ: Kết quả đầu ra phải sắc nét như ảnh gốc. Không được áp dụng hiệu ứng làm mờ (blur) ở các vùng biên giới giữa hình in và vải nền.

    LƯU Ý QUAN TRỌNG: Nếu một hình in có màu trắng, nó phải giữ nguyên màu trắng, không được bị ám màu theo màu vải mới.

    Trả về DUY NHẤT dữ liệu hình ảnh (inlineData).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: originalImage.split(',')[1] } },
          { text: prompt }
        ]
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("Lỗi render hình ảnh từ AI.");
  } catch (error) {
    console.error("Lỗi AI:", error);
    throw error;
  }
};
