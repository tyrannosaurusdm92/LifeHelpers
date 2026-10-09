/* Savanski raster effects: independent, browser-safe C implementation.
 * Packed RGBA 8-bit pixels are copied into exported scratch memory.
 * Portable equivalent of common Python/C image-processing loops; no Python
 * runtime or desktop dependencies. Do not import other projects' GPL sources.
 */
#include <stdint.h>
#define SIDE 2048
#define CAP (SIDE*SIDE*4)
static uint8_t pixels[CAP],copy[CAP];
__attribute__((used)) unsigned char *fx_pixels(void){return pixels;}
static unsigned char clip(float v){return (unsigned char)(v<0?0:v>255?255:v+0.5f);}
static float absolute(float v){return v<0?-v:v;}
static float fract(float v){return v-(int)v;}
static uint32_t mix(uint32_t x){x^=x>>16;x*=0x7feb352du;x^=x>>15;x*=0x846ca68bu;x^=x>>16;return x;}
static unsigned char luminance(const unsigned char*p){return (unsigned char)((77u*p[0]+150u*p[1]+29u*p[2])>>8);}
static void clone(int count){for(int i=0;i<count;i++)copy[i]=pixels[i];}
/* mode: 1 grayscale, 2 posterize, 3 threshold, 4 color noise, 5 ordered dither,
 * 6 edges, 7 chromatic shift, 8 vignette, 9 pixelate, 10 glow,
 * 11 contrast, 12 invert, 13 warm-cool, 14 emboss, 15 halftone. */
__attribute__((used)) int fx_apply(int w,int h,int mode,float strength){
 if(w<1||h<1||w>SIDE||h>SIDE||w*h>SIDE*SIDE)return -1;
 if(strength<0)strength=0;if(strength>1)strength=1;
 const int len=w*h*4;clone(len);
 const int bayer[16]={0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5};
 int block=2+(int)(strength*30);
 for(int y=0;y<h;y++)for(int x=0;x<w;x++){
  int o=(y*w+x)*4;const unsigned char *src=copy+o;
  if(src[3]==0)continue;
  float v=luminance(src), r=src[0],g=src[1],b=src[2];
  if(mode==1){r=r+(v-r)*strength;g=g+(v-g)*strength;b=b+(v-b)*strength;}
  else if(mode==2){int levels=2+(int)((1-strength)*14);int q=levels-1;r=((int)(r*q/255+.5f))*255.f/q;g=((int)(g*q/255+.5f))*255.f/q;b=((int)(b*q/255+.5f))*255.f/q;}
  else if(mode==3){float t=100+strength*70;float k=v>=t?255:0;r=r+(k-r)*strength;g=g+(k-g)*strength;b=b+(k-b)*strength;}
  else if(mode==4){int32_t n=(int32_t)(mix((uint32_t)(y*7919+x*104729+12345))%511)-255;r+=n*strength*.25f;g+=n*strength*.25f;b+=n*strength*.25f;}
  else if(mode==5){int q=(bayer[(y&3)*4+(x&3)]*16)-120;float vv=(v+q*strength)>=128?255:0;r=r+(vv-r)*strength;g=g+(vv-g)*strength;b=b+(vv-b)*strength;}
  else if(mode==6||mode==14){int nx=x+1<w?x+1:x,ny=y+1<h?y+1:y;int q=(y*w+nx)*4,t=(ny*w+x)*4;int delta=(int)v-(int)luminance(copy+q),delta2=(int)v-(int)luminance(copy+t);float edge=absolute((float)delta)+absolute((float)delta2);if(mode==6){float k=255-edge*2.6f;r=r+(k-r)*strength;g=g+(k-g)*strength;b=b+(k-b)*strength;}else {float k=128+delta*2+delta2*2;r=r+(k-r)*strength;g=g+(k-g)*strength;b=b+(k-b)*strength;}}
  else if(mode==7){int d=1+(int)(strength*12);int l=x-d<0?0:x-d,z=x+d>=w?w-1:x+d;r=copy[(y*w+l)*4];b=copy[(y*w+z)*4+2];}
  else if(mode==8){float dx=(2.f*x/w)-1.f,dy=(2.f*y/h)-1.f,fall=1.f-(dx*dx+dy*dy)*strength*.8f;if(fall<0)fall=0;r*=fall;g*=fall;b*=fall;}
  else if(mode==9){int ox=(x/block)*block,oy=(y/block)*block;int k=(oy*w+ox)*4;r=copy[k];g=copy[k+1];b=copy[k+2];}
  else if(mode==10){int rad=1+(int)(strength*4);float rr=0,gg=0,bb=0;int n=0;for(int yy=y-rad;yy<=y+rad;yy+=rad)for(int xx=x-rad;xx<=x+rad;xx+=rad){int ax=xx<0?0:xx>=w?w-1:xx,ay=yy<0?0:yy>=h?h-1:yy,k=(ay*w+ax)*4;rr+=copy[k];gg+=copy[k+1];bb+=copy[k+2];n++;}r=r*(1-strength*.5f)+(rr/n)*(strength*.5f);g=g*(1-strength*.5f)+(gg/n)*(strength*.5f);b=b*(1-strength*.5f)+(bb/n)*(strength*.5f);}
  else if(mode==11){float contrast=1+strength*1.5f;r=(r-127.5f)*contrast+127.5f;g=(g-127.5f)*contrast+127.5f;b=(b-127.5f)*contrast+127.5f;}
  else if(mode==12){r=r+(255-2*r)*strength;g=g+(255-2*g)*strength;b=b+(255-2*b)*strength;}
  else if(mode==13){r+=strength*30;g+=strength*5;b-=strength*20;}
  else if(mode==15){int cell=5+(int)(strength*9);float dx=(float)(x%cell)-cell*.5f,dy=(float)(y%cell)-cell*.5f;float fill=(255-v)/255.f;float dot=(dx*dx+dy*dy)<(fill*cell*cell*.29f)?0:255;r=r+(dot-r)*strength;g=g+(dot-g)*strength;b=b+(dot-b)*strength;}
  else return -2;
  pixels[o]=clip(r);pixels[o+1]=clip(g);pixels[o+2]=clip(b);
 }
 return 0;
}

void *memcpy(void *dst, const void *src, unsigned long n){unsigned char*d=dst;const unsigned char*s=src;for(unsigned long i=0;i<n;i++)d[i]=s[i];return dst;}
