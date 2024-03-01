function gear1()
    return [[
js = require "js"
window = js.global
Array = js.global.Array
canvas = window.document:getElementById("canvas")

-- 將 lua table 轉為 new JavaScript Object 的方法
-- e.g. Object{mykey="myvalue"}
function Object(t)
    local o = js.new(js.global.Object)
    for k, v in pairs(t) do
        assert(type(k) == "string" or js.typeof(k) == "symbol", "JavaScript only has string and symbol keys")
        o[k] = v
    end
    return o
end

-- javascript constructor
cgo = js.new(window.Cango, "canvas")
--local path = js.new(window.Path)
local shape = js.new(window.Shape)
-- Javascript 變數
shapedefs = window.shapeDefs
-- 角度轉為徑度
deg = math.pi/180

function cangoGear(m, n, pa)
    -- pr 為節圓半徑
    pr = n*m/2 -- gear Pitch radius
    data = js.new(window.createGearTooth, m, n, pa)
    gearTooth = js.new(window.Path, data, Object{
      fillColor= "#ddd0dd",
      border= true,
      strokeColor= "#606060" })
    gearTooth:rotate(180/n) -- rotate gear 1/2 tooth to mesh
    gear = gearTooth:dup()
    for i = 1, n-1 do
        newTooth = gearTooth:dup()
        newTooth:rotate(360*i/n)
        gear:appendPath(newTooth)
    end

    -- 建立軸孔
    hr = 0.6*pr -- diameter of gear shaft
    shaft = js.new(window.Path, shapedefs:circle(hr))
    gear:appendPath(shaft)
    return gear
end

n1 = 13
n2 = 24
n3 = 21
reduced_ratio = 0.5
-- 使用 80% 的畫布寬度
m = 0.8*(canvas.width)/((n1+n2+n3)*reduced_ratio)
cx = (canvas.width)/2
cy = (canvas.height)/2
-- 設定共同的壓力角
pa = 25
pr1 = n1*m/2
pr2 = n2*m/2
pr3 = n3*m/2
-- 建立 gear
gear1 = cangoGear(m, n1, pa)
gear2 = cangoGear(m, n2, pa)
gear3 = cangoGear(m, n3, pa)

deg = math.pi/180
rotate_speed = 12*deg

function draw()
    cgo:clearCanvas()

    gear1.transform:translate(cx-(pr1+pr2)*reduced_ratio, cy)
    gear1.transform:scale(reduced_ratio)
    gear1.transform:rotate(0)
    gear1:rotate(rotate_speed)
    cgo:render(gear1)
    
    gear2.transform:translate(cx, cy)
    gear2.transform:scale(reduced_ratio)
    gear2.transform:rotate(180+(360/n2/2))
    gear2:rotate(-(rotate_speed)*n1/n2)
    cgo:render(gear2)
    
    gear3.transform:translate(cx+(pr2+pr3)*reduced_ratio, cy)
    gear3.transform:scale(reduced_ratio)
    gear3.transform:rotate(180+(360/n3/2)+(180+(360/n2/2))*n2/n3)
    gear3:rotate((rotate_speed*n1/n2)*(n2/n3))
    cgo:render(gear3)
end

--draw()
window:setInterval(draw, 2)
    ]]
end