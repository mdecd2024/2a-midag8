function oop1()
    return [[
local myobj = {}
myobj.__index = myobj

function myobj.new(x)
    local self = setmetatable({}, myobj)
    self.x = x
    return self
end
    
function myobj.method1(self, toprint)
    self.toprint = toprint or self.x
    return self.toprint
end

obj1 = myobj.new("這是內定字串")
print(obj1:method1())
print(obj1:method1("這是 Lua 的物件導向應用!"))

-- 重新定義 myobj 的 method1
function myobj.method1(self, toprint)
    self.toprint = "已經重新定義 method1"
    return self.toprint
end

print(obj1:method1())
    ]]
end