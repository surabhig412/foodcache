'use strict';

$(document).on('click', '#logout', function(){
  $.ajax({
    url: '/logout',
    method: 'post',
    success: function(data) {
      window.location.href = '/';
    },
    error: function(data) {
      console.log("error occurred");
    }
  });
});

$(document).on('click', '#admin_logout', function(){
  $.ajax({
    url: '/admin-logout',
    method: 'post',
    success: function(data) {
      window.location.href = '/admin';
    },
    error: function(data) {
      console.log("error occurred");
    }
  });
});

function paidBtnClicked(serial_no, amount) {
  $.ajax({
    url: '/admin/users/details/update',
    method: 'post',
    data: {serial_no: serial_no, amount: amount},
    success: function(data) {
      window.location.reload();
    },
    error: function(data) {
      console.log("error occurred " + data);
    }
  });
}

function updateBalanceBtnClicked() {
  $.ajax({
    url: '/admin/amount/update',
    method: 'post',
    data: {amount: $('#amount_used').val()},
    success: function(data) {
      window.location.reload();
    },
    error: function(data) {
      console.log("error occurred " + data);
    }
  });
}
