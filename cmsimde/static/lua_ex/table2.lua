function table2()
    return [[
t = { 24, 25, 8, 13, 1, 40 }
table.insert(t, 50) -- inserts 50 at end
table.insert(t, 3, 89) -- inserts 89 at index 3
table.remove(t, 2) -- removes item at index 2
table.sort(t) -- sorts via the < operator
for index, value in ipairs(t) do
    print(index, value)
end
    ]]
end