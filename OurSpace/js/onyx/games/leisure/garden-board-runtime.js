(function(root){
"use strict";
var registry=Object.create(null),pending=(root.GardenBoardPack&&root.GardenBoardPack.pending)||[];
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function register(d){if(!d||!d.id)throw new Error("Board definition requires id");registry[d.id]=clone(d);return registry[d.id];}
function get(id){return registry[id]?clone(registry[id]):null;}
function list(){return Object.keys(registry).map(function(k){return clone(registry[k]);}).sort(function(a,b){return a.number-b.number;});}
function assetUrl(name){return "assets/images/games/leisure/Ingredient_Garden/"+encodeURIComponent(name);}
function ingredientUrl(name){return "assets/images/games/leisure/shared/"+encodeURIComponent(name);}
function toLevelData(d){d=typeof d==="string"?get(d):d;return (d.rows||[]).map(function(row){return row.split("").map(function(v){return v==="1"?["r"]:["b"];});});}
function toEngineLevel(d){d=typeof d==="string"?get(d):d;if(!d)throw new Error("Unknown board");var out=clone(d.nativeLevel||{});out.levelData=toLevelData(d);out.gardenBoard=clone(d);return out;}
var api={pending:[],registry:registry,register:register,get:get,list:list,assetUrl:assetUrl,ingredientUrl:ingredientUrl,toLevelData:toLevelData,toEngineLevel:toEngineLevel,clone:clone};
root.GardenBoardPack=api;pending.forEach(register);
})(typeof globalThis!=="undefined"?globalThis:window);
