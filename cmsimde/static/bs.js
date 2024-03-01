/*
 * Brython-server default javascript
 * Author: E Dennison
 */
 
/*
 * bsUI
 * 
 * User Interface Functionality
 */
var bsUI = function(){

    const GRAPHICS_COLUMNS = ["col-md-0"];
    
    var editor = null;
    
    function Initialize() {

    }
    
    function setGraphicsMode() {
        $("#graphics-column").attr("class", GRAPHICS_COLUMNS[0]);
        $("#ggame-canvas").height($("#graphics-column").clientHeight);
        $("#ggame-canvas").width($("#graphics-column").clientWidth);
        $("#graphics-column").show();
    }
    
    // Public API
    return {
        init:Initialize,
        graphicsmode:setGraphicsMode,
    }
    
}();
/* END bsUI */