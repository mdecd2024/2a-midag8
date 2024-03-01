function flag()
    return [[
-- 導入 "js" 模組
local js = require "js"
-- global 就是 javascript 的 window
local global = js.global
local document = global.document
-- html 檔案中 canvas　id 設為 "canvas"
-- 準備繪圖畫布
local canvas = document:getElementById("canvas")
-- 將 ctx 設為 canvas 2d 繪圖畫布變數
local ctx = canvas:getContext("2d")

-- 以下採用 canvas 原始座標繪圖
flag_w = 600
flag_h = 400
circle_x = flag_w/4
circle_y = flag_h/4

-- 先畫滿地紅
ctx.fillStyle='rgb(255, 0, 0)'
ctx:fillRect(0, 0, flag_w, flag_h)

-- 再畫青天
ctx.fillStyle='rgb(0, 0, 150)'
ctx:fillRect(0, 0, flag_w/2, flag_h/2)

-- 畫十二道光芒白日
ctx:beginPath()
    star_radius = flag_w/8
    angle = 0
    for i = 0, 23 do
        angle = angle + 5*math.pi*2/12
        toX = circle_x + math.cos(angle)*star_radius
        toY = circle_y + math.sin(angle)*star_radius
        -- 只有 i 為 0 時移動到 toX, toY, 其餘都進行 lineTo
        if (i) then
            ctx:lineTo(toX, toY)
        else
            ctx:moveTo(toX, toY)
        end
    end
ctx:closePath()

-- 將填色設為白色
ctx.fillStyle = '#fff'
ctx:fill()

-- 白日:藍圈
ctx:beginPath()
    ctx:arc(circle_x, circle_y, flag_w*17/240, 0, math.pi*2, True)
ctx:closePath()

-- 填色設為藍色
ctx.fillStyle = 'rgb(0, 0, 149)'
ctx:fill()

-- 白日:白心
ctx:beginPath()
    ctx:arc(circle_x, circle_y, flag_w/16, 0, math.pi*2, True)
ctx:closePath()
-- 填色設為白色
ctx.fillStyle = '#fff'
ctx:fill()
    ]]
end