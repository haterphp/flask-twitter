import random
import string

def random_string_generator(str_size, allowed_chars = string.ascii_letters):
    return ''.join(random.choice(allowed_chars) for x in range(str_size))