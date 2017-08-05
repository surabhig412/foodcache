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

function paidBtnClicked(serial_no) {
  $.ajax({
    url: '/users/details/update',
    method: 'post',
    data: {serial_no: serial_no},
    success: function(data) {
      window.location.reload();
    },
    error: function(data) {
      console.log("error occurred " + data);
    }
  });
}
