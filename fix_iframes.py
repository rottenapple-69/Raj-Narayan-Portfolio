import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(
    r'<iframe src="(https://www\.youtube\.com/embed/[^"]+)" title="YouTube video player" allowfullscreen></iframe>',
    r'<iframe src="\1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    text
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
