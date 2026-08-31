import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find header
header_match = re.search(r'(\s*{/\* Header Bar \*/}.*?</header>\n)', content, re.DOTALL)
header_str = header_match.group(1)

# Remove header from its current location
content = content.replace(header_str, '')

# Now find where to insert the new wrappers.
nav_end = r'</nav>'
aside_start = r'{/\* 2\. Media Gallery Drawer \*/}'

insertion = f"""</nav>

      <div className="flex-1 flex flex-col gap-6 h-[calc(100vh-40px)] z-10 overflow-hidden">
{header_str}
        <div className="flex-1 flex gap-6 overflow-hidden min-w-[1000px]">
          {{/* 2. Media Gallery Drawer */}}"""

content = re.sub(nav_end + r'\s*' + aside_start, insertion, content)

# Also update the height classes of the asides and main.
content = content.replace(
    'shrink-0 h-[calc(100vh-40px)] z-10">',
    'shrink-0 h-full">'
)

content = content.replace(
    '<main className="flex-1 flex flex-col h-[calc(100vh-40px)] z-10 overflow-hidden min-w-[600px]">',
    '<main className="flex-1 flex flex-col overflow-hidden min-w-[600px]">'
)

end_divs = r'    </div>\n  \);\n}'
new_end_divs = r'        </div>\n      </div>\n    </div>\n  );\n}'
content = re.sub(end_divs, new_end_divs, content)

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Layout rearranged successfully.")
