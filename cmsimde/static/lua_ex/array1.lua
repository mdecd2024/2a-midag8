function array1()
    return [[
a = { 11, 22, "foo", "bar" }
a[3] = "foooo"

print(a[1]) -- 11
print(a[3]) -- foooo
print(#a) -- 4
    ]]
end