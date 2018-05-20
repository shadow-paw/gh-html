var loginState = undefined;
var settingState = {
    "repo_restrict": true
};


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
    login_ajax();
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

function setting_setup() {
    $("#setting_restrict").change(function(){
        settingState.repo_restrict = this.checked;
        setting_ajax();
    });
    setting_ajax();
}
function setting_updateUI(){
    $("#setting_restrict").prop("checked", settingState.repo_restrict);
}
function setting_ajax() {
    $.ajax({
        url: "rest/setting",
        type: "PATCH",
        contentType : 'application/json',
        data: JSON.stringify(settingState),
        success: function(data, status, xhr){
            settingState = data;
            setting_updateUI();
        },
        error: function() {
            // TODO: resync
        }
    });
}

$(document).ready(function(){
    M.AutoInit();
    $("#body-content").show();
    login_setup();
    setting_setup();
});
