// Fake out console.log for safety, if it doesn't exist.
window.console || (window.console = {});
console.log    || (console.log = _.identity);

// Create the DV namespaces.
window.DV   = window.DV   || {};
DV.jQuery  || (DV.jQuery = jQuery.noConflict(true));
DV.easyXDM || (DV.easyXDM = easyXDM.noConflict("DV") );
DV.Backbone = Backbone.noConflict();
DV.viewers  = DV.viewers  || {};
DV.model    = DV.model    || {};
DV.view     = DV.view     || {};

