
var LuaMode = ace.require("ace/mode/lua").Mode;
var executeButtons = [];

function createREPL(container) {
    var editor = ace.edit(container.find(".editor")[0]);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode(new LuaMode());
    
    var execute = container.find(".btn-execute");
    executeButtons.push(execute);
    execute.click(function() {
        var output = container.find(".output")[0];
        for (var i = 0; i < executeButtons.length; i++) {
            executeButtons[i].attr("disabled", true);
        }
        window.runLua(editor.getValue(), output);
        for (var i = 0; i < executeButtons.length; i++) {
            executeButtons[i].attr("disabled", false);
        }
    });
    return editor;
}

$(document).ready(function() {
    $(".repl-container").each(function(i, elm) {
        createREPL($(elm));
    });
});