from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from openai import OpenAI
import re

app = FastAPI()

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 DeepSeek 客户端
client = OpenAI(api_key="sk-Sf5EefxfATqabe0TX4Tus3aNMk9OcTEuZZ7HL9JIElEcSvf9", base_url="https://tbnx.plus7.plus/v1")

# 合同生成接口
@app.post("/generate_contract/")
async def generate_contract(text: str = Form(...)):
    contract_content = await generate_contract_by_ai(text)
    latex_code = render_latex(contract_content)
    tmp_dir = "tmp_files"
    os.makedirs(tmp_dir, exist_ok=True)
    short_id = uuid.uuid4().hex[:8]
    base_name = f"c_{short_id}"
    tex_file = os.path.join(tmp_dir, f"{base_name}.tex")
    pdf_file = os.path.join(tmp_dir, f"{base_name}.pdf")
    with open(tex_file, 'w', encoding='utf-8') as f:
        f.write(latex_code)
    os.system(f"xelatex -interaction=nonstopmode -output-directory={tmp_dir} {tex_file}")
    if os.path.exists(pdf_file):
        # 清理中间文件，保留 PDF 便于管理
        try:
            aux_path = os.path.join(tmp_dir, f"{base_name}.aux")
            log_path = os.path.join(tmp_dir, f"{base_name}.log")
            if os.path.exists(aux_path):
                os.remove(aux_path)
            if os.path.exists(log_path):
                os.remove(log_path)
            if os.path.exists(tex_file):
                os.remove(tex_file)
        except Exception:
            pass
        return FileResponse(pdf_file, filename="contract.pdf", media_type="application/pdf")
    else:
        return JSONResponse({"error": "PDF生成失败"}, status_code=500)

async def generate_contract_by_ai(user_text: str) -> str:
    prompt = [
        {
            "role": "system",
            "content": (
                "你是一个专业的合同LaTeX排版助手。请根据用户输入的合同要素，生成一份完整、规范、适合打印的合同LaTeX代码。要求如下："
                "1. 输出完整的、可直接用xelatex编译的LaTeX代码，包含文档类、必要的宏包、正文内容。"
                "2. 必须使用ctexart文档类，保证中文支持。"
                "3. 不要有语法错误，不要有未闭合的环境或命令。"
                "4. 不要输出多余的解释或注释，只输出LaTeX代码本身。"
                "5. 合同内容要素齐全、条款清晰，格式正式。"
            )
        },
        {"role": "user", "content": user_text},
    ]
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=prompt,
        stream=False
    )
    return response.choices[0].message.content.strip()

def latex_escape(text: str) -> str:
    """
    转义LaTeX特殊字符
    """
    replace_map = {
        '\\': r'\\textbackslash{}',
        '&': r'\\&',
        '%': r'\\%',
        '$': r'\\$',
        '#': r'\\#',
        '_': r'\\_',
        '{': r'\\{',
        '}': r'\\}',
        '~': r'\\textasciitilde{}',
        '^': r'\\textasciicircum{}',
    }
    for char, replacement in replace_map.items():
        text = text.replace(char, replacement)
    return text

def clean_latex_code(content: str) -> str:
    # 去除 markdown 代码块标记
    content = re.sub(r"^```(latex|tex)?", "", content.strip(), flags=re.IGNORECASE)
    content = re.sub(r"```$", "", content.strip(), flags=re.IGNORECASE)
    return content.strip()

def render_latex(content: str) -> str:
    return clean_latex_code(content) 