#include <stdio.h>
#include <stdint.h>
int main(void) {
    uint32_t hash = UINT32_C(2166136261);
    int c, n = 0;
    while ((c = getchar()) != EOF && c != '\n') {
        if (++n > 254) return 1;
        hash = (hash ^ (unsigned char)c) * UINT32_C(16777619);
    }
    if (!n) return 1;
    printf("%08x\n", hash);
    return 0;
}
