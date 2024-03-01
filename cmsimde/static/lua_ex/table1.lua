function table1()
    return [[
x = 5
a = {} -- empty table
b = { key = x, anotherKey = 10 } -- strings as keys
c = { [x] = b, ["string"] = 10, [34] = 10, [b] = x } -- variables and literals as keys

-- assignment
a[1] = 20
a["foo"] = 50
a[x] = "bar"

-- retrieval
print(b["key"]) -- 5
print(c["string"]) -- 10
print(c[34]) -- 10
print(c[b]) -- 5
    ]]
end