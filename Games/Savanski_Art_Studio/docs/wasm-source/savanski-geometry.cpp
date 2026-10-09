/* Savanski image-to-normal WASM C++ kernel (self-contained; no STL/dependencies).
 * Portable heightmap gradient calculations adapted into modern C++ instead
 * of bundling native Skia/Cairo/Qt/Python dependencies.
 */
#include <stdint.h>
constexpr int maxSide=2048;
static uint8_t rgba[maxSide*maxSide*4];
extern "C" {
__attribute__((used)) unsigned char *geo_pixels(){return rgba;}
static uint8_t lum(int idx){return (uint8_t)((77*rgba[idx]+150*rgba[idx+1]+29*rgba[idx+2])>>8);}
__attribute__((used)) int geo_normal_map(int w,int h,float strength){
 if(w<1||h<1||w>maxSide||h>maxSide)return -1;
 if(strength<.01f)strength=.01f;if(strength>32)strength=32;
 // In-place left-to-right would overwrite neighbors; first save all heights
 // in unused alpha bytes only after performing a separate grayscale pass.
 static uint8_t height[maxSide*maxSide];
 int n=w*h;for(int i=0;i<n;i++)height[i]=lum(i*4);
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){
  int l=x?x-1:0,r=x+1<w?x+1:w-1,t=y?y-1:0,b=y+1<h?y+1:h-1;
  float dx=((float)height[y*w+l]-height[y*w+r])*strength/255.f;
  float dy=((float)height[t*w+x]-height[b*w+x])*strength/255.f;
  float inv=1.0f/__builtin_sqrtf(dx*dx+dy*dy+1.f);int i=(y*w+x)*4;
  rgba[i]=(uint8_t)((dx*inv*.5f+.5f)*255);rgba[i+1]=(uint8_t)((dy*inv*.5f+.5f)*255);rgba[i+2]=(uint8_t)((inv*.5f+.5f)*255);rgba[i+3]=255;
 }
 return 0;
}
__attribute__((used)) int geo_uv_grid(int w,int h,int cells){
 if(w<1||h<1||w>maxSide||h>maxSide||cells<1||cells>64)return -1;
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){
  int tx=x*cells/w,ty=y*cells/h;
  bool edge=((x*cells%w)<3*cells||(y*cells%h)<3*cells);
  int k=(y*w+x)*4;rgba[k]=(uint8_t)(edge?12:((tx+ty)&1?255:54));rgba[k+1]=(uint8_t)(edge?12:((tx+ty)&1?221:188));rgba[k+2]=(uint8_t)(edge?12:((tx+ty)&1?120:240));rgba[k+3]=255;
 }
 return 0;
}
}
