var menuModule = (function(){

    function initMenu() {
        constants.setLang();

        // preparing menu based on saved data in local storage
        var setting = constants.getFromStorage();
        constants.TOTAL_POINT = setting.point;

        if(setting.music === "on") {
            $("#sound").addClass("sound-on").removeClass("sound-off");
            constants.setSound("unmute");
        } else {
            $("#sound").addClass("sound-off").removeClass("sound-on");
            constants.setSound("mute");
        }

        $("#pointSection").text(constants.TOTAL_POINT);

        constants.SELECTED_LANG = setting.lang;
        $("#selectLang").val(setting.lang);
        constants.setLang();
        $("body").removeAttr("lang").attr("lang",setting.lang);

        $("#pointSection").addClass("black-font-color");

        constants.backSound.play();

        // play game event listener
        $("#playGame").off("click").on("click", function() {
            if($(".selected-mode").hasClass("classic-mode")) {
                $("#gameDiffSelection").fadeIn();
                $("#playGame").fadeOut();
            } else {
                $("#main").load("./views/game-view.html", function() {
                    constants.GAME_DIFFICULTY_LEVEL = 2;
                    gameModule.startGame();
                });
            }
        });

        // event listener for difficulty mode selection
        $("button","#gameDiffSelection").off("click").on("click", function() {
            constants.GAME_DIFFICULTY_LEVEL = +$(this).attr("difficulty-mode");
            $("#main").load("./views/game-view.html", function() {
                gameModule.startGame();
            });
        });

        // game mode selection event listener
        $(".mode").off("click").on("click", function(){
            $(".mode").removeClass("selected-mode");
            $(this).addClass("selected-mode");
        });

        // select language event listener
        $("#selectLang").off("click").on("change", function() {
            constants.SELECTED_LANG = $(this).val();
            $("body").removeAttr("lang").attr("lang",constants.SELECTED_LANG);
            constants.setLang();
            constants.saveToStorage({
                lang: constants.SELECTED_LANG
            });
        });

        // sound on or off event listener
        $("#sound").off("click").on("click", function() {
            $(this).toggleClass("sound-on sound-off");
            var mode = $(this).attr("class").split("-")[1];
            constants.saveToStorage({
                music: mode
            });
            constants.setSound("toggle");
        });

        // game statistics modal opening event listener
        $("#stat").off("click").on("click", function(){
           $("#gameStat").slideDown();
        });

        // exit stat modal event listener
        $("#exitStat").off("click").on("click", function(){
            $("#gameStat").slideUp();
        });

        // help modal opening event listener
        $("#help").off("click").on("click", function(){
            $("#gameHelp").slideDown();
        });

        // exit help modal event listener
        $("#exitHelp").off("click").on("click", function(){
           $("#gameHelp").slideUp();
        });
    }

    return {
        initMenu: initMenu
    };

})();