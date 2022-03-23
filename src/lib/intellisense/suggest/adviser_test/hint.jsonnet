local Hint(text, prefix='', suffix='') = {
    text: text,
    prefix: prefix,
    suffix: suffix,
    filters: [],
};

[
    Hint('sum'),
    Hint('{sales'),
    Hint('{sales}'),
    Hint('{Cost of', '{row1}'),
    Hint('.l', '{Cost of Sales}', '+{row}'),
    Hint('.', '{Cost of Sales}'),
]
