/*
 * Browser adaptations of the supplied MIT projects:
 * Restaurant-Game-Canvas-JS, Copyright (c) 2024 Enes Babekoğlu:
 *   rastgeleSayi, mobilyaAnimasyon, hazirlamayaEkle, teslimEt.
 * Dish-Dash-1.0, Copyright (c) 2023 KamelMahjoub:
 *   PlateKitchenObject.TryAddIngredient and DeliveryManager.DeliverRecipe.
 * Full MIT notices are retained in docs/. See Source-Integration.md.
 */
(function(root){
  'use strict';
  // Original inclusive-range helper, made seedable for repeatable orders.
  function randomInt(min,max,random=Math.random){return Math.floor(random()*(max-min+1))+min;}
  // Restaurant's forward/backward cooking animation, driven by simulation time
  // rather than wall-clock setInterval so pause freezes every animation.
  function pingPongFrame(seconds,frames,fps=5){const span=Math.max(1,frames-1);const n=Math.floor(seconds*fps)%(span*2);return n<=span?n:span*2-n;}
  // Dish Dash plate validity / duplicate guards, translated from C# to JS.
  class Plate {
    constructor(validIds){this.validIds=new Set(validIds);this.items=[];}
    tryAddIngredient(item){
      if(!item||!this.validIds.has(item.id)||this.items.some(x=>x.uid===item.uid))return false;
      this.items.push(item);return true;
    }
  }
  // Recipe comparison preserves actual contents, including unexpected additions.
  // Unlike the source's binary delivery, partial completion yields useful feedback.
  function compareDelivery(requiredIds,items){
    const wanted=new Set(requiredIds),present=new Set(items.map(x=>x.id));
    return {missing:[...wanted].filter(id=>!present.has(id)),unexpected:[...present].filter(id=>!wanted.has(id)),exact:wanted.size===present.size&&[...wanted].every(id=>present.has(id))};
  }
  // Restaurant's reserve/consume rule: a portion can only leave its vessel once.
  function transferPortions(vessel,plate){
    let count=0;for(const item of vessel){if(!item.plated&&plate.tryAddIngredient(item)){item.plated=true;count++;}}return count;
  }
  root.MeowKitchen={randomInt,pingPongFrame,Plate,compareDelivery,transferPortions};
  if(typeof module!=='undefined')module.exports=root.MeowKitchen;
})(typeof window!=='undefined'?window:globalThis);
