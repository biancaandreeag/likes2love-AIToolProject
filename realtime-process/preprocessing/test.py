import re

def reduce_repeated_chars(text):
    # Înlocuiește secvențele de caractere repetate la 3 sau mai multe apariții
    return re.sub(r"(.)\1{2,}", r"\1\1", text)

# Exemplu:
text = "ajajajajajajajajajajahahahahahajahajaja"
reduced_text = reduce_repeated_chars(text)
print(reduced_text)  # Va reduce secvențele repetate la "ajajaj"
