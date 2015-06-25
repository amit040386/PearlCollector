var gameModule = (function() {
    "use strict";

    var timer = constants.getTimer();

    // this function is for creating water ripple effect on touching anywhere in the body
    function createPinchRipple(evt) {
        this.initRipple = function(evt) {
            var  $ripple = $("<span class='ripple' style='top:"+evt.pageY+"px;left:"+evt.pageX+"px;'></span>");
            $ripple.appendTo("#gameSection");
            setTimeout(function(){
                $ripple.remove();
            },4050);
        }
    }

    // this function is a main function for throwing the perl and relative calculations
    function throwPerl(evt)  {
        var $perlEle, throwHeight, bottomPos, tempBowlLevel, tempPerlIndex, $containerBowl,
            $bowl = $("#level"+constants.GAME_LEVEL+" .bowl"+constants.BOWL_LEVEL);

        constants.PERL_COLLECTED = false;

        new createPinchRipple().initRipple(evt);

        // this is selecting bowl position and throw height
        if($bowl.prev(".bowl").length > 0) {
            bottomPos = $bowl.offset().bottom;
            throwHeight = (($bowl.prev(".bowl").position().top - $bowl.position().top) + constants.BOWL_HEIGHT + 30);
        } else {
            if(constants.GAME_LEVEL <= 1) {
                bottomPos = 30;
                throwHeight = ($(".perl").eq(0).offset().top - $bowl.position().top + constants.BOWL_HEIGHT + 30);
            } else {
                bottomPos = $bowl.offset().bottom;
                throwHeight = (($bowl.position().top - $bowl.next(".bowl").position().top) + constants.BOWL_HEIGHT + 30);
            }
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
        var p = $perlEle.offset();

        // perl throwing animation attachment with velocity
        $perlEle.velocity({
            bottom: throwHeight,
            left: p.left
        }, {
            duration: 700,
            easing: "easeOutQuad",
            progress: function(element, complete, remaining, start, tweenValue) {
                var p = $perlEle.offset();
                console.log("up left:"+p.left+"; top:"+ p.top);
            }
        }).velocity({
            bottom: bottomPos,
            left: p.left
        }, {
            duration: 500,
            easing: "easeInQuad",
            progress: function(element, complete, remaining, start, tweenValue) {
                var perlPos = $perlEle.offset(), bowl1Pos = $bowl.offset();
                console.log("down fall style:"+$perlEle.attr("style"));
                console.log("downfall left:"+perlPos.left+"; top:"+ perlPos.top);

                // every time it is checked whether it is dropped inside bowl during downfall
                if((bowl1Pos.top+constants.BOWL_HEIGHT) <= (perlPos.top + (constants.PERL_DIAMETER))
                    && (perlPos.top+(constants.PERL_DIAMETER)) >= bowl1Pos.top
                    && (perlPos.left+(constants.PERL_DIAMETER)) >= bowl1Pos.left
                    && (perlPos.left+(constants.PERL_DIAMETER)) <= bowl1Pos.left+constants.BOWL_WIDTH) {

                    $perlEle.velocity("finish");
                    constants.PERL_COLLECTED = true;
                }
            },
            complete: function() {
                $perlEle.removeAttr("style");
                calculatePoints();
                // if bowl is collected perl
                if(constants.PERL_COLLECTED) {
                    $perlEle.appendTo($bowl);

                    // after collecting all perls bowl level will be increased
                    if($bowl.children(".perl").length === 3 ||
                       ($containerBowl && $containerBowl.children(".perl").length === 0 &&
                           $(".perl").parent(".bowl").length > 0)) {

                        constants.BOWL_LEVEL++;
                    }
                    constants.PERL_COLLECTED = false;

                    // after completing all 4 bowl collection, level will be increased
                    if((constants.BOWL_LEVEL > 4 && constants.GAME_LEVEL === 1) ||
                        (constants.BOWL_LEVEL > 5 && constants.GAME_LEVEL > 1)) {

                        constants.BOWL_LEVEL = 2;
                        constants.GAME_LEVEL++;
                        calculatePoints(true);
                    }
                    // attaching click event again to throw the perl for the next time
                    $(document).one("click", throwPerl);

                } else {
                    // pearl will be fell down in difficulty level 2
                    if(constants.GAME_DIFFICULTY_LEVEL > 1 &&
                        (constants.GAME_LEVEL > 1 ||
                        (constants.BOWL_LEVEL > 1 && constants.GAME_LEVEL === 1))) {

                        $perlEle.velocity({
                            bottom: -1000
                        }, {
                            duration: 500,
                            easing: "easeInQuad",
                            complete: function() {
                                $perlEle.appendTo("body");

                                // if all 3 perls are wasted then game is over
                                if($("body").children(".perl").length === 3) {
                                    gameFailed();
                                }
                                // if any one pearl is kept in bowl then level will be increased to continue the game
                                else if($containerBowl.children(".perl").length === 0 &&
                                    $(".perl").parent(".bowl").length > 0) {

                                    constants.BOWL_LEVEL++;
                                }

                                // attaching click event again to throw the perl for the next time
                                $(document).one("click", throwPerl);
                            }
                        });
                    }
                }
            }
        });
    }

    // this is for displaying next level
    function displayNextLevel(bonusPoints) {
        // timer is paused
        timer.pauseTimer();

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
            $("#levelInfo").text("You have collected all pearls.");
            // continue level button will be disabled in this case
            $("#continueGame").hide();
        } else {
            $("#continueGame").off("click").on("click", function(e){
                e.stopImmediatePropagation();
                $("#bonusSection").hide();
                timer.startTimer();
                $("#level"+constants.GAME_LEVEL).addClass("level-entry");
                $("#level"+(constants.GAME_LEVEL-1)).addClass("level-exit");
                $(".perl").appendTo($("#level"+constants.GAME_LEVEL+" .bowl"+constants.BOWL_LEVEL));
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
        } else {
            if(constants.GAME_DIFFICULTY_LEVEL === 1) {
                // for each miss, point will be deducted
                constants.GAME_POINT -= 1;
                printBonusPoint();
            }
        }

        if(isLevelIncreased) {
            // for each level increase, some bonus point will be added as per difficulty level
            var bonusPoints = (constants.BOWL_LEVEL*constants.GAME_DIFFICULTY_LEVEL*constants.GAME_BONUS_POINT);
            constants.GAME_POINT += bonusPoints;
            printBonusPoint();
            displayNextLevel(bonusPoints);
        }
    }

    // for displaying points
    function printBonusPoint() {
        // if somehow, point becomes less than 0 then it always should be 0
        constants.GAME_POINT = ((constants.GAME_POINT < 0) ? 0 : constants.GAME_POINT);
        $("#pointSection").text(constants.GAME_POINT);
        $(".point-section .coins").remove();
        $(".point-section").prepend("<span class='coins highlight'></span>");
    }

    // this is for resetting to all default values
    function resetGame() {
        constants.BOWL_LEVEL = 2;
        constants.GAME_LEVEL = 2;
        constants.GAME_POINT = 0;
        constants.PERL_COLLECTED = false;
        constants.FREE_LIVES = 3;

        // invisible other game levels
        $(".level:not('.level-"+constants.GAME_LEVEL+"')").hide();
        // making visible only first level
        $("#level"+constants.GAME_LEVEL).show();
        $("#pointSection").text("0");
        $("#timeSection").text("00:00");
        $("#freeLiveSection").text(constants.FREE_LIVES);

        // hiding all popups
        $("#gameFailedSection, #bonusSection").hide();

        // removing black font color for time and point section. Black font color will be applied only for level 4
        if(constants.GAME_LEVEL < 4) {
            $("#timeSection, #pointSection").removeClass("black-font-color");
        } else {
            $("#timeSection, #pointSection").addClass("black-font-color");
        }
    }

    // this is a public function for starting game
    function startGame() {
        resetGame();
        constants.GAME_DIFFICULTY_LEVEL = 2;

        // pearl placement as per game level
        if(constants.GAME_LEVEL === 1 && $(".perl-section").children(".perl").length === 0) {
            $(".perl").appendTo($(".perl-section"));
        } else {
            $(".perl").appendTo($("#level"+constants.GAME_LEVEL+" .bowl"+(constants.BOWL_LEVEL-1)));
        }

        // event binding for throwing perl for one time
        $(document).one("click", throwPerl);
        $("#freeLiveSection").parent().off("click").on("click",addLife);
        timer.startTimer();
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
                var $bowl = $("#level"+constants.GAME_LEVEL+" .bowl"+constants.LAST_BOWL_LEVEL);

                // decrease the bowl level after reverting the perl
                if((constants.BOWL_LEVEL-1) > constants.LAST_BOWL_LEVEL) {
                    constants.BOWL_LEVEL--;
                }

                // reverting dropped perl and appended to bowl again
                $("body > .perl:first").appendTo($bowl).removeAttr("style");
            }
            // else it will ask for buying free lives with the cost of earned coins
            else {

            }
        }
    }

    // this is public function for ending game
    function endGame() {
        timer.stopTimer();
    }

    //now endGame() will be called if user click on back btn

    // this is for displaying game failed popup
    function gameFailed() {
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