function guess2()
    return [[
-- 利用電腦亂數玩猜數字遊戲
-- 導入 js 模組
js = require("js")
-- 取得 window
window = js.global
execnum = 100
guessnum = 0
playnum = 0
-- 猜小於或等於 n 的整數
for i = 1, execnum do
    small = 1
    big = 100
    -- 計算猜測次數, 配合 while 至少會猜一次
    num = 1
    -- 利用 window:prompt 方法回應取得使用者所猜的整數
    pcguess = math.random(small, big)
    -- guess = window:prompt("請猜一個介於 "..small.." 到 "..big.." 的整數")
    -- 利用數學模組的 random 函數以亂數產生答案
    answer = math.random(small, big)
    output = ""
    playnum = playnum + 1
    print("")
    print("------第 "..playnum.." 次執行")
    print("")
    -- 若沒猜對, 一直猜到對為止
    while answer ~= tonumber(pcguess) do
        if answer > tonumber(pcguess) then
            small = pcguess + 1
            output = "猜第 "..num.." 次, guess="..pcguess..", answer="..answer.." - too small"
            print(output)
        else
            big = pcguess - 1
            output = "猜第 "..num.." 次, guess="..pcguess..", answer="..answer.." - too big"
            print(output)
        end 
        --guess = window:prompt(output..", 請猜一個介於 "..small.." 到 "..big.." 的整數")
        pcguess = math.random(small, big)
        num = num + 1
    end
    print("總共猜了 "..num.." 次, answer=guess="..answer.." - correct")
    guessnum = guessnum + num
end
averagenum = math.floor(guessnum/execnum)
print("----------")
print("平均猜對次數: "..averagenum)
    ]]
end  