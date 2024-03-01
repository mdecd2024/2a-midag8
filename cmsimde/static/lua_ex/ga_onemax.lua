function ga_onemax()
    return [[
--
-- A simple genetic algorithm for function optimization, in lua
-- Copyright (c) 2009 Jason Brownlee
--
-- It uses a binary string representation, tournament selection, 
-- one-point crossover, and point mutations. The test problem is 
-- called one max (a string of all ones)
--

-- configuration
problemSize = 64
mutationRate = 0.005
crossoverRate = 0.98
populationSize = 64
maxGenerations = 50
selectionTournamentSize = 3
seed = os.time()

function crossover(a, b) 
	if math.random() > crossoverRate then
		return ""..a
	end
	local cut = math.random(a:len()-1)
	local s = ""
	for i=1, cut do
		s = s..a:sub(i,i)
	end
	for i=cut+1, b:len() do
		s = s..b:sub(i,i)
	end		
	return s
end

function mutation(bitstring)
	local s = ""
	for i=1, bitstring:len() do
		local c = bitstring:sub(i,i)
		if math.random() < mutationRate then		 
			if c == "0" 
			then s = s.."1"
			else s = s.."0" end
		else s = s..c end
	end
	return s
end

function selection(population, fitnesses)
	local pop = {}
	repeat
		local bestString = nil
		local bestFitness = 0
		for i=1, selectionTournamentSize do
			local selection = math.random(#fitnesses)
			if fitnesses[selection] > bestFitness then
				bestFitness = fitnesses[selection]
				bestString = population[selection]
			end
		end
		table.insert(pop, bestString)
	until #pop == #population
	return pop
end

function reproduce(selected)
	local pop = {}
	for i, p1 in ipairs(selected) do
		local p2 = nil
		if (i%2)==0 then p2=selected[i-1] else p2=selected[i+1] end
		child = crossover(p1, p2)
		mutantChild = mutation(child)
		table.insert(pop, mutantChild);
	end
	return pop
end

function fitness(bitstring)
	local cost = 0
	for i=1, bitstring:len() do
		local c = bitstring:sub(i,i)
		if(c == "1") then cost = cost + 1 end
	end
	return cost
end

function random_bitstring(length)
	local s = ""
	while s:len() < length do
		if math.random() < 0.5
		then s = s.."0"
		else s = s.."1" end
	end 
	return s
end

function getBest(currentBest, population, fitnesses) 	
	local bestScore = currentBest==nil and 0 or fitness(currentBest)
	local best = currentBest
	for i,f in ipairs(fitnesses) do
		if(f > bestScore) then
			bestScore = f
			best = population[i]
		end
	end
	return best
end

function evolve()
	local population = {}
	local bestString = nil
	-- initialize the popuation random pool
	for i=1, populationSize do
		table.insert(population, random_bitstring(problemSize))
	end
	-- optimize the population (fixed duration)
	for i=1, maxGenerations do
		-- evaluate
		fitnesses = {}
		for i,v in ipairs(population) do
			table.insert(fitnesses, fitness(v))
		end
		-- update best
		bestString = getBest(bestString, population, fitnesses)
		-- select
		tmpPop = selection(population, fitnesses)		
		-- reproduce
		population = reproduce(tmpPop)
		print(">gen", i, "best cost=", fitness(bestString), bestString, "\n")
	end	
	return bestString
end

-- run
print("Genetic Algorithm on OneMax, with ", _VERSION, "\n")
best = evolve()
print("Finished!\nBest solution found had the fitness of", fitness(best),  best, "\n")
    ]]
end
    