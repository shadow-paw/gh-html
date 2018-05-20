var loginState = undefined;

function login_setup(){
    $("#login").click(function(){
        window.location.replace("auth/github");
    });
    $("#logout").click(function(){
        loginState = undefined;
        login_updateUI();
        $.ajax({
            url: "rest/logout",
            type: "GET",
            success: function(data, status, xhr){
                loginState = data;
            },
            error: function() {
            }
        });
    });
}
function login_updateUI(){
    if (loginState) {
        $("#login").hide();
        $("#logout").show();
        $("#welcome").text("Welcome " + loginState.name);
        $("#welcome").show();
    } else {
        $("#login").show();
        $("#logout").hide();
        $("#welcome").hide();
    }
}
function login_ajax(){
    $.ajax({
        url: "rest/me",
        type: "GET",
        success: function(data, status, xhr){
            loginState = data;
            login_updateUI();
        },
        error: function() {
            loginState = undefined;
            login_updateUI();
        }
    });
}

$(document).ready(function(){
    M.AutoInit();
    $("#body-content").show();
    login_setup();
    login_ajax();
});
