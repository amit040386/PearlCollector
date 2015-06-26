(function(){

    $("[data-localize]").localize(constants.LANG_PATH, { language: constants.SELECTED_LANG });
    var difficulty = 2;

    // starting the game
    gameModule.startGame(difficulty);
})();