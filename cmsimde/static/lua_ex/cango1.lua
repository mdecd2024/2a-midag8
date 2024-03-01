function cango1()
    return [[
-- 導入 "js" 模組
local js = require "js"
-- global 就是 javascript 的 window
local window = js.global
local Array = js.global.Array

-- 將 lua table 轉為 new JavaScript Object 的方法
-- e.g. Object{mykey="myvalue"}
local function Object(t)
    local o = js.new(js.global.Object)
    for k, v in pairs(t) do
        assert(type(k) == "string" or js.typeof(k) == "symbol", "JavaScript only has string and symbol keys")
        o[k] = v
    end
    return o
end

-- javascript constructor
local canvas = js.new(window.Cango, "canvas")
local path = js.new(window.Path)
local shape = js.new(window.Shape)
-- Javascript 變數
shapedefs = window.shapeDefs
-- 角度轉為徑度
deg = math.pi/180
canvas:clearCanvas()

canvas:gridboxPadding(10, 10, 5, 7)
canvas:fillGridbox("lightgreen")
canvas:setWorldCoordsRHC(0, 0, 80)
-- 利用自定義的 Object 函式, 將 Lua Table 轉為 Javascript 物件
canvas:drawText("gc.setWorldCoordsRHC() 設為 Y 向上為正", Object{x=2, y=52, fontSize=23, fillColor="black"})
-- Lua 的 Table 轉為 Javascript Array (在 Python 為數列) 的方法
t = {"M",0,0, "L", 35*math.cos(30*deg), 35*math.sin(30*deg), 0, 0}
-- one way to convert t table to javascript array
--t_js_array = js.global:Array(table.unpack(t))
-- better way
t_js_array = js.global:Array()
t_js_array:splice(0, 0, table.unpack(t))
canvas:drawPath(t_js_array)
    ]]
end