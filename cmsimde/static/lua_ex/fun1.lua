function fun1()
    -- 多行字串可以利用兩個中括號圈起
    return [[
-- 導入 "js" 模組
local js = require "js"
-- global 就是 javascript 的 window
local global = js.global
local document = global.document
-- html 檔案中 canvas　id 設為 "canvas"
local canvas = document:getElementById("canvas")
-- 將 ctx 設為 canvas 2d 繪圖畫布變數
local ctx = canvas:getContext("2d")

-- 屬性呼叫使用 . 而方法呼叫使用 :
-- 設定填圖顏色
ctx.fillStyle = "rgb(200,0,0)"
-- 設定畫筆顏色
ctx.strokeStyle = "rgb(0,0,200)"

-- 乘上 deg 可轉為徑度單位
deg = math.pi / 180

-- 建立多邊形定點位置畫線函式
function star(radius, xc, yc, n)
    --radius = 100
    --xc = 200
    --yc = 200
    xi = xc + radius*math.cos((360/n)*deg+90*deg)
    yi = yc - radius*math.sin((360/n)*deg+90*deg)
    ctx:beginPath()
    ctx:moveTo(xi,yi)
    for i = 2, n+1 do
        x = xc + radius*math.cos((360/n)*deg*i+90*deg)
        y = yc - radius*math.sin((360/n)*deg*i+90*deg)
        ctx:lineTo(x,y)
    end
end

-- 以下利用多邊形畫線函式呼叫執行畫框線或填入顏色
-- 畫五邊形框線
star(100, 200, 200, 5)
ctx:closePath()
ctx:stroke()

-- 填三角形色塊
star(50, 350, 200, 3)
ctx:closePath()
ctx:fill()

-- 改變畫線顏色後, 畫七邊形框線
ctx.strokeStyle = "rgb(0,200,20)"
star(50, 450, 200, 7)
ctx:closePath()
ctx:stroke()
    ]]
end