/* Original small WebAssembly lexical similarity helper. No external runtime, no model weights. */
#include <stdint.h>
__attribute__((export_name("overlap_score")))
int overlap_score(uint32_t q0, uint32_t q1, uint32_t q2, uint32_t q3,
                  uint32_t d0, uint32_t d1, uint32_t d2, uint32_t d3) {
  int matched = __builtin_popcount(q0 & d0) + __builtin_popcount(q1 & d1)
             + __builtin_popcount(q2 & d2) + __builtin_popcount(q3 & d3);
  int corpus = __builtin_popcount(d0) + __builtin_popcount(d1)
             + __builtin_popcount(d2) + __builtin_popcount(d3);
  return matched * 1000 / (corpus + 6);
}
__attribute__((export_name("wasm_version"))) int wasm_version(void) { return 1; }
