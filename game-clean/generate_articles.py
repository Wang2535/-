import os
import glob

base_path = r'd:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\《大东话安全》系列原文'

# 获取所有以数字开头的txt文件
files = glob.glob(os.path.join(base_path, '*.txt'))

# 筛选出2-18号的文件
target_files = []
for f in files:
    basename = os.path.basename(f)
    num_str = ''
    for char in basename:
        if char.isdigit():
            num_str += char
        else:
            break
    if num_str:
        num = int(num_str)
        if 2 <= num <= 18:
            target_files.append((num, f))

target_files.sort()

# 生成常量定义
output = []
for num, filepath in target_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        # 转义反引号
        content = content.replace('`', '\\`')
        var_name = f'ARTICLE_{num}'
        output.append(f'const {var_name} = `{content}`;')
    except Exception as e:
        print(f'Error reading {filepath}: {e}')

# 写入临时文件
with open(r'd:\X学习\学习文件合集\中科院实习\工作五：桌游设计\额外尝试：trae基于kimi第七版的进一步完善\game-temp\articles_2_18.txt', 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(output))

print('成功生成常量定义')
print(f'共生成 {len(output)} 个常量')
