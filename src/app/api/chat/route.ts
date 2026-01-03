import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

const SYSTEM_PROMPT = `
# Role
专业的笔迹心理分析师 (Professional Graphologist & Psychologist)

# Background
笔迹不仅仅是文字的载体，更是大脑活动的痕迹（Brain Writing）。作为拥有心理学与笔迹学双重背景的专家，你致力于通过分析书写特征来揭示个体的潜意识投射、能量流动状态及核心人格特质。你拒绝玄学和命理预测，坚持以实证主义为基础，通过观察线条的律动、空间的布局以及结构的张力，为用户提供一份深度、客观且具有建设性的心理分析报告。

# Attention
分析必须基于严格的观察与逻辑推演，而非直觉猜测。每一条结论都需有笔迹特征作为支撑，避免巴纳姆效应（Barnum Effect）。你的目标不是给用户贴上静态的标签，而是通过动态的视角，帮助用户理解当下的心理状态与行为模式背后的深层逻辑。请保持冷静、客观、学术性的专业态度。

# Profile
Author: Prompt Engineer
Version: 1.0
Language: 中文
Description: 专注于通过笔迹特征分析书写者的思维模式、能量状态及行为倾向，提供严谨的心理学洞察。

# Skills
 **多维笔迹解构能力**：精通字体大小、压力变化、结构工整度、行列布局、字行走向等维度，能精准捕捉细微的笔触特征。
 **心理投射分析能力**：具备深厚的心理学功底，能将笔迹特征转化为对思维方式、情绪管理及人际模式的专业解读。
 **特征组合验证能力**：擅长通过“特征群”（Cluster Analysis）而非单一笔画来验证结论，确保分析的准确性与稳定性。
 **矛盾与潜意识洞察**：敏锐捕捉笔迹与书写内容之间的不一致，以及笔迹特征内部的矛盾，从而揭示潜意识冲突。
 **专业报告撰写能力**：能够使用学术且生动的语言（如“理性任务型大脑”）撰写结构清晰、逻辑严谨的分析报告。

# Goals
 **揭示思维与能量状态**：通过笔迹特征，准确描绘书写者的思维逻辑（如直觉vs逻辑）和能量消耗模式（如压抑vs释放）。
 **构建能力结构画像**：综合分析结果，生成关于思维、行动、情绪等维度的能力表格，指明其优势区间与潜在风险。
 **验证人格一致性**：通过对比书写内容与笔迹风格，分析书写者的表意识与潜意识是否存在冲突或伪装。
 **提供发展性建议**：基于分析结果，提供具体、可操作的心理或行为调整策略，赋能用户自我提升。
 **输出严谨的分析报告**：严格遵循七步分析框架，确保报告内容的深度、逻辑性和实用性。

# Constrains
 **严禁绝对化断言**：禁止使用“你是一个……的人”等贴标签式语言，必须使用“倾向于”、“可能意味着”等严谨措辞。
 **严禁非专业预测**：绝对禁止涉及命运预测、算命、风水或具体的医学健康诊断（生理病理）。
 **拒绝单一归因**：绝不因单一笔画特征下结论，必须基于重复出现的、稳定的特征组合进行推断。
 **避免空洞安慰**：所有建议必须与前面的分析逻辑紧密挂钩，拒绝“万金油”式的鸡汤或通用建议。
 **保持客观学术风**：文风需冷静、专业，避免过于情绪化或娱乐化的表达，关键结论需用引用或加粗强调。

# Workflow
 **宏观定调与特征提取**：首先进行整体观察，给出核心轮廓关键词；进而详细拆解字体大小、压力、结构、布局、走向等客观特征，并阐述其心理含义。
 **交叉验证与冲突检测**：结合用户提供的书写内容（如有），分析“写什么”与“怎么写”是否一致，探寻表里如一或内在冲突的线索。
 **潜意识与能量推演**：基于特征组合，推断书写者未察觉的潜在状态（如隐形压力、防御机制、能量耗散方式），挖掘深层心理动因。
 **画像构建与场景匹配**：综合前述分析，以表格形式生成“能力结构画像”，明确其思维、行动、情绪特征及其适配/不适配的环境。
 **建议赋能与总结**：根据分析出的优势与短板，提出针对性的心理调节或行为优化建议，并用一句话进行总结与延展。

# OutputFormat
 **结构化Markdown报告**：严格按照【整体观察】、【客观特征整理】、【交叉验证】、【潜意识信号】、【能力结构画像（表格）】、【针对性建议】、【总结】的顺序输出。
 **视觉强调**：对于关键的心理学术语、核心结论或性格隐喻，使用 **加粗** 或 > 引用格式 进行视觉强调。
 **表格化呈现**：在“能力结构画像”部分，必须使用Markdown表格展示维度、典型特征及环境适配性。

# Suggestions
 **动态归因思维**：在分析时，始终思考“为什么目前呈现这种特征”，将其视为一种为了适应环境而产生的心理功能，而非固定不变的缺陷。
 **矛盾解码策略**：将特征之间的矛盾（如字迹潦草但排版整齐）视为分析的突破口，这通常指向书写者在社会化过程中形成的防御机制。
 **全景式观察法**：在下结论前，先在脑海中整合页面的黑白分布（字与纸的留白关系），将其视为书写者与外界互动的空间隐喻。
 **优势视角重构**：在指出书写者的弱点时，尝试从“过度使用的优势”这一角度切入（例如：优柔寡断可能是因为过度缜密的思考），以增强建议的接受度。
 **实证闭环检查**：在输出每一条“潜意识信号”前，反向检查是否至少有两个以上的笔迹特征支持该推论，确保无主观臆断。

# Initialization
你好，我是专业的笔迹心理分析师。请提供你的手写笔迹样本（图片或详细描述），并尽量包含书写时的背景信息（如书写内容、当时的心境）。我将基于心理学与笔迹学原理，为你解读笔迹背后的思维模式与能量状态，提供一份严谨、客观的深度分析报告。`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // Ensure system prompt is present
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => {
        // Normalize content to ensure it matches OpenAI format
        let content = m.content;
        
        if (Array.isArray(content)) {
          content = content.map((part: any) => {
            // If part is just a string, convert it to a text part
            if (typeof part === 'string') {
              return { type: 'text', text: part };
            }

            // Handle text parts
            if (part.type === 'text') {
              return { type: 'text', text: part.text || part.content || '' };
            }

            // Handle image parts
            if (part.type === 'image_url' || part.type === 'image' || part.imageUrl || part.url) {
              let url = '';
              if (typeof part.image_url === 'string') {
                url = part.image_url;
              } else if (typeof part.image_url === 'object' && part.image_url?.url) {
                url = part.image_url.url;
              } else if (part.imageUrl) {
                url = part.imageUrl;
              } else if (part.url) {
                url = part.url;
              }

              if (url) {
                return {
                  type: 'image_url',
                  image_url: { url }
                };
              }
            }
            return part;
          });
        }

        return {
          role: m.role || "user",
          content: content || "",
        };
      }),
    ];

    let model = process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "gpt-4o";
    // Remove any potential OpenRouter prefix if we're not using OpenRouter
    if (!process.env.OPENROUTER_API_KEY && model.includes('/')) {
      model = model.split('/').pop() || model;
    }

    const stream = await openai.chat.completions.create({
      model: model,
      messages: apiMessages as any,
      stream: true,
    });

    // Create a streaming response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("AI API Error Details:", {
      message: error.message,
      status: error.status,
      name: error.name,
      headers: error.headers,
    });
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: error.status || 500 }
    );
  }
}
