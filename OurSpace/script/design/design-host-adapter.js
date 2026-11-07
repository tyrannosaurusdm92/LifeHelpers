/* Free-floating OurSpace widget host bridge. No Demo Account, pages or fake auth. */
(function(){'use strict';
 const params=new URLSearchParams(location.search);
 const allowed=['profile','household','journal','feed','skills','communication','audio','visual','store'];
 const active=params.get('page')||document.documentElement.dataset.ourspaceCurrentPage||'profile';
 document.documentElement.dataset.ourspaceCurrentPage=(allowed.includes(active)||window.OurSpaceDesignIsolated&&active==='standalone')?active:'profile';
 const external=window.OurSpaceDesignContext||{};
 window.OurSpaceDesignContext={account:String(external.account||document.documentElement.dataset.profile||'ourspace'),page:String(external.page||document.documentElement.dataset.ourspaceCurrentPage)};
 if(/\/design_widget\.html$/i.test(location.pathname))document.documentElement.dataset.osDesignWidgetStandalone='true';
})();
