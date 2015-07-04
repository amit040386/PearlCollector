var gameModule = (function() {

    "use strict";

    var timer, windowHeight = $(window).height();

    // this function is for creating water ripple effect on touching anywhere in the body
    function createPinchRipple(evt) {
        this.initRipple = function(evt) {
            var  $ripple = $("<span class='ripple' style='top:"+evt.pageY+"px;left:"+evt.pageX+"px;'></span>");
            $ripple.appendTo("#gameSection");
            setTimeout(function(){
                $ripple.remove();
            },4050);
            // playing tap water sound
            constants.tapSound.play();
        }
    }

    // this function is a main function for throwing the perl and relative calculations
    function throwPerl(evt)  {
        var $perlEle, throwHeight, bottomPos = -50, tempBowlLevel, tempPerlIndex, $containerBowl,
            $bowl = $("#level"+constants.GAME_LEVEL+" .bowl"+constants.BOWL_LEVEL);

        constants.PERL_COLLECTED = false;

        // creating water ripple effect
        new createPinchRipple().initRipple(evt);

        // this is selecting bowl position and throw height
        throwHeight = windowHeight - $bowl.position().top + 30;
        if(constants.GAME_LEVEL === 1 && constants.BOWL_LEVEL === 1) {
            bottomPos = 30;
        } else {
            bottomPos = -50;
        }

        // this is selecting which perl to be thrown
        if($("#level"+constants.GAME_LEVEL+" .perl-section .perl").length > 0) {
            $perlEle = $(".perl").eq(0);
            constants.LAST_BOWL_LEVEL = 1;
        } else {
            // this is selection in which bowl, the perl will be thrown
            tempBowlLevel = ((constants.BOWL_LEVEL  > 1) ? (constants.BOWL_LEVEL-1) : constants.BOWL_LEVEL);
            $containerBowl = $("#level"+constants.GAME_LEVEL+" .bowl"+tempBowlLevel);

            constants.LAST_BOWL_LEVEL = tempBowlLevel;

            // this is for which perl among all the perl in the bowl, to be thrown, depending upon the perl count
            tempPerlIndex = (($containerBowl.children(".perl").length >= 3) ? ":last": ":first");
            $perlEle = $containerBowl.children(".perl"+tempPerlIndex);
        }

        if($perlEle) {
            // detaching perl once it is thrown and applying top and left values for the same
            var perlPos = $perlEle.offset();
            $perlEle.appendTo("body").css({
                bottom: (windowHeight-perlPos.top),
                left: perlPos.left,
                position: "fixed"
            });

            // perl throwing animation attachment with velocity
            $perlEle.velocity({
                bottom: throwHeight,
                left: perlPos.left
            }, {
                duration: 600,
                easing: "easeOutQuad"
            }).velocity({
                bottom: bottomPos,
                left: perlPos.left
            }, {
                duration: 600,
                easing: "easeInQuad",
                progress: function(element, complete, remaining, start, tweenValue) {
                    var perlPos = $perlEle.offset(), bowl1Pos = $bowl.offset();

                    // every time it is checked whether it is dropped inside bowl during downfall
                    if(perlPos.top >= bowl1Pos.top
                        && (perlPos.top+constants.PERL_DIAMETER) <= (bowl1Pos.top+constants.BOWL_HEIGHT)
                        && perlPos.left >= bowl1Pos.left
                        && (perlPos.left+constants.PERL_DIAMETER) <= (bowl1Pos.left+constants.BOWL_WIDTH)) {

                        $perlEle.velocity("finish");
                        constants.PERL_COLLECTED = true;
                    }
                },
                complete: function() {
                    calculatePoints();
                    // if bowl is collected perl
                    if(constants.PERL_COLLECTED) {
                        $perlEle.removeAttr("style");
                        $perlEle.appendTo($bowl);

                        // after collecting all perls bowl level will be increased
                        if($bowl.children(".perl").length === 3 ||
                            ($containerBowl && $containerBowl.children(".perl").length === 0 &&
                                $(".perl").parent(".bowl").length > 0)) {

                            constants.BOWL_LEVEL++;
                        }
                        constants.PERL_COLLECTED = false;

                        // after completing all 4 bowl collection, level will be increased
                        verifyLevelIncrease();
                    } else {
                        constants.brokenSound.play();

                        if(constants.GAME_LEVEL === 1 && constants.BOWL_LEVEL === 1) {
                            $perlEle.appendTo($("#level"+constants.GAME_LEVEL+" .perl-section"));
                        }
                        // pearl will be fell down in bowl level more than 1
                        if(constants.GAME_LEVEL > 1 || (constants.GAME_LEVEL === 1 && constants.BOWL_LEVEL > 1)) {

                            // if there is no life and user missed to collect the pearl then tooltip will be shown
                            if(constants.FREE_LIVES === 0 && $("body").children(".perl").length < 3 && constants.TOTAL_POINT >= 50) {
                                $("#tooltip").fadeIn().css("display","block").delay(2000).fadeOut();
                            }

                            // if all 3 perls are wasted then game is over
                            if($("body").children(".perl").length === 3) {
                                gameFailed();
                            }
                            // if any one pearl is kept in bowl then level will be increased to continue the game
                            else if($containerBowl.children(".perl").length === 0 &&
                                $(".perl").parent(".bowl").length > 0) {

                                constants.BOWL_LEVEL++;

                                // after completing all 4 bowl collection, level will be increased
                                verifyLevelIncrease();
                            }
                        }
                    }
                    // attaching click event again to throw the perl for the next time
                    $(document).one("click", throwPerl);
                }
            });
        }

    }

    // this function is checking after completing all 4 bowl collection, level will be increased
    function verifyLevelIncrease() {
        if((constants.BOWL_LEVEL > 4 && constants.GAME_LEVEL === 1) ||
            (constants.BOWL_LEVEL > 5 && constants.GAME_LEVEL > 1)) {

            constants.BOWL_LEVEL = 2;
            constants.GAME_LEVEL++;
            calculatePoints(true);
        }
    }


    // this is for displaying next level
    function displayNextLevel(bonusPoints) {

        $(document).off("click", throwPerl);
        deactivateEventListener();

        // displaying bonus points
        $("#bonusVal").text(bonusPoints);

        $("#finalTotalPoints").text(constants.GAME_POINT);

        $("#exitGame").off("click").on("click", function(e){
            e.stopImmediatePropagation();
            endGame();
            $("#bonusSection").hide();
        });

        // adding black font color for time and point section only for level 4 for better visibility
        if(constants.GAME_LEVEL === 4) {
            $("#timeSection, #pointSection").addClass("black-font-color");
        }
        if(constants.GAME_LEVEL > 4) {
            // if level is reached last level (4) then exit game and relevant info will be shown
            $("#exitGame").css({
                "float":"none",
                "margin": "auto"
            });
            timer.stopTimer();
            constants.changeText($("#levelInfo"), "BONUS.COMPLETED");

            // continue level button will be disabled in this case
            $("#continueGame").hide();
        } else {
            $("#continueGame").off("click").on("click", function(e){
                e.stopImmediatePropagation();
                $("#bonusSection").hide();

                $(document).one("click", throwPerl);

                var $newLevel = $("#level"+constants.GAME_LEVEL),
                    $prevLevel = $("#level"+(constants.GAME_LEVEL-1));

                $newLevel.show().addClass("level-entry");
                $prevLevel.addClass("level-exit");
                setTimeout(function() {
                    $prevLevel.hide();
                    activateEventListener();
                },1000);
                $(".bowl:last .perl",$prevLevel).appendTo($("#level"+constants.GAME_LEVEL+" .bowl"+(constants.BOWL_LEVEL-1)));
            });
        }
        // bonus section is displayed
        $("#bonusSection").show();
    }

    // this is for calculating points
    function calculatePoints(isLevelIncreased) {
        if(constants.PERL_COLLECTED) {
            // for each perl collection, point will increase as per difficulty level
            constants.GAME_POINT += (constants.GAME_DIFFICULTY_LEVEL*constants.GAME_BONUS_POINT);
            printBonusPoint();
        }

        // if level increased then level bonus will be counted
        if(isLevelIncreased) {
            // for each level increase, some bonus point will be added as per difficulty level
            var bonusPoints = (constants.BOWL_LEVEL*constants.GAME_DIFFICULTY_LEVEL*constants.GAME_BONUS_POINT);
            constants.GAME_POINT += bonusPoints;
            printBonusPoint();
            constants.cheerSound.play();
            displayNextLevel(bonusPoints);
        }
    }

    // for displaying points
    function printBonusPoint() {
        $("#pointSection").text(constants.GAME_POINT);
        $(".point-section .coins").remove();
        $(".point-section").prepend("<span class='coins highlight'></span>");
    }

    // this is for resetting to all default values
    function resetGame() {
        constants.BOWL_LEVEL = 4;
        constants.GAME_LEVEL = 1;
        constants.GAME_POINT = 0;
        constants.PERL_COLLECTED = false;
        constants.FREE_LIVES = (3/(constants.GAME_DIFFICULTY_LEVEL/2));
        constants.IS_GAME_END = false;

        // invisible other game levels
        $(".level:not('.level-"+constants.GAME_LEVEL+"')").hide();

        // making visible only first level
        $("#level"+constants.GAME_LEVEL).show();
        $("#totalGamePoints").text(constants.TOTAL_POINT);
        $("#pointSection").text("0");
        $("#timeSection").text(((constants.GAME_MODE === 0) ? "00:00" : "03:00"));
        $("#freeLiveSection").text(constants.FREE_LIVES);
        constants.changeText($("#levelInfo"), "BONUS.INFO");

        // hiding all popups
        $("#gameFailedSection, #bonusSection").hide();

        // removing black font color for time and point section. Black font color will be applied only for level 4
        if(constants.GAME_LEVEL < 4) {
            $("#timeSection, #pointSection").removeClass("black-font-color");
        } else {
            $("#timeSection, #pointSection").addClass("black-font-color");
        }
    }

    // this is pause game listener
    function pauseGameListener(e) {
        e.stopImmediatePropagation();
        deactivateEventListener();
        $("#gamePauseModal").slideDown();
        $(this).toggleClass("pause live");
        $(document).off("click", throwPerl);
    }

    // this function is for displaying game time out modal
    function displayGameEnd() {
        $(document).off("click", throwPerl);
        $("#totalPoints").text(constants.GAME_POINT);
        $("#gameTimeOutModal").show();
        $("#exitTimedOutGame").one("click", function(e) {
            e.stopImmediatePropagation();
            $("#gameTimeOutModal").hide();
            endGame();
        });
    }

    // this is a public function for starting game
    function startGame() {
        timer = constants.getTimer();
        // resting values before starting the game
        resetGame();

        // game end checker for timed out
        var endGameChecker = setInterval(function(){
            if(constants.IS_GAME_END) {
                deactivateEventListener();
                displayGameEnd();
                clearInterval(endGameChecker);
            }
        },500);

        // setting localized languages
        constants.setLang();
        constants.waterSound.play();
        constants.bubbleSound.play();

        // resume game button event listener
        $("#resumeGame").off("click").on("click", function(e){
            e.stopImmediatePropagation();
            $("#gamePauseModal").slideUp();
            $(document).one("click", throwPerl);
            activateEventListener();
            $("#pauseGame").toggleClass("pause live");
        });

        // this event listener for exiting game
        $("#exitFromGame").off("click").on("click", function(e){
            e.stopImmediatePropagation();
            $("#gamePauseModal").slideUp();
            endGame(true);
        });

        // pearl placement as per game level
        if(constants.GAME_LEVEL === 1 && $(".perl-section").children(".perl").length === 0) {
            $(".perl").appendTo($(".perl-section"));
        } else {
            $(".perl").appendTo($("#level"+constants.GAME_LEVEL+" .bowl"+(constants.BOWL_LEVEL-1)));
        }

        // event binding for throwing perl for one time
        $(document).one("click", throwPerl);
        activateEventListener();
    }

    // this function will redeem life
    function redeemLife() {
        var $bowl = $("#level"+constants.GAME_LEVEL+" .bowl"+constants.LAST_BOWL_LEVEL);

        // decrease the bowl level after reverting the perl
        if((constants.BOWL_LEVEL-1) > constants.LAST_BOWL_LEVEL) {
            constants.BOWL_LEVEL--;
        }

        // reverting dropped perl and appended to bowl again
        $("body > .perl:first").appendTo($bowl).removeAttr("style");
    }

    // this function will activate all event listener
    function activateEventListener() {
        timer.startTimer();
        $("#pauseGame").on("click", pauseGameListener);
        $("#freeLiveSection").parent().on("click",addLife);
    }

    // this function will deactivate all event listener
    function deactivateEventListener() {
        timer.pauseTimer();
        $("#pauseGame").off("click");
        $("#freeLiveSection").parent().off("click");
    }

    // this is for adding life after failure
    function addLife(e) {
        e.stopImmediatePropagation();
        if($("body > .perl").length > 0) {

            // if free lives are available
            if(constants.FREE_LIVES > 0) {
                // decreasing free lives
                constants.FREE_LIVES--;
                $("#freeLiveSection").text(constants.FREE_LIVES);
                redeemLife();
            }
            // else it will ask for buying free lives with the cost of earned coins
            else {
                // if total points are available more than 50 then only user can avail extra life
                if(constants.TOTAL_POINT >= 50) {
                    $("#totalGamePoints").text(constants.TOTAL_POINT);
                    $(document).off("click", throwPerl);
                    deactivateEventListener();
                    $("#addLifeConfirmation").show();

                    // this event listener for closing add life confirmation modal
                    $("#closeAddLifeModal").one("click", function(e) {
                        e.stopImmediatePropagation();
                        $(document).one("click", throwPerl);
                        activateEventListener();
                        $("#addLifeConfirmation").hide();
                    });

                    // this event listener for adding extra life
                    $("#confirmAddLife").one("click", function(e) {
                        e.stopImmediatePropagation();
                        $(document).one("click", throwPerl);
                        activateEventListener();
                        constants.TOTAL_POINT -= 50;
                        constants.saveToStorage({
                            point: constants.TOTAL_POINT
                        });
                        $("#addLifeConfirmation").hide();
                        redeemLife();
                    });
                }
                // otherwise no points available msg tooltip will be displayed
                else {
                    $("#noPointTooltip").fadeIn().css("display","block").delay(2000).fadeOut();
                }
            }
        }
    }

    // this is public function for ending game
    function endGame(isNoSaveRequired) {
        deactivateEventListener();
        constants.IS_GAME_END = false;
        // this is updating total point
        constants.TOTAL_POINT += constants.GAME_POINT;
        if(isNoSaveRequired === undefined) {
            constants.saveToStorage({
                point: constants.TOTAL_POINT,
                stat: {
                    coins: constants.GAME_POINT,
                    mode: constants.GAME_MODE+"_"+constants.GAME_DIFFICULTY_LEVEL,
                    time: $("#timeSection").text()
                }
            });
        }
        $(document).off("click", throwPerl);
        constants.waterSound.stop();
        constants.bubbleSound.stop();
        $("#main").load("./views/menu-view.html", function() {
            menuModule.initMenu();
        });
        $(".perl","body").remove();
    }

    // this is for displaying game failed popup
    function gameFailed() {
        deactivateEventListener();
        $(document).off("click", throwPerl);
        timer.stopTimer();
        $("#gameFailedSection").show();
        $("#finalPoints").text(constants.GAME_POINT);
        $("#quitGame").off("click").one("click", function(e){
            e.stopImmediatePropagation();
            endGame();
            $("#gameFailedSection").hide();
        });
    }

    return {
        startGame: startGame,
        endGame: endGame
    }

})();