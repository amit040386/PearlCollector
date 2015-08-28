(function () {

    'use strict';

    // now endGame() will be called if user click on back btn
    // px to em conversion
    // on game start, background music should be muted
    // on first level bowl 1, break sound should not be there
    // in tablet devices, bowls are riunning fast

    // this function will save data to local storage if it is not present
    constants.saveToStorage();

    // defining sounds
    if (buzz.isMP3Supported()) {
        // creating menu background sound effect
        constants.backSound = new buzz.sound("./sound/background.mp3",{
            preload: false,
            loop: true
        });

        // creating cheering sound effect
        constants.cheerSound = new buzz.sound("./sound/cheer.mp3",{
            preload: false
        });

        // creating pearl broken sound effect
        constants.brokenSound = new buzz.sound("./sound/broken.mp3",{
            preload: false
        });

        // creating water tapping sound effect
        constants.tapSound = new buzz.sound("./sound/tap.mp3",{
            preload: false
        });

        // creating water flowing sound effect
        constants.waterSound = new buzz.sound("./sound/water.mp3",{
            loop: true,
            preload: false
        });
        constants.waterSound.setVolume(5);

        // creating water bubble sound effect
        constants.bubbleSound = new buzz.sound("./sound/bubble.mp3",{
            loop: true,
            preload: false
        });
        constants.bubbleSound.setVolume(10);
    } else {
        console.log("It doesn't support mp3 sounds");
    }

    // load game menu
    $("#main").load("./views/menu-view.html", function() {
        menuModule.initMenu();
    });

})();