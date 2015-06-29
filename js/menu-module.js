var menuModule = (function(){

    function initMenu() {
        constants.setLang();

        // preparing menu based on saved data in local storage
        var setting = constants.getFromStorage();
        if(setting.music === "on") {
            $("#sound").addClass("sound-on").removeClass("sound-off");
            constants.setSound("unmute");
        } else {
            $("#sound").addClass("sound-off").removeClass("sound-on");
            constants.setSound("mute");
        }

        constants.SELECTED_LANG = setting.lang;
        constants.setLang();

        $("#pointSection").addClass("black-font-color");

        constants.backSound.play();

        // play game event listener
        $("#playGame").one("click", function() {
            $("#main").load("./views/game-view.html", function() {
                var difficulty = 2;
                gameModule.startGame(difficulty);
            });
        });

        // select language event listener
        $("#selectLang").on("change", function() {
            constants.SELECTED_LANG = $(this).val();
            constants.setLang();
            constants.saveToStorage({
                lang: constants.SELECTED_LANG
            });
        });

        // sound on or off event listener
        $("#sound").on("click", function() {
            $(this).toggleClass("sound-on sound-off");
            var mode = $(this).attr("class").split("-")[1];
            constants.saveToStorage({
                music: mode
            });
            constants.setSound("toggle");
        });

        // game statistics modal opening event listener
        $("#stat").on("click", function(){
           $("#gameStat").slideDown();
        });

        // exit stat modal event listener
        $("#exitStat").on("click", function(){
            $("#gameStat").slideUp();
        });

        // help modal opening event listener
        $("#help").on("click", function(){
            $("#gameHelp").slideDown();
        });

        // exit help modal event listener
        $("#exitHelp").on("click", function(){
           $("#gameHelp").slideUp();
        });
    }

    return {
        initMenu: initMenu
    };

})();