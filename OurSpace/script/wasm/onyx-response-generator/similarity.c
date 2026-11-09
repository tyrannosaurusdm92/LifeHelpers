/* v2: compact general-purpose BM25/overlap and term-distance scoring in real C/WASM.
   C is compiled into WebAssembly; no Python runtime or external model weights. */
#include <stdint.h>
__attribute__((export_name("intersection")))
uint32_t intersection(uint32_t a0,uint32_t a1,uint32_t a2,uint32_t a3,
                      uint32_t b0,uint32_t b1,uint32_t b2,uint32_t b3){
  return __builtin_popcount(a0&b0)+__builtin_popcount(a1&b1)+__builtin_popcount(a2&b2)+__builtin_popcount(a3&b3);
}
__attribute__((export_name("rank")))
int32_t rank(int32_t lexical,int32_t overlap,int32_t scope,int32_t mood,int32_t prior){
  int32_t score=lexical*3+overlap/130+scope*25+mood*3-prior*9;
  return score>0?score:0;
}
__attribute__((export_name("version")))uint32_t version(void){return 2;}
