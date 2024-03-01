function scope1()
    return [[
-- var here is global variable
var = 1
for i = 1, 3 do
-- var here is local variable in for loop
    local var = 2
    -- here print the local var value
    print(var)
end
-- here print the global var value
print(var)
    ]]
end  