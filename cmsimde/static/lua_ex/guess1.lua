function guess1()
    return [[
-- 導入 js 模組
js = require("js")
-- 取得 window
window = js.global
-- 猜小於或等於 n 的整數
big = 100
-- 計算猜測次數, 配合 while 至少會猜一次
num = 1
-- 利用 window:prompt 方法回應取得使用者所猜的整數
guess = window:prompt("請猜一個介於 1 到 "..big.." 的整數")
-- 利用數學模組的 random 函數以亂數產生答案
answer = math.random(big)
output = ""
-- 若沒猜對, 一直猜到對為止
while answer ~= tonumber(guess) do
    if answer > tonumber(guess) then
        output = "猜第 "..num.." 次, guess="..guess..", answer="..answer.." - too small"
        print(output)
    else
        output = "猜第 "..num.." 次, guess="..guess..", answer="..answer.." - too big"
        print(output)
    end 
    guess = window:prompt(output..", 請猜一個介於 1 到 "..big.." 的整數")
    num = num + 1
end
print("總共猜了 "..num.." 次, answer=guess="..answer.." - correct")
    ]]
end