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
      window.location.href = '/';
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

$(document).ready(function() {
  $('#multiple-fooditems').multiselect();
});

function purchaseBtnClicked() {
  console.log("purchaseBtnClicked ");
  $.ajax({
    url: '/admin/items/purchase',
    method: 'post',
    data: {
      amount: $('#amount').val(),
      description: $('#description').val(),
      items: $('#multiple-fooditems').val().toString()
    },
    success: function(data) {
      window.location.reload();
    },
    error: function(data) {
      console.log("error occurred " + data);
    }
  });
}
