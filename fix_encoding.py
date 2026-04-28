import glob

# Map of corrupted sequences to correct Unicode codepoints
replacements = {
    '\u00e2\u0086\u0092': '\u2192',  # â†' -> →
    '\u00e2\u0086\u0090': '\u2190',  # â← -> ←
    '\u00c3\u00b0\u00c5\u00b8\u008e\u00a5': '\U0001f3a5',  # ðŸŽ¥ -> 🎥
    '\u00c3\u00b0\u00c5\u00b8\u00a5': '\U0001f3e5',  # ðŸ¥ -> 🏥
    '\u00c3\u00a2\u20ac\u009a\u00c2\u00b9': '\u20b9',  # â‚¹ -> ₹
    '\u00e2\u0082\u00b9': '\u20b9',  # â‚¹ -> ₹ (alt)
    '\u00e2\u0080\u00a2': '\u2022',  # â€¢ -> •
    '\u00c2\u00b7': '\u00b7',        # Â· -> ·
    '\u00e2\u0080\u0094': '\u2014',  # â€" -> —
    '\u00e2\u0080\u00a6': '\u2026',  # â€¦ -> …
    '\u00e2\u0094\u0080': '\u2500',  # â"€ -> ─
}

files = glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.js', recursive=True)
fixed = 0
for path in files:
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    new_content = content

    # Direct string replacements for the visible corrupted text
    direct = [
        ('Continue \xe2\x86\x92', 'Continue \u2192'),  
    ]

    # The simplest approach: re-encode as latin-1 then decode as utf-8
    # Find lines containing the garbled sequences and fix them
    lines = new_content.split('\n')
    new_lines = []
    changed = False
    for line in lines:
        new_line = line
        # Try to fix by re-interpreting latin1 as utf-8
        try:
            fixed_line = line.encode('latin-1').decode('utf-8')
            if fixed_line != line:
                new_line = fixed_line
                changed = True
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass
        new_lines.append(new_line)

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print('Fixed:', path)
        fixed += 1

print(f'Total files fixed: {fixed}')
