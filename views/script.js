'use strict';

$(document).on('click', '.logout', function(){
  $.ajax({
    url: '/logout',
    method: 'get',
    success: function(data) {
      console.log(data);
    },
    error: function(data) {
      console.log("error occurred");
    }
});
});
