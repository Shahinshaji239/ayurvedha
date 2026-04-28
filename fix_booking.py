import re

# Read and fix the Booking.jsx file
with open('src/pages/Booking.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix specific corrupted sequences
fixes = {
    '\u00f0\u0178\u017d\u00a5': '\U0001f3a5',  # ðŸŽ¥ -> 🎥
    '\u00f0\u0178\u00a5': '\U0001f3e5',         # ðŸ¥  -> 🏥
    '\u00e2\u0086\u0090': '\u2190',              # â← -> ←
    '\u00e2\u0086\u0092': '\u2192',              # â†' -> →
    '\u00e2\u0082\u00b9': '\u20b9',              # â‚¹ -> ₹
}

new_content = content
for bad, good in fixes.items():
    new_content = new_content.replace(bad, good)

if new_content != content:
    with open('src/pages/Booking.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Fixed Booking.jsx')
else:
    print('No changes needed')

# Now also add a fee guard - find the Pay button and add check
with open('src/pages/Booking.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check current state around the pay button
idx = content.find('Pay')
print('\nContext around Pay button:')
print(repr(content[idx-20:idx+80]))
