var constants = (function() {
    "use strict";

    // this is timer function
    function timer() {
        var timeTicker, ticker = 0;

        // for starting timer
        this.startTimer = function() {
            timeTicker = setInterval(function(){
                ticker += 1000;
                var seconds = Math.floor((ticker / 1000) % 60);
                var minutes = Math.floor((ticker / (60 * 1000)) % 60);
                $("#timeSection").text(((minutes < 10) ? "0" : "")+ minutes + ":" + ((seconds < 10) ? "0" : "")+ seconds);
                if(minutes >= 60) {
                    this.stopTimer();
                }
            },1000);
        };

        // for stopping timer
        this.stopTimer = function() {
            ticker = 0;
            clearInterval(timeTicker);
        };

        // for pausing timer
        this.pauseTimer = function() {
            clearInterval(timeTicker);
        };
    }

    return {
        GAME_LEVEL: 1,
        GAME_MODES: ["MENU.CLASSIC_MODE","MENU.TIMED_MODE"],
        GAME_POINT: 0,
        TOTAL_POINT: 0,
        GAME_BONUS_POINT: 5,
        GAME_MODE: 0,
        GAME_DIFFICULTY_LEVEL: 1,
        GAME_DIFFICULTY_LEVELS: ["EASY","HARD"],
        BOWL_LEVEL: 1,
        PERL_RADIUS: 12.5,
        PERL_DIAMETER: 25,
        BOWL_HEIGHT: 50,
        BOWL_WIDTH: 70,
        FREE_LIVES: 3,
        PERL_COLLECTED: false,
        LAST_BOWL_LEVEL: 1,
        LANG_PATH: "lang/application",
        SELECTED_LANG: "en",
        getTimer: function() {
            return new timer();
        },
        changeText: function(elem, txt) {
            if(txt) {
                $(elem).data("localize",txt);
            }
            if($(elem).is("[data-localize]")) {
                $(elem).localize(constants.LANG_PATH, { language: constants.SELECTED_LANG });
            } else {
                $(elem).find("[data-localize]").localize(constants.LANG_PATH, { language: constants.SELECTED_LANG });
            }
        },
        backSound: null,
        brokenSound: null,
        cheerSound: null,
        tapSound: null,
        waterSound: null,
        bubbleSound: null,
        setLang: function() {
            $("[data-localize]").localize(constants.LANG_PATH, { language: constants.SELECTED_LANG });
        },
        saveToStorage: function(mapObj) {
            if(! localStorage.pearlCollector) {
                localStorage.setItem("pearlCollector", JSON.stringify({
                    "lang": constants.SELECTED_LANG,
                    "music": "on",
                    "point": 0,
                    "stat": []
                }));
            } else {
                if(mapObj) {
                    var savedObj = JSON.parse(localStorage.getItem("pearlCollector"));
                    if(mapObj.stat) {
                        savedObj.stat.push(mapObj.stat);
                        delete mapObj.stat;
                    }
                    $.extend(true, savedObj, mapObj);
                    localStorage.setItem("pearlCollector", JSON.stringify(savedObj));
                }
            }
        },
        getFromStorage: function(name) {
            var val = undefined;
            if(localStorage.pearlCollector) {
                var obj = JSON.parse(localStorage.getItem("pearlCollector"));
                if(name && localStorage.pearlCollector[name]) {
                    val = obj[name];
                } else {
                    val = obj;
                }
            }
            return val;
        },
        setSound: function(mode) {
            for(var index in buzz.sounds) {
                if(mode === "toggle") {
                    buzz.sounds[index].toggleMute();
                } else if(mode === "mute") {
                    buzz.sounds[index].mute();
                } else if(mode === "unmute") {
                    buzz.sounds[index].unmute();
                }
            }
        }
    };

})();