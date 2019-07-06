"use strict";

$(document).on("click", "#logout", function () {
    $.ajax({
        url: "/logout",
        method: "post",
        success: function (data) {
            window.location.href = "/";
        },
        error: function (data) {
            console.log("error occurred");
        },
    });
});

$(document).on("click", "#admin_logout", function () {
    $.ajax({
        url: "/admin/logout",
        method: "post",
        success: function (data) {
            window.location.href = "/";
        },
        error: function (data) {
            console.log("error occurred");
        },
    });
});

function notifyBtnClicked () {
    $.ajax({
        url: "/admin/users/notify",
        method: "post",
        success: function (data) {
            window.location.reload();
        },
        error: function (data) {
            console.log("error occurred " + data);
        },
    });
}

function paidBtnClicked (serial_no, amount) {
    $.ajax({
        url: "/admin/users/details/update",
        method: "post",
        data: { serial_no: serial_no, amount: amount, },
        success: function (data) {
            window.location.reload();
        },
        error: function (data) {
            console.log("error occurred " + data);
        },
    });
}

function editBtnClicked (obj, serial_no) {
    $(obj).closest("tr")[0].cells[2].innerHTML = "<input type=text class=\"pull-right\" id=\"editamount\" value=" + $(obj).closest("tr")[0].cells[2].innerHTML + "></input>";
    $(obj).closest("tr")[0].cells[4].innerHTML = "<button class='btn btn-primary save-btn' type='button' onclick=saveBtnClicked(" + serial_no + ")>Save</button>";
}

function saveBtnClicked (serial_no) {
    $.ajax({
        url: "/admin/users/details/edit",
        method: "post",
        data: { serial_no: serial_no, amount: $("#editamount").val(), },
        success: function (data) {
            window.location.reload();
        },
        error: function (data) {
            console.log("error occurred " + data);
        },
    });
}

$(document).ready(function () {
    $("#multiple-fooditems").multiselect();
});

function purchaseBtnClicked () {
    $.ajax({
        url: "/admin/items/purchase",
        method: "post",
        data: {
            amount: $("#amount").val(),
            description: $("#description").val(),
            items: $("#multiple-fooditems").val().toString(),
        },
        success: function (data) {
            window.location.reload();
        },
        error: function (data) {
            console.log("error occurred " + data);
        },
    });
}

function addFoodstockBtnClicked () {
    $.ajax({
        url: "/admin/foodstock/add",
        method: "post",
        data: {
            fooditem: $("#foodstock_item").val(),
        },
        success: function (data) {
            window.location.reload();
        },
        error: function (data) {
            console.log("error occurred " + data);
        },
    });
}

function deleteFoodstockBtnClicked (id) {
    $.ajax({
        url: "/admin/foodstock/delete",
        method: "post",
        data: {
            id: id,
        },
        success: function (data) {
            window.location.reload();
        },
        error: function (data) {
            console.log("error occurred " + data);
        },
    });
}
