typedef unsigned char uuid_t[16];

void uuid_generate(uuid_t out);
int uuid_parse(const char *input, uuid_t out);
