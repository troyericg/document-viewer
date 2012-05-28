// mock account object
DV.account  = {name: 'Ted Han', avatar_url: 'https://si0.twimg.com/profile_images/2187833737/hat_shot_90ccw_normal.jpg'};
Backbone.sync = _.wrap(Backbone.sync, function(sync, method, model, options) { 
  return sync(method, model, _.extend(options, {dataType: 'jsonp'}));
});
